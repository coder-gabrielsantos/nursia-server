import { Router } from 'express';
import { AuthCredential } from '../models/AuthCredential.js';
import { hashPassword, checkPassword, timingSafeEqualStr } from '../utils/passwords.js';

const router = Router();

async function matchRolePassword(role, provided) {
    // .env master
    const master = role === 'admin' ? process.env.ADMIN_KEY : process.env.ACCESS_PASSWORD;
    if (timingSafeEqualStr(provided, master)) return true;

    // BD único por role
    const cred = await AuthCredential.findOne({ role }).select('hash').lean();
    if (cred && await checkPassword(provided, cred.hash)) return true;

    return false;
}

/**
 * POST /auth/login
 * body: { password: string, asAdmin?: boolean }
 * - enfermeiro: aceita ACCESS_PASSWORD (.env) OU BD(role='nurse')
 * - admin:     aceita ADMIN_KEY (.env)       OU BD(role='admin')
 * Retorna accessKey/adminKey do .env (compatível com interceptors do front)
 */
router.post('/login', async (req, res) => {
    try {
        const { password, asAdmin } = req.body || {};
        const ACCESS = process.env.ACCESS_PASSWORD;
        const ADMIN = process.env.ADMIN_KEY;
        if (!ACCESS || !ADMIN) return res.status(500).json({ error: 'Servidor mal configurado (ACCESS_PASSWORD/ADMIN_KEY ausente)' });
        if (!password) return res.status(400).json({ error: 'A senha é obrigatória' });

        if (asAdmin) {
            const ok = await matchRolePassword('admin', password);
            if (!ok) return res.status(401).json({ error: 'Senha de administrador inválida' });
            return res.json({ role: 'admin', accessKey: ACCESS, adminKey: ADMIN });
        }

        const ok = await matchRolePassword('nurse', password);
        if (!ok) return res.status(401).json({ error: 'Senha inválida' });
        return res.json({ role: 'nurse', accessKey: ACCESS });
    } catch {
        return res.status(500).json({ error: 'Falha no login' });
    }
});

/**
 * PUT /auth/password  (ADMIN)
 * body: { target: 'admin'|'nurse', newPassword: string }
 * Efeito: DEFINE/SUBSTITUI a ÚNICA senha desse role no BD (upsert)
 * Obs: NÃO cria múltiplas senhas; mantém 1 documento por role.
 */
router.put('/password', async (req, res) => {
    // Proteja com checkAdmin no arquivo onde você registra as rotas!
    // Ex.: app.use('/auth', checkAdmin, authRouterProtected); (ou aplique checkAdmin aqui)
    try {
        const { target, newPassword } = req.body || {};
        if (!['admin', 'nurse'].includes(target)) {
            return res.status(400).json({ error: "Parâmetro 'target' inválido" });
        }
        if (!newPassword || String(newPassword).length < 4) {
            return res.status(400).json({ error: 'Informe uma senha com pelo menos 4 caracteres' });
        }

        const hash = await hashPassword(newPassword);
        const doc = await AuthCredential.findOneAndUpdate(
            { role: target },
            { $set: { hash } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        ).select('_id role updatedAt createdAt');

        return res.json({ ok: true, id: doc._id, role: doc.role, updatedAt: doc.updatedAt });
    } catch {
        return res.status(500).json({ error: 'Falha ao definir senha' });
    }
});

export default router;
