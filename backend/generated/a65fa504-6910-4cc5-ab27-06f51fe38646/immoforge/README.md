# Immoforge

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
| Categorie | `/categorie` | Ecran CRUD genere pour la table categorie. |
| Utilisateur | `/utilisateur` | Ecran CRUD genere pour la table utilisateur. |

## Documentation backend

| Methode | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/health` | Verifier que le backend genere fonctionne. |
| GET | `/api/categorie` | Lister les donnees de categorie. |
| GET | `/api/categorie/:id` | Lire un element categorie par identifiant. |
| POST | `/api/categorie` | Creer un element categorie. |
| PUT | `/api/categorie/:id` | Modifier un element categorie. |
| DELETE | `/api/categorie/:id` | Supprimer un element categorie. |
| GET | `/api/utilisateur` | Lister les donnees de utilisateur. |
| GET | `/api/utilisateur/:id` | Lire un element utilisateur par identifiant. |
| POST | `/api/utilisateur` | Creer un element utilisateur. |
| PUT | `/api/utilisateur/:id` | Modifier un element utilisateur. |
| DELETE | `/api/utilisateur/:id` | Supprimer un element utilisateur. |
