import { AuthCredential } from '../models/AuthCredential.js';
import { checkPassword, timingSafeEqualStr } from '../utils/passwords.js';

export async function checkRecordCreator(req, res, next) {
    try {
        const roleKey = req.header('x-role-key');
        const expectedCaps = process.env.ENFERMEIRO_CAPS_PASSWORD || process.env.CAPS_PASSWORD;

        if (!expectedCaps) {
            return res.status(500).json({ error: 'Server is misconfigured: CAPS password missing' });
        }

        if (timingSafeEqualStr(roleKey, expectedCaps)) {
            req.role = 'enfermeiro-caps';
            req.canManageRecords = true;
            return next();
        }

        const capsCred = await AuthCredential.findOne({ role: 'enfermeiro-caps' }).select('hash').lean();
        if (capsCred && await checkPassword(roleKey, capsCred.hash)) {
            req.role = 'enfermeiro-caps';
            req.canManageRecords = true;
            return next();
        }

        return res.status(403).json({ error: 'Permissao de Enfermeiro CAPS requerida' });
    } catch {
        return res.status(500).json({ error: 'Permission check failed' });
    }
}
