import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { connectDB } from './db.js';
import { checkAccess } from './middleware/checkAccess.js';
import recordsRouter from './routes/records.js';
import authRouter from './routes/auth.js';

const app = express();

// Segurança básica & JSON
app.use(helmet());
app.use(express.json());

// CORS — ajuste a origem do teu front
const allowedOrigins = [
    // 'https://seu-front.vercel.app',
    // 'http://localhost:5173'
];
app.use(cors({
    origin(origin, cb) {
        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return cb(null, true);
        return cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));

// Health (sem senha)
app.get('/health', (req, res) => res.json({ ok: true }));

// LOGIN PÚBLICO (uma senha + checkbox)
app.use('/auth', authRouter);

// Daqui pra baixo, tudo exige x-access-password
app.use(checkAccess);

// Rotas de registros
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
