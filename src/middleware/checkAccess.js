import { findRoleForPassword } from '../services/authCredentials.js';

export async function checkAccess(req, res, next) {
    try {
        const provided = req.header('x-role-key');
        if (!provided) return res.status(401).json({ error: 'Invalid or missing role password' });

        const role = await findRoleForPassword(provided);
        if (!role) return res.status(401).json({ error: 'Invalid or missing role password' });

        req.role = role;
        req.accessGranted = true;
        return next();
    } catch {
        return res.status(500).json({ error: 'Auth check failed' });
    }
}
