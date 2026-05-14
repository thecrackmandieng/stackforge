# Otp Ionic Check

Projet genere automatiquement par StackForge Studio.

## Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

## Frontend Angular/Ionic

```bash
cd frontend
npm install
npm start
```

Le backend expose les routes CRUD sous `http://localhost:3000/api`.

## Demo frontend

- Login: `dieng.tech`
- Mot de passe: `dieng123`
- Code OTP: `123456`
- Page de demarrage: `/login`

## Ecrans frontend

| Ecran | Route | Description |
| --- | --- | --- |
| Connexion | `/login` | Connexion demo avec login dieng.tech, mot de passe dieng123 ou OTP 123456. |
| Demo | `/demo` | Vue centrale pour ouvrir tous les ecrans generes. |
| Clients | `/clients` | Ecran CRUD genere pour la table clients. |

## Documentation backend

| Methode | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/health` | Verifier que le backend genere fonctionne. |
| GET | `/api/clients` | Lister les donnees de clients. |
| GET | `/api/clients/:id` | Lire un element clients par identifiant. |
| POST | `/api/clients` | Creer un element clients. |
| PUT | `/api/clients/:id` | Modifier un element clients. |
| DELETE | `/api/clients/:id` | Supprimer un element clients. |
