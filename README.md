# 🛡️ Sovereign Ledger: Procurement Intelligence System

A high-performance, full-stack procurement management platform with real-time 3D supply-chain analytics, vendor identity management, and automated requisition ledger tracking.

## 🛠️ Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Lucide-React
- **3D Visualization**: `react-globe.gl` (Three.js WebGL Engine)
- **Backend**: Node.js (Express), Prisma ORM, **MongoDB Atlas**
- **Integrations**: Zoho Books (OAuth, PO/vendor sync, webhooks)

---

## 🚀 Quick Start (Local — test here first)

```bash
git clone https://github.com/ShaikMohammadUsman/procurement-final-.git
cd procurement-final-
npm run install:all
cp backend/.env.example backend/.env   # add DATABASE_URL, JWT_SECRET, ZOHO_*
cd backend && npx prisma generate && npx prisma db push
cd .. && npm run dev
```

| App | URL |
|-----|-----|
| UI | http://localhost:3000 |
| API | http://localhost:5001 |
| Health | http://localhost:5001/health |

**Production deploy:** see [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🌐 Key Strategic Modules
- **Global Sourcing**: Real-time 3D WebGL globe with interactive supply-chain vector mapping.
- **Vendor Ledger**: Master vendor identity files with spend analytics and compliance tracking.
- **Procurement Requisitions**: Automated ledger tracking with executive navigation.
- **Financial Intelligence**: Standardized multi-currency support and protocol authorization.

---

## 🎨 Design Philosophy
The system utilizes a **Tactical Glassmorphism** aesthetic, featuring high-fidelity amber accents, deep ebonized surfaces, and fluid motion systems for an enterprise "Command Center" experience.

---
© 2026 Sovereign Ledger · Built with Modern AI Architecture.
