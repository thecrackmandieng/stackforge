# Click Fix Check

Projet genere automatiquement par StackForge Studio.

## Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

## Frontend

```bash
cd frontend
npm install
npm start
```

Le backend expose les routes CRUD sous `http://localhost:3000/api`.

## Demo frontend

- Login: `dieng.tech`
- Mot de passe: `dieng123`
- Page de demarrage: `/login`

## Ecrans frontend

| Ecran | Route | Description |
| --- | --- | --- |
| Connexion | `/login` | Connexion demo avec login dieng.tech et mot de passe dieng123. |
| Demo | `/demo` | Vue centrale pour ouvrir tous les ecrans generes. |
| Users | `/users` | Ecran CRUD genere pour la table users. |

## Documentation backend

| Methode | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/health` | Verifier que le backend genere fonctionne. |
| GET | `/api/users` | Lister les donnees de users. |
| GET | `/api/users/:id` | Lire un element users par identifiant. |
| POST | `/api/users` | Creer un element users. |
| PUT | `/api/users/:id` | Modifier un element users. |
| DELETE | `/api/users/:id` | Supprimer un element users. |
