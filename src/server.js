import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { connectDB } from './db.js';
import { checkAccess } from './middleware/checkAccess.js';
import recordsRouter from './routes/records.js';

const app = express();

// Basic security & JSON
app.use(helmet());
app.use(express.json());

// CORS: ajuste os domínios do seu front
const allowedOrigins = [
    // 'https://seu-front.vercel.app',
    // 'http://localhost:5173'
];
app.use(cors({
    origin(origin, cb) {
        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return cb(null, true);
        return cb(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

// Health check (sem exigir senha — útil para monitoramento interno)
app.get('/health', (req, res) => res.json({ ok: true }));

// A partir daqui, TODAS as rotas exigem a senha de acesso
app.use(checkAccess);

// Rotas de registros de enfermagem
app.use('/records', recordsRouter);

// Start
const port = process.env.PORT || 4000;
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
    console.error('MONGO_URI missing in .env');
    process.exit(1);
}

connectDB(mongoUri).then(() => {
    app.listen(port, () => console.log(`[API] Listening on :${port}`));
});
