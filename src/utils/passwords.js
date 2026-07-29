import crypto from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(crypto.scrypt);
const KEY_LENGTH = 64;

export function timingSafeEqualStr(a, b) {
    const A = Buffer.from(String(a || ''), 'utf8');
    const B = Buffer.from(String(b || ''), 'utf8');
    if (A.length !== B.length) return false;
    return crypto.timingSafeEqual(A, B);
}

export async function hashPassword(password) {
    const salt = crypto.randomBytes(16);
    const derivedKey = await scrypt(String(password), salt, KEY_LENGTH);
    return `scrypt:${salt.toString('hex')}:${derivedKey.toString('hex')}`;
}

export async function checkPassword(password, storedHash) {
    const [algorithm, saltHex, hashHex] = String(storedHash || '').split(':');
    if (algorithm !== 'scrypt' || !saltHex || !hashHex) return false;

    try {
        const expected = Buffer.from(hashHex, 'hex');
        const derivedKey = await scrypt(
            String(password),
            Buffer.from(saltHex, 'hex'),
            expected.length
        );
        return crypto.timingSafeEqual(derivedKey, expected);
    } catch {
        return false;
    }
}
