import { Router } from 'express';
import { AuthCredential } from '../models/AuthCredential.js';
import { checkPassword, timingSafeEqualStr } from '../utils/passwords.js';

const router = Router();

const CAPS_ROLE = 'enfermeiro-caps';
const UNIDADE_ROLE = 'enfermeiro-unidade';
const VALID_ROLES = [CAPS_ROLE, UNIDADE_ROLE];

async function matchRolePassword(role, provided) {
    const mastersByRole = {
        // ADMIN_KEY é mantida apenas como credencial legada do perfil que alimentava os prontuários.
        [CAPS_ROLE]: [
            process.env.ENFERMEIRO_CAPS_PASSWORD,
            process.env.CAPS_PASSWORD,
            process.env.ADMIN_KEY,
        ],
        // ACCESS_PASSWORD era a senha de consulta antes da separação dos perfis.
        [UNIDADE_ROLE]: [
            process.env.ENFERMEIRO_UNIDADE_PASSWORD,
            process.env.ACCESS_PASSWORD,
        ],
    };

    if ((mastersByRole[role] || []).some((master) => master && timingSafeEqualStr(provided, master))) {
        return true;
    }

    const cred = await AuthCredential.findOne({ role }).select('hash').lean();
    if (cred && await checkPassword(provided, cred.hash)) return true;

    const legacyRole = role === CAPS_ROLE ? 'admin' : role === UNIDADE_ROLE ? 'nurse' : null;
    if (legacyRole) {
        const legacyCred = await AuthCredential.findOne({ role: legacyRole }).select('hash').lean();
        if (legacyCred && await checkPassword(provided, legacyCred.hash)) return true;
    }

    return false;
}

router.post('/login', async (req, res) => {
    try {
        const { password } = req.body || {};
        const ACCESS = process.env.ACCESS_PASSWORD;

        if (!ACCESS) {
            return res.status(500).json({ error: 'Servidor mal configurado: senha de acesso ausente no .env' });
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
