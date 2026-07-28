import { AuthCredential } from '../models/AuthCredential.js';
import { checkPassword, timingSafeEqualStr } from '../utils/passwords.js';

export async function checkRecordCreator(req, res, next) {
    try {
        const roleKey = req.header('x-role-key');
        const capsPasswords = [
            process.env.ENFERMEIRO_CAPS_PASSWORD,
            process.env.CAPS_PASSWORD,
            process.env.ADMIN_KEY,
        ].filter(Boolean);

        if (!capsPasswords.length) {
            return res.status(500).json({ error: 'Server is misconfigured: CAPS password missing' });
        }

        if (capsPasswords.some((password) => timingSafeEqualStr(roleKey, password))) {
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

        const legacyAdminCred = await AuthCredential.findOne({ role: 'admin' }).select('hash').lean();
        if (legacyAdminCred && await checkPassword(roleKey, legacyAdminCred.hash)) {
            req.role = 'enfermeiro-caps';
            req.canManageRecords = true;
            return next();
        }

        return res.status(403).json({ error: 'Permissao de Enfermeiro CAPS requerida' });
    } catch {
        return res.status(500).json({ error: 'Permission check failed' });
    }
}
