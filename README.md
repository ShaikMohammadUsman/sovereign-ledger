# 🛡️ Sovereign Ledger: Procurement Intelligence System

A high-performance, full-stack procurement management platform with real-time 3D supply-chain analytics, vendor identity management, and automated requisition ledger tracking.

## 🛠️ Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Lucide-React
- **3D Visualization**: `react-globe.gl` (Three.js WebGL Engine)
- **Backend**: Node.js (Express), Prisma ORM, PostgreSQL/SQLite
- **UI Components**: Radix UI (Glassmorphism), Lucide-React Icons

---

## 🚀 Quick Start (Local Setup)

Anyone can run this project by following these steps:

### 1. Repository Preparation
```bash
git clone https://github.com/ShaikMohammadUsman/Procurement_System.git
cd Procurement_System
```

### 2. Backend Infrastructure
Navigate to the `backend` folder and prepare your environment:
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
PORT=5001
DATABASE_URL="file:./dev.db" # Or your PostgreSQL URL
JWT_SECRET="your-tactical-secret-key"
```
Initialize the Database:
```bash
npx prisma migrate dev --name init
npm run dev
```

### 3. Frontend Tactical Interface
Navigate to the `frontend` folder and fire up the UI:
```bash
cd ../frontend
npm install
npm run dev
```
Open **[localhost:5173](http://localhost:5173)** in your browser.

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
