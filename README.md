# ProjectMatch --- AI-Powered Team Formation Platform (MVP)

ProjectMatch is a competition-ready team-formation engine that analyzes natural-language project descriptions to extract requirements, matches candidates using a deterministic weighted scoring algorithm, and provides an interactive Team Builder featuring real-time complementarity scores, What-if preview simulation, and AI recommendations.

This is a **greenfield MVP build** optimized for live demonstrations.

---

## 1. Technology Stack

*   **Frontend**: React (TypeScript), Vite, Tailwind CSS, Firebase Client SDK
*   **Backend**: Node.js, Express, TypeScript, Google Gen AI SDK (Gemini API)
*   **Database**: Cloud Firestore
*   **Authentication**: Firebase Authentication (Email/Password) with One-Click Demo Mode bypass.

---

## 2. Directory Layout

```text
/
├── package.json              # Root package.json managing workspaces
├── tsconfig.json             # Root TypeScript config
├── backend/                  # Node.js Express server module
│   ├── src/server.ts         # Server boot entry point
│   ├── src/routes/ai.ts      # AI endpoints (/api/analyze, /api/explain-match, /api/improve-team)
│   ├── src/services/gemini.ts# Dual-mode Gemini service (API & keyword match fallback)
│   └── .env.example          # Environment variables template
└── frontend/                 # Vite React client module
    ├── src/main.tsx          # Application mount point (wrapped in Auth & AppState Providers)
    ├── src/App.tsx           # Router and page shell layout
    ├── src/config/           # Matching configuration and 10 fictional candidate seeds
    ├── src/hooks/            # useMatchingEngine & useTeamMetrics (deterministic scoring)
    └── src/services/         # db.ts (dual-mode Firestore/LocalStorage) & api.ts (backend client)
```

---

## 3. Setup Instructions

### Pre-requisites
*   **Node.js**: Version 20 or higher is recommended.
*   **NPM**: Installed along with Node.

### Installation
From the root workspace folder, run:
```bash
# This installs dependencies in the root, frontend, and backend packages
npm run install:all
```
*Note: The frontend dependencies will be installed using `--legacy-peer-deps` due to React 19 peer-requirements in Lucide React.*

---

## 4. Environment Variables

Create `.env` configuration files inside both sub-folders.

### Backend Environment (`backend/.env`)
Create `backend/.env` based on `backend/.env.example`:
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key
```
*   `PORT`: The port on which the Express server starts.
*   `GEMINI_API_KEY`: Key generated in [Google AI Studio](https://aistudio.google.com/). Set to `mock_key_for_local_demo` to skip Gemini calls and execute the offline parser.

### Frontend Environment (`frontend/.env`)
Create `frontend/.env`:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```
*   If these variables are omitted, the frontend automatically falls back to **LocalStorage Demo Mode** and handles authentication locally, allowing the platform to run without any Firebase account.

---

## 5. Development Launch Commands

To start the applications locally:

### Run Both Simultaneously (Recommended)
From the root directory:
```bash
npm run dev
```
This runs both the Express backend (port 5000) and the Vite frontend dev server (port 5173, proxied via Vite config to route `/api/*` to backend).

### Run Modules Individually
*   **Frontend only**: `npm run dev:frontend`
*   **Backend only**: `npm run dev:backend`

---

## 6. How to Use Demo Mode (Offline-Resilient Setup)

ProjectMatch is designed to be 100% resilient to network connectivity issues or API rate limit caps:
1.  **Demo Mode Login**: On the login page, click **"Enter Demo Mode"** (or use shortcuts). This logs you in as `Demo Project Lead` in local memory.
2.  **Pre-populated Seeds**: The database automatically seeds LocalStorage with 10 fictional candidates and precompiled explanations, allowing calculations to function offline.
3.  **Local Match Engine**: Numerical scoring is computed client-side in the React layer using the SOT-specified weights (35% Skills, 20% Role, 15% Experience, 15% Availability, 10% Interests, 5% Complementarity), eliminating latency.
4.  **Local Analysis Fallback**: If backend endpoints fail, the client activates its case-insensitive regex dictionary parser, extracting skills and roles locally to simulate LLM operations.
