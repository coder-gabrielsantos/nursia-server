import { AuthCredential } from '../models/AuthCredential.js';
import { checkPassword, timingSafeEqualStr } from '../utils/passwords.js';

export async function checkRecordCreator(req, res, next) {
    try {
        const adminKey = req.header('x-admin-key');
        const expectedAdmin = process.env.ADMIN_KEY;

        if (!expectedAdmin) {
            return res.status(500).json({ error: 'Server is misconfigured: ADMIN_KEY missing' });
        }

        if (timingSafeEqualStr(adminKey, expectedAdmin)) {
            req.isAdmin = true;
            req.canCreateRecords = true;
            return next();
        }

        const adminCred = await AuthCredential.findOne({ role: 'admin' }).select('hash').lean();
        if (adminCred && await checkPassword(adminKey, adminCred.hash)) {
            req.isAdmin = true;
            req.canCreateRecords = true;
            return next();
        }

        const roleKey = req.header('x-role-key');
        const expectedCaps = process.env.ENFERMEIRO_CAPS_PASSWORD || process.env.CAPS_PASSWORD;

        if (timingSafeEqualStr(roleKey, expectedCaps)) {
            req.role = 'enfermeiro-caps';
            req.canCreateRecords = true;
            return next();
        }

        const capsCred = await AuthCredential.findOne({ role: 'enfermeiro-caps' }).select('hash').lean();
        if (capsCred && await checkPassword(roleKey, capsCred.hash)) {
            req.role = 'enfermeiro-caps';
            req.canCreateRecords = true;
            return next();
        }

        return res.status(403).json({ error: 'Permissao para criar prontuario requerida' });
    } catch {
        return res.status(500).json({ error: 'Permission check failed' });
    }
}
