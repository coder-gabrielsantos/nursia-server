import { AuthCredential } from '../models/AuthCredential.js';
import { checkPassword, hashPassword, timingSafeEqualStr } from '../utils/passwords.js';

export const CAPS_ROLE = 'enfermeiro-caps';
export const UNIDADE_ROLE = 'enfermeiro-unidade';
export const VALID_ROLES = [CAPS_ROLE, UNIDADE_ROLE];

const LEGACY_ROLES = {
    [CAPS_ROLE]: 'admin',
    [UNIDADE_ROLE]: 'nurse',
};

function getInitialPassword(role) {
    if (role === CAPS_ROLE) return process.env.ENFERMEIRO_CAPS_PASSWORD;
    if (role === UNIDADE_ROLE) return process.env.ENFERMEIRO_UNIDADE_PASSWORD;
    return undefined;
}

async function findStoredCredential(role) {
    const credentials = await AuthCredential.find({
        role: { $in: [role, LEGACY_ROLES[role]] },
    }).select('role hash').lean();

    return credentials.find((credential) => credential.role === role)
        || credentials.find((credential) => credential.role === LEGACY_ROLES[role])
        || null;
}

export async function matchesRolePassword(role, password) {
    if (!VALID_ROLES.includes(role) || !password) return false;

    const storedCredential = await findStoredCredential(role);
    if (storedCredential?.hash?.startsWith('scrypt:')) {
        return checkPassword(password, storedCredential.hash);
    }

    const initialPassword = getInitialPassword(role);
    return Boolean(initialPassword && timingSafeEqualStr(password, initialPassword));
}

export async function findRoleForPassword(password) {
    for (const role of VALID_ROLES) {
        if (await matchesRolePassword(role, password)) return role;
    }
    return null;
}

export async function replaceRolePasswords(passwordsByRole) {
    const entries = Object.entries(passwordsByRole)
        .filter(([role, password]) => VALID_ROLES.includes(role) && password);

    const credentials = await Promise.all(
        entries.map(async ([role, password]) => ({
            role,
            hash: await hashPassword(password),
        }))
    );

    if (credentials.length === 0) return;

    await AuthCredential.bulkWrite(
        credentials.map(({ role, hash }) => ({
            updateOne: {
                filter: { role },
                update: { $set: { hash } },
                upsert: true,
            },
        }))
    );
}
