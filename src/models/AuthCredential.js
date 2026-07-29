import mongoose from 'mongoose';

const AuthCredentialSchema = new mongoose.Schema(
    {
        role: {
            type: String,
            enum: ['enfermeiro-caps', 'enfermeiro-unidade', 'admin', 'nurse'],
            required: true,
            unique: true,
        },
        hash: { type: String, required: true },
    },
    { timestamps: true }
);

export const AuthCredential = mongoose.model('AuthCredential', AuthCredentialSchema);
