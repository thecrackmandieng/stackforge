import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import usersRoutes from './routes/users.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: true, service: 'Click Fix Check API' });
});

app.use('/api/users', usersRoutes);

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({
    message: error.message || 'Erreur serveur'
  });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`Click Fix Check backend running on http://localhost:${port}`);
});
