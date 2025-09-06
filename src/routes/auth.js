import { Router } from 'express';
import crypto from 'crypto';

const router = Router();

function safeEqual(a, b) {
    const A = Buffer.from(String(a || ''), 'utf8');
    const B = Buffer.from(String(b || ''), 'utf8');
    if (A.length !== B.length) return false;
    return crypto.timingSafeEqual(A, B);
}

/**
 * POST /auth/login
 * body: { password: string, asAdmin?: boolean }
 *
 * - asAdmin=false/omitido  => compara com ACCESS_PASSWORD => retorna { role:'nurse', accessKey }
 * - asAdmin=true           => compara com ADMIN_KEY      => retorna { role:'admin', accessKey, adminKey }
 *
 * Observação:
 * Mesmo para admin retornamos accessKey, pois o app aplica checkAccess globalmente.
 */
router.post('/login', (req, res) => {
    const { password, asAdmin } = req.body || {};
    const ACCESS = process.env.ACCESS_PASSWORD;
    const ADMIN = process.env.ADMIN_KEY;

    if (!ACCESS || !ADMIN) {
        return res.status(500).json({ error: 'Server misconfigured (ACCESS_PASSWORD/ADMIN_KEY missing)' });
    }
    if (!password) return res.status(400).json({ error: 'password é obrigatório' });

    if (asAdmin) {
        if (!safeEqual(password, ADMIN)) return res.status(401).json({ error: 'Senha de admin inválida' });
        return res.json({ role: 'admin', accessKey: ACCESS, adminKey: ADMIN });
    }

    if (!safeEqual(password, ACCESS)) return res.status(401).json({ error: 'Senha inválida' });
    return res.json({ role: 'nurse', accessKey: ACCESS });
});

export default router;
