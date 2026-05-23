# Deployment guide — Sovereign Ledger

Test everything **locally first**, then deploy to **Vercel** (or any Node host).

---

## Part 1 — Local testing (do this first)

### 1. Environment

```bash
cp backend/.env.example backend/.env
# Edit backend/.env: DATABASE_URL, JWT_SECRET, ZOHO_* (already set if you configured earlier)
```

### 2. Install & database

```bash
npm run install:all
cd backend && npx prisma generate && npx prisma db push
```

### 3. Run both servers

```bash
# From project root
npm run dev
```

| Service  | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Backend  | http://localhost:5001 |
| Health   | http://localhost:5001/health |

### 4. Smoke test checklist

- [ ] `GET /health` returns `"database": "connected"`
- [ ] Register / login works
- [ ] Create vendor → request → approve → generate PO
- [ ] **Settings → Connect Zoho Books**
- [ ] Copy webhook URL → paste in Zoho Books (optional for local)

### 5. Production-mode check on your machine (optional)

```bash
cd backend
NODE_ENV=production JWT_SECRET="$(openssl rand -base64 48)" npm run build && npm start
# In another terminal:
cd frontend && npm run build && npm run preview
```

---

## Part 2 — Production (Vercel)

### 1. MongoDB Atlas

- Network Access: allow **0.0.0.0/0** (or Vercel IP ranges)
- Database user with read/write on `procurement`

### 2. Zoho API Console

Register **both** redirect URIs:

- `http://localhost:5001/api/zoho/callback` (local)
- `https://YOUR-APP.vercel.app/api/zoho/callback` (production)

### 3. Deploy to Vercel

1. Import GitHub repo in [vercel.com](https://vercel.com)
2. Root directory: project root (where `vercel.json` is)
3. Add environment variables from `.env.production.example`
4. Deploy

Important variables:

| Variable | Example |
|----------|---------|
| `DATABASE_URL` | Atlas connection string |
| `JWT_SECRET` | 48+ char random string |
| `CORS_ORIGINS` | `https://your-app.vercel.app` |
| `FRONTEND_URL` | `https://your-app.vercel.app` |
| `BACKEND_PUBLIC_URL` | `https://your-app.vercel.app` |
| `ZOHO_REDIRECT_URI` | `https://your-app.vercel.app/api/zoho/callback` |
| `NODE_ENV` | `production` |

`VERCEL` is set automatically by Vercel.

### 4. After deploy

1. Open `https://your-app.vercel.app/health` — should show DB connected
2. Login → **Settings → Connect Zoho**
3. Update Zoho webhook URL to production URL from Settings
4. Re-test vendor + PO sync

---

## Part 3 — Other hosts (Railway, Render, VPS)

```bash
cd backend
npm install
npx prisma generate
npm run build
NODE_ENV=production npm start   # listens on PORT (default 5001)
```

Host the frontend `frontend/dist` on CDN or serve via nginx; set:

```env
VITE_API_URL=https://api.yourdomain.com/api
```

Rebuild frontend after changing `VITE_API_URL`.

---

## Security checklist (production)

- [ ] Strong `JWT_SECRET` (32+ characters)
- [ ] Atlas IP allowlist tightened if possible
- [ ] Rotate Zoho Client Secret if ever exposed
- [ ] Never commit `backend/.env`
- [ ] `CORS_ORIGINS` lists only your real domains
