# Jantcouvoir

Projet genere automatiquement par StackForge Studio.

## Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

## Frontend React

```bash
cd frontend
npm install
npm start
```

Le backend expose les routes CRUD sous `http://localhost:3000/api`.

## Demo frontend

- Login: `dieng.tech`
- Mot de passe: `dieng123`
- OTP: demande un code par email ou SMS depuis la page de connexion.
- Page de demarrage: `/login`

## OTP email/SMS

Le backend expose:

- `POST /api/auth/request-otp` avec `{ "recipient": "email@site.com" }` ou `{ "recipient": "+221..." }`
- `POST /api/auth/verify-otp` avec `{ "recipient": "...", "code": "123456" }`

Configure `.env` pour envoyer les codes:

- Email SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`
- SMS Twilio: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM`

Si aucun fournisseur n'est configure, le code OTP est affiche dans les logs backend en mode developpement.

## Ecrans frontend

| Ecran | Route | Description |
| --- | --- | --- |
| Connexion | `/login` | Connexion demo avec login dieng.tech, mot de passe dieng123 ou OTP envoye par email/SMS. |
| Demo | `/demo` | Vue centrale pour ouvrir tous les ecrans generes. |
| Users | `/users` | Ecran CRUD genere pour la table users. |
| Products | `/products` | Ecran CRUD genere pour la table products. |

## Documentation backend

| Methode | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/health` | Verifier que le backend genere fonctionne. |
| POST | `/api/auth/request-otp` | Generer et envoyer un code OTP par email ou SMS. |
| POST | `/api/auth/verify-otp` | Verifier un code OTP envoye a un email ou telephone. |
| GET | `/api/users` | Lister les donnees de users. |
| GET | `/api/users/:id` | Lire un element users par identifiant. |
| POST | `/api/users` | Creer un element users. |
| PUT | `/api/users/:id` | Modifier un element users. |
| DELETE | `/api/users/:id` | Supprimer un element users. |
| GET | `/api/products` | Lister les donnees de products. |
| GET | `/api/products/:id` | Lire un element products par identifiant. |
| POST | `/api/products` | Creer un element products. |
| PUT | `/api/products/:id` | Modifier un element products. |
| DELETE | `/api/products/:id` | Supprimer un element products. |
