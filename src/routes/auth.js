import { Router } from 'express';
import {
    CAPS_ROLE,
    UNIDADE_ROLE,
    findRoleForPassword,
    matchesRolePassword,
    replaceRolePasswords,
} from '../services/authCredentials.js';

const router = Router();

router.post('/login', async (req, res) => {
    try {
        const { password } = req.body || {};

        if (!password) return res.status(400).json({ error: 'A senha e obrigatoria' });

        const role = await findRoleForPassword(password);
        if (!role) return res.status(401).json({ error: 'Senha invalida' });

        return res.json({ role, roleKey: password });
    } catch {
        return res.status(500).json({ error: 'Falha no login' });
    }
});

router.put('/passwords', async (req, res) => {
    try {
        const provided = req.header('x-role-key');
        const isCapsAccess = await matchesRolePassword(CAPS_ROLE, provided);
        if (!isCapsAccess) {
            return res.status(403).json({ error: 'Permissao de Enfermeiro CAPS requerida' });
        }

        const capsPassword = String(req.body?.capsPassword || '').trim();
        const unidadePassword = String(req.body?.unidadePassword || '').trim();
        const providedPasswords = [capsPassword, unidadePassword].filter(Boolean);

        if (providedPasswords.length === 0) {
            return res.status(400).json({ error: 'Informe ao menos uma senha para alterar' });
        }
        if (providedPasswords.some((password) => password.length < 4)) {
            return res.status(400).json({ error: 'As senhas devem ter pelo menos 4 caracteres' });
        }
        if (capsPassword && unidadePassword && capsPassword === unidadePassword) {
            return res.status(400).json({ error: 'Use senhas diferentes para os dois acessos' });
        }
        if (
            (capsPassword && !unidadePassword && await matchesRolePassword(UNIDADE_ROLE, capsPassword))
            || (unidadePassword && !capsPassword && await matchesRolePassword(CAPS_ROLE, unidadePassword))
        ) {
            return res.status(400).json({ error: 'A nova senha deve ser diferente da senha do outro acesso' });
        }

        await replaceRolePasswords({
            [CAPS_ROLE]: capsPassword,
            [UNIDADE_ROLE]: unidadePassword,
        });

        return res.json({
            ok: true,
            roleKey: capsPassword || provided,
        });
    } catch {
        return res.status(500).json({ error: 'Falha ao alterar as senhas' });
    }
});

export default router;
