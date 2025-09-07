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
        return cb(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    // inclua todos os headers customizados que o front usa
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'x-access-password',
        'x-admin-key',
    ],
    optionsSuccessStatus: 204,
}));

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/auth', authRouter);
app.use(checkAccess);
app.use('/records', recordsRouter);
app.use('/ai', aiRouter);

// Export for Vercel serverless
module.exports = app;
