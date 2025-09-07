import 'dotenv/config';
import { connectDB } from './src/db.js';
import app from './src/app.js';

let ready = false;

export default async function handler(req, res) {
    if (!ready) {
        const uri = process.env.MONGO_URI;
        if (!uri) return res.status(500).json({ error: 'MONGO_URI not set' });
        await connectDB(uri);
        ready = true;
    }
    return app(req, res);
}
