import express from 'express';
import cors from 'cors';
import path from 'path';
import { existsSync } from 'fs';
import { generateProject, getZipPath, listGeneratedProjects, readGeneratedProjectManifest } from './core/generator';

const app = express();
const corsOrigin = process.env.CORS_ORIGIN;

app.use(
  cors({
    origin: corsOrigin ? corsOrigin.split(',').map((origin) => origin.trim()) : true
  })
);
app.use(express.json({ limit: '5mb' }));

app.get('/', (req, res) => {
  res.json({
    status: true,
    service: 'StackForge Studio API'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: true,
    service: 'StackForge Studio API'
  });
});

app.get('/generations', async (req, res, next) => {
  try {
    res.json(await listGeneratedProjects());
  } catch (error) {
    next(error);
  }
});

app.get('/generations/:jobId', async (req, res, next) => {
  try {
    res.json(await readGeneratedProjectManifest(req.params.jobId));
  } catch (error) {
    next(error);
  }
});

app.post('/generate', async (req, res, next) => {
  try {
    const result = await generateProject(req.body);
    res.json({
      status: true,
      message: 'Projet genere avec succes.',
      ...result
    });
  } catch (error) {
    next(error);
  }
});

app.get('/download/:jobId/:fileName', (req, res) => {
  const zipPath = getZipPath(req.params.jobId, req.params.fileName);
  if (!existsSync(zipPath)) {
    return res.status(404).json({ message: 'Archive introuvable.' });
  }
  res.download(zipPath, path.basename(zipPath));
});

app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(error);
  res.status(400).json({
    status: false,
    message: error.message || 'Generation impossible.'
  });
});

const PORT = Number(process.env.PORT || 3001);

export const server = app.listen(PORT, () => {
  console.log(`StackForge Studio API running on http://localhost:${PORT}`);
});
