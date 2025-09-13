import { AuthCredential } from '../models/AuthCredential.js';
import { checkPassword, timingSafeEqualStr } from '../utils/passwords.js';

export async function checkAdmin(req, res, next) {
    try {
        const provided = req.header('x-admin-key');
        const expected = process.env.ADMIN_KEY;
        if (!expected) return res.status(500).json({ error: 'Server is misconfigured: ADMIN_KEY missing' });
        if (!provided) return res.status(403).json({ error: 'Admin key required' });

        // .env master
        if (timingSafeEqualStr(provided, expected)) {
            req.isAdmin = true;
            return next();
        }
        // BD (única senha admin)
        const cred = await AuthCredential.findOne({ role: 'admin' }).select('hash').lean();
        if (cred && await checkPassword(provided, cred.hash)) {
            req.isAdmin = true;
            return next();
        }
        return res.status(403).json({ error: 'Admin key required' });
    } catch {
        return res.status(500).json({ error: 'Admin check failed' });
    }
}
