import crypto from 'crypto';

function safeEqual(a, b) {
    // Avoid timing attacks by using timingSafeEqual when lengths match
    const ab = Buffer.from(String(a || ''), 'utf8');
    const bb = Buffer.from(String(b || ''), 'utf8');
    if (ab.length !== bb.length) return false;
    return crypto.timingSafeEqual(ab, bb);
}

/**
 * Blocks the request if the provided x-access-password header
 * doesn't match process.env.ACCESS_PASSWORD
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
    // Optionally tag request
    req.accessGranted = true;
    next();
}
