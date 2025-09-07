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

app.use(cors({
    origin: "*",
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'x-access-password',
        'x-admin-key',
    ],
}));

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/auth', authRouter);
app.use(checkAccess);
app.use('/records', recordsRouter);
app.use('/ai', aiRouter);

// Export for Vercel serverless
module.exports = app;
