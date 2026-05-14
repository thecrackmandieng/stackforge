import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import categorieRoutes from './routes/categorie.routes.js';
import utilisateurRoutes from './routes/utilisateur.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: true, service: 'Imof API' });
});

app.use('/api/categorie', categorieRoutes);
app.use('/api/utilisateur', utilisateurRoutes);

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({
    message: error.message || 'Erreur serveur'
  });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`Imof backend running on http://localhost:${port}`);
});
