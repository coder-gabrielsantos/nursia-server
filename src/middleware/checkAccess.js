import { AuthCredential } from '../models/AuthCredential.js';
import { checkPassword, timingSafeEqualStr } from '../utils/passwords.js';

export async function checkAccess(req, res, next) {
    try {
        const provided = req.header('x-access-password');
        const expected = process.env.ACCESS_PASSWORD;
        if (!expected) return res.status(500).json({ error: 'Server is misconfigured: ACCESS_PASSWORD missing' });
        if (!provided) return res.status(401).json({ error: 'Invalid or missing access password' });

        // .env master
        if (timingSafeEqualStr(provided, expected)) {
            req.accessGranted = true;
            return next();
        }
        // BD (única senha nurse)
        const cred = await AuthCredential.findOne({ role: 'nurse' }).select('hash').lean();
        if (cred && await checkPassword(provided, cred.hash)) {
            req.accessGranted = true;
            return next();
        }
        return res.status(401).json({ error: 'Invalid or missing access password' });
    } catch {
        return res.status(500).json({ error: 'Auth check failed' });
    }
}
