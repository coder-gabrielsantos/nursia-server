import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { checkAccess } from './middleware/checkAccess.js';
import recordsRouter from './routes/records.js';
import authRouter from './routes/auth.js';
import aiRouter from './routes/ai.js';
import 'dotenv/config';

const app = express();

const allowedOrigins = [
    'https://nursia.vercel.app', // produção
    'http://localhost:5173',     // dev (Vite)
];

const corsOptions = {
    origin: (origin, cb) => {
        // permite tools/script locais (sem origin) e os domínios liberados
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
        return cb(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'x-access-password',
        'x-admin-key',
    ],
    credentials: true,               // se for usar cookies/credenciais
    optionsSuccessStatus: 204,       // evita 3xx/4xx em preflight
    preflightContinue: false,
};

// CORS deve vir BEM no início
app.use(cors(corsOptions));
// Responde o preflight sem redirecionar
app.options('*', cors(corsOptions));

app.use(helmet());
app.use(express.json({ limit: '15mb' }));

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/auth', authRouter);
app.use(checkAccess);
app.use('/records', recordsRouter);
app.use('/ai', aiRouter);

export default app; // use ESM de ponta a ponta
