import { timingSafeEqualStr } from '../utils/passwords.js';

export async function checkRecordCreator(req, res, next) {
    try {
        const roleKey = req.header('x-role-key');
        const capsPassword = process.env.ENFERMEIRO_CAPS_PASSWORD;

        if (!capsPassword) {
            return res.status(500).json({ error: 'Server is misconfigured: CAPS password missing' });
        }

        if (timingSafeEqualStr(roleKey, capsPassword)) {
            req.role = 'enfermeiro-caps';
            req.canManageRecords = true;
            return next();
        }

        return res.status(403).json({ error: 'Permissao de Enfermeiro CAPS requerida' });
    } catch {
        return res.status(500).json({ error: 'Permission check failed' });
    }
}
