import { timingSafeEqualStr } from '../utils/passwords.js';

export async function checkAccess(req, res, next) {
    try {
        const provided = req.header('x-role-key');
        const allowedPasswords = [
            process.env.ENFERMEIRO_CAPS_PASSWORD,
            process.env.ENFERMEIRO_UNIDADE_PASSWORD,
        ];

        if (allowedPasswords.some((password) => !password)) {
            return res.status(500).json({ error: 'Server is misconfigured: nursing passwords missing' });
        }
        if (!provided) return res.status(401).json({ error: 'Invalid or missing role password' });

        if (allowedPasswords.some((password) => timingSafeEqualStr(provided, password))) {
            req.accessGranted = true;
            return next();
        }
        return res.status(401).json({ error: 'Invalid or missing role password' });
    } catch {
        return res.status(500).json({ error: 'Auth check failed' });
    }
}
