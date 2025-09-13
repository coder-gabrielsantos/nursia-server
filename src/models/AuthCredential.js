import mongoose from 'mongoose';

const AuthCredentialSchema = new mongoose.Schema({
    role: { type: String, enum: ['nurse', 'admin'], required: true, unique: true },
    hash: { type: String, required: true },
}, { timestamps: true });

AuthCredentialSchema.index({ role: 1 }, { unique: true });

export const AuthCredential = mongoose.model('AuthCredential', AuthCredentialSchema);
