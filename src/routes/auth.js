import { Router } from 'express';
import { timingSafeEqualStr } from '../utils/passwords.js';

const router = Router();

const CAPS_ROLE = 'enfermeiro-caps';
const UNIDADE_ROLE = 'enfermeiro-unidade';
const VALID_ROLES = [CAPS_ROLE, UNIDADE_ROLE];

router.post('/login', async (req, res) => {
    try {
        const { password } = req.body || {};
        const passwordsByRole = {
            [CAPS_ROLE]: process.env.ENFERMEIRO_CAPS_PASSWORD,
            [UNIDADE_ROLE]: process.env.ENFERMEIRO_UNIDADE_PASSWORD,
        };

        if (!passwordsByRole[CAPS_ROLE] || !passwordsByRole[UNIDADE_ROLE]) {
            return res.status(500).json({ error: 'Servidor mal configurado: senhas dos perfis ausentes no .env' });
        }
        if (!password) return res.status(400).json({ error: 'A senha e obrigatoria' });

        const role = req.body?.role || UNIDADE_ROLE;
        if (!VALID_ROLES.includes(role)) {
            return res.status(400).json({ error: "Parametro 'role' invalido" });
        }

        const ok = timingSafeEqualStr(password, passwordsByRole[role]);
        if (!ok) return res.status(401).json({ error: 'Senha invalida' });
        return res.json({ role, roleKey: password });
    } catch {
        return res.status(500).json({ error: 'Falha no login' });
    }
});

export default router;
