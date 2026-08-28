# ProjectMatch — AI-Powered Hackathon & Startup Team Formation Platform

ProjectMatch is a competition-ready, AI-driven team-formation engine that analyzes natural-language project descriptions to extract requirements, matches candidates using a deterministic weighted scoring algorithm, and provides an interactive Team Builder featuring real-time complementarity scores, What-if preview simulation, AI Pitch Doctor feasibility audits, and a public recruitment showcase feed.

---

## 1. Key Features

- 🤖 **Gemini AI Project Co-Pilot**: Interactive chat assistant that helps creators refine project descriptions and auto-fills optimal input during project creation.
- 🎯 **Deterministically Scored Matching Engine**: Multi-factor candidate compatibility scoring (Skills, Roles, Experience, Availability Hours, Interests, and Team Synergy).
- 🩺 **AI Pitch Doctor (Feasibility Audit)**: Analyzes project scope and current team composition to calculate execution risk (`Low`, `Medium`, `High`) and return 3 strategic architectural recommendations.
- 🚀 **Public Recruitment Feed (Showcase)**: Live public feed for open hackathon/startup teams to recruit missing roles, featuring search by tech stack and one-click applications.
- 📨 **Direct Invitations Inbox**: Categorized **Received** and **Sent Out** tabs with exact timestamped audit logs (`MMM DD, YYYY at HH:MM AM/PM`) and response actions (`Accept` / `Decline`).
- 👥 **Dynamic Active Team Builder**: Automatically includes the project lead in the active team, allows mass invitations to all members upon team completion, and provides real-time team metrics.
- 🖼️ **Profile Photo & Avatar Upload**: Base64 photo upload with preview for candidate profiles.

---

## 2. Technology Stack

- **Frontend**: React (TypeScript), Vite, Tailwind CSS, Lucide Icons, Firebase Client SDK
- **Backend**: Node.js, Express, TypeScript, Google Gen AI SDK (Gemini 1.5 Flash API)
- **Database**: Cloud Firestore (with LocalStorage fallback)
- **Authentication**: Firebase Authentication (Email/Password & Google Auth) with Demo Mode support

---

## 3. Directory Layout

```text
/
├── package.json              # Root package.json managing workspaces
├── tsconfig.json             # Root TypeScript config
├── backend/                  # Node.js Express server module
│   ├── src/server.ts         # Server boot entry point
│   ├── src/routes/ai.ts      # AI endpoints (/api/analyze, /api/explain-match, /api/improve-team, /api/audit, /api/chat-assistant)
│   ├── src/services/gemini.ts# Dual-mode Gemini service (API & keyword match fallback)
│   └── .env.example          # Environment variables template
└── frontend/                 # Vite React client module
    ├── src/main.tsx          # Application mount point (wrapped in Auth & AppState Providers)
    ├── src/App.tsx           # Router and page shell layout
    ├── src/pages/            # CreateProject, TeamBuilder, PublicShowcase, Invitations, Onboarding
    ├── src/config/           # Matching configuration and 16 diverse candidate seeds
    ├── src/hooks/            # useMatchingEngine & useTeamMetrics (deterministic scoring)
    └── src/services/         # db.ts (dual-mode Firestore/LocalStorage) & api.ts (backend client)
```

---

## 4. Setup & Installation

### Pre-requisites
- **Node.js**: Version 20 or higher is recommended.
- **NPM**: Installed along with Node.

### Installation
From the root workspace folder, run:
```bash
npm run install
```

---

## 5. Development Launch Commands

To start the application locally:

```bash
# Runs both Express backend (port 5000) and Vite frontend (port 5173) simultaneously
npm run dev
```

---

## 6. Offline-Resilient Architecture & Fallback Mode

ProjectMatch is designed to be 100% resilient to network connectivity issues or API rate limit caps:
1. **16 Pre-populated Seed Candidates**: LocalStorage automatically seeds candidate profiles for immediate demonstration without requiring external database setups.
2. **Local Match Engine**: Numerical scoring is computed client-side in the React layer using weighted factor scoring (Skills, Role, Experience, Hours, Synergy).
3. **Local AI Parsing Fallback**: If backend API endpoints are offline or unconfigured, the client activates its internal fallback engine to extract requirements, evaluate feasibility, and simulate conversational assistant responses seamlessly.
