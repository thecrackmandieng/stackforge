import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import clientsRoutes from './routes/clients.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: true, service: 'Test Angular Choice API' });
});

app.use('/api/clients', clientsRoutes);

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({
    message: error.message || 'Erreur serveur'
  });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`Test Angular Choice backend running on http://localhost:${port}`);
});
