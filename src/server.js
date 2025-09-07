import 'dotenv/config';
import { connectDB } from './db.js';
import app from './app.js';

const port = process.env.PORT || 4000;
const uri = process.env.MONGO_URI;

if (!uri) {
    console.error('MONGO_URI missing in .env');
    process.exit(1);
}

connectDB(uri).then(() => {
    app.listen(port, () => console.log(`[API] Listening on :${port}`));
});
