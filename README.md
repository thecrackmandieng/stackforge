# StackForge Studio

Ce depot contient deux projets independants.

## Backend API

Chemin: `backend`

```bash
cd backend
npm install
npm run build
npm start
```

Variables utiles:

- `PORT`: port fourni par Render.
- `CORS_ORIGIN`: URL du frontend, par exemple `https://stackforge-studio.onrender.com`.

Render:

- Root Directory: `backend`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

## Frontend Studio

Chemin: `studio`

```bash
cd studio
npm install
npm run build
npm start
```

Variables utiles:

- `PORT`: port fourni par Render.
- `STACKFORGE_API_URL`: URL du backend, par exemple `https://stackforge-api.onrender.com`.

Render:

- Root Directory: `studio`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

En local:

```bash
cd backend
npm run dev
```

```bash
cd studio
npm run dev
```
