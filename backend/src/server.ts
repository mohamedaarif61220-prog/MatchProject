import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import aiRoutes from './routes/ai';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend development proxy
app.use(cors());

// Parse JSON request payloads
app.use(express.json());

// API route registrations
app.use('/api', aiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'projectmatch-backend' });
});

// Boot listener
const server = app.listen(PORT, () => {
  console.log(`ProjectMatch Express backend listening on http://localhost:${PORT}`);
});

export default app;
