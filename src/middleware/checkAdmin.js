import crypto from 'crypto';

function safeEqual(a, b) {
    const ab = Buffer.from(String(a || ''), 'utf8');
    const bb = Buffer.from(String(b || ''), 'utf8');
    if (ab.length !== bb.length) return false;
    return crypto.timingSafeEqual(ab, bb);
}

/**
 * Permite apenas se x-admin-key corresponder a ADMIN_KEY
 */
export function checkAdmin(req, res, next) {
    const provided = req.header('x-admin-key');
    const expected = process.env.ADMIN_KEY;

    if (!expected) {
        return res.status(500).json({ error: 'Server is misconfigured: ADMIN_KEY missing' });
    }
    if (!provided || !safeEqual(provided, expected)) {
        return res.status(403).json({ error: 'Admin key required' });
    }
    req.isAdmin = true;
    next();
}
