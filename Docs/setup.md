# Setup

## Backend (Express + JWT)

```bash
cd Backend
cp .env.example .env   # then set JWT_SECRET and SEED_ADMIN_PASSWORD
npm install
npm run dev            # http://localhost:5004
npm test
```

Data is stored in `Backend/data.json` (git-ignored, created on first start).
The seeded admin user comes from `SEED_ADMIN_USERNAME` / `SEED_ADMIN_PASSWORD`.

### API

| Method | Path                 | Auth   | Description                  |
| ------ | -------------------- | ------ | ---------------------------- |
| POST   | `/api/auth/register` | –      | Register, returns JWT        |
| POST   | `/api/auth/login`    | –      | Login, returns JWT           |
| GET    | `/api/auth/me`       | Bearer | Current user                 |
| GET    | `/api/users`         | Bearer | List users                   |
| POST   | `/api/users`         | Bearer | Create a new user            |

Validation: username required, password minimum 6 characters.

## Admin frontend (React + Vite)

```bash
cd Admin-frontend
cp .env.example .env   # VITE_API_URL points at the backend
npm install
npm run dev            # http://localhost:5003
npm test
```
