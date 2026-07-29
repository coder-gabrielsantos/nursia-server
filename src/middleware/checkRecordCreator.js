import { CAPS_ROLE, matchesRolePassword } from '../services/authCredentials.js';

export async function checkRecordCreator(req, res, next) {
    try {
        const roleKey = req.header('x-role-key');
        if (await matchesRolePassword(CAPS_ROLE, roleKey)) {
            req.role = CAPS_ROLE;
            req.canManageRecords = true;
            return next();
        }

        return res.status(403).json({ error: 'Permissao de Enfermeiro CAPS requerida' });
    } catch {
        return res.status(500).json({ error: 'Permission check failed' });
    }
}
