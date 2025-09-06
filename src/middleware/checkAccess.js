import crypto from 'crypto';

function safeEqual(a, b) {
    const ab = Buffer.from(String(a || ''), 'utf8');
    const bb = Buffer.from(String(b || ''), 'utf8');
    if (ab.length !== bb.length) return false;
    return crypto.timingSafeEqual(ab, bb);
}

/**
 * Bloqueia se o cabeçalho x-access-password não corresponder a ACCESS_PASSWORD
 */
export function checkAccess(req, res, next) {
    const provided = req.header('x-access-password');
    const expected = process.env.ACCESS_PASSWORD;

    if (!expected) {
        return res.status(500).json({ error: 'Server is misconfigured: ACCESS_PASSWORD missing' });
    }
    if (!provided || !safeEqual(provided, expected)) {
        return res.status(401).json({ error: 'Invalid or missing access password' });
    }
    req.accessGranted = true;
    next();
}
