import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { checkAccess } from './middleware/checkAccess.js';
import recordsRouter from './routes/records.js';
import authRouter from './routes/auth.js';
import aiRouter from './routes/ai.js';
import 'dotenv/config';

const app = express();

app.use(helmet());
app.use(express.json({ limit: '15mb' }));

// CORS – inclua seu front de produção + localhost
const allowedOrigins = [
    'https://nursia.vercel.app',
    'http://localhost:5173',
];

app.use(cors({
    origin(origin, cb) {
        if (!origin || allowedOrigins.includes(origin)) {
            return cb(null, true);
        }
        return cb(null, false); // não lança erro, apenas bloqueia CORS
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
}));

// Health sem autenticação
app.get('/health', (_req, res) => res.json({ ok: true }));

// Auth pública (uma senha + checkbox admin)
app.use('/auth', authRouter);

// A partir daqui exige x-access-password
app.use(checkAccess);

// Registros
app.use('/records', recordsRouter);

// IA
app.use('/ai', aiRouter);

export default app;
