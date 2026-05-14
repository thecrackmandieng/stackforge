# Modern Ui Check

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
| Customers | `/customers` | Ecran CRUD genere pour la table customers. |

## Documentation backend

| Methode | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/health` | Verifier que le backend genere fonctionne. |
| GET | `/api/customers` | Lister les donnees de customers. |
| GET | `/api/customers/:id` | Lire un element customers par identifiant. |
| POST | `/api/customers` | Creer un element customers. |
| PUT | `/api/customers/:id` | Modifier un element customers. |
| DELETE | `/api/customers/:id` | Supprimer un element customers. |
