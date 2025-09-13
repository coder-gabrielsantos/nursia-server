import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export function timingSafeEqualStr(a, b) {
    const A = Buffer.from(String(a || ''), 'utf8');
    const B = Buffer.from(String(b || ''), 'utf8');
    if (A.length !== B.length) return false;
    return crypto.timingSafeEqual(A, B);
}

export async function hashPassword(plain) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(String(plain), salt);
}

export async function checkPassword(plain, hash) {
    return bcrypt.compare(String(plain), String(hash));
}
