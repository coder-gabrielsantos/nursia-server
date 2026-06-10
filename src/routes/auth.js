import { Router } from 'express';
import { AuthCredential } from '../models/AuthCredential.js';
import { checkAdmin } from '../middleware/checkAdmin.js';
import { hashPassword, checkPassword, timingSafeEqualStr } from '../utils/passwords.js';

const router = Router();

const ADMIN_ROLE = 'admin';
const CAPS_ROLE = 'enfermeiro-caps';
const UNIDADE_ROLE = 'enfermeiro-unidade';
const VALID_ROLES = [ADMIN_ROLE, CAPS_ROLE, UNIDADE_ROLE];

async function matchRolePassword(role, provided) {
    const masterByRole = {
        [ADMIN_ROLE]: process.env.ADMIN_KEY,
        [CAPS_ROLE]: process.env.ENFERMEIRO_CAPS_PASSWORD || process.env.CAPS_PASSWORD,
        [UNIDADE_ROLE]: process.env.ENFERMEIRO_UNIDADE_PASSWORD || process.env.ACCESS_PASSWORD,
        nurse: process.env.ENFERMEIRO_UNIDADE_PASSWORD || process.env.ACCESS_PASSWORD,
    };

    if (timingSafeEqualStr(provided, masterByRole[role])) return true;

    const cred = await AuthCredential.findOne({ role }).select('hash').lean();
    if (cred && await checkPassword(provided, cred.hash)) return true;

    if (role === UNIDADE_ROLE) {
        const legacyCred = await AuthCredential.findOne({ role: 'nurse' }).select('hash').lean();
        if (legacyCred && await checkPassword(provided, legacyCred.hash)) return true;
    }

    return false;
}

router.post('/login', async (req, res) => {
    try {
        const { password, asAdmin } = req.body || {};
        const ACCESS = process.env.ACCESS_PASSWORD;
        const ADMIN = process.env.ADMIN_KEY;
        const CAPS = process.env.ENFERMEIRO_CAPS_PASSWORD || process.env.CAPS_PASSWORD;
        const UNIDADE = process.env.ENFERMEIRO_UNIDADE_PASSWORD || process.env.ACCESS_PASSWORD;

        if (!ACCESS || !ADMIN || !CAPS || !UNIDADE) {
            return res.status(500).json({ error: 'Servidor mal configurado: senhas de acesso ausentes no .env' });
        }
        if (!password) return res.status(400).json({ error: 'A senha e obrigatoria' });

        const requestedRole = asAdmin ? ADMIN_ROLE : (req.body?.role || UNIDADE_ROLE);
        const role = requestedRole === 'administrador' ? ADMIN_ROLE : requestedRole;
        if (!VALID_ROLES.includes(role)) {
            return res.status(400).json({ error: "Parametro 'role' invalido" });
        }

        if (role === ADMIN_ROLE) {
            const ok = await matchRolePassword(ADMIN_ROLE, password);
            if (!ok) return res.status(401).json({ error: 'Senha de administrador invalida' });
            return res.json({ role: ADMIN_ROLE, accessKey: ACCESS, adminKey: ADMIN });
        }

        const ok = await matchRolePassword(role, password);
        if (!ok) return res.status(401).json({ error: 'Senha invalida' });
        return res.json({ role, accessKey: ACCESS, roleKey: password });
    } catch {
        return res.status(500).json({ error: 'Falha no login' });
    }
});

router.put('/password', checkAdmin, async (req, res) => {
    try {
        const { target, newPassword } = req.body || {};
        if (!VALID_ROLES.includes(target)) {
            return res.status(400).json({ error: "Parametro 'target' invalido" });
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
