import { Router } from 'express';
import { AuthCredential } from '../models/AuthCredential.js';
import { checkPassword, timingSafeEqualStr } from '../utils/passwords.js';

const router = Router();

const CAPS_ROLE = 'enfermeiro-caps';
const UNIDADE_ROLE = 'enfermeiro-unidade';
const VALID_ROLES = [CAPS_ROLE, UNIDADE_ROLE];

async function matchRolePassword(role, provided) {
    const masterByRole = {
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
        const { password } = req.body || {};
        const ACCESS = process.env.ACCESS_PASSWORD;
        const CAPS = process.env.ENFERMEIRO_CAPS_PASSWORD || process.env.CAPS_PASSWORD;
        const UNIDADE = process.env.ENFERMEIRO_UNIDADE_PASSWORD || process.env.ACCESS_PASSWORD;

        if (!ACCESS || !CAPS || !UNIDADE) {
            return res.status(500).json({ error: 'Servidor mal configurado: senhas de acesso ausentes no .env' });
        }
        if (!password) return res.status(400).json({ error: 'A senha e obrigatoria' });

        const role = req.body?.role || UNIDADE_ROLE;
        if (!VALID_ROLES.includes(role)) {
            return res.status(400).json({ error: "Parametro 'role' invalido" });
        }

        const ok = await matchRolePassword(role, password);
        if (!ok) return res.status(401).json({ error: 'Senha invalida' });
        return res.json({ role, accessKey: ACCESS, roleKey: password });
    } catch {
        return res.status(500).json({ error: 'Falha no login' });
    }
});

export default router;
