# 🏋️ CozyFit

<p align="center">
  <strong>Your fitness journey, one workout at a time.</strong>
  <br />
  A cozy, gamified workout tracker designed to make consistency feel effortless.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Storage-Local--First-success?style=flat-square" />
  <img src="https://img.shields.io/badge/Deployment-GitHub_Pages-222222?style=flat-square&logo=github" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" />
</p>

---

## ✨ Overview

**CozyFit** is a local-first workout tracking web application that turns fitness consistency into a rewarding experience.

Built around a calming, stress-free aesthetic, CozyFit combines workout tracking with lightweight gamification through daily streaks, weekly goals, and unlockable mystery badges.

Whether you're training at home or hitting the gym, CozyFit helps you stay consistent without overwhelming you with unnecessary complexity.

**Your data stays yours.** All workout logs, progress, and preferences are stored directly on your device.

## 🚀 Features

- 🔒 **Privacy-First Storage** — All workout data and preferences are persisted locally using Zustand's persist middleware. No backend databases or tracking.
- 🔥 **Daily Streaks** — Build consistency and keep your workout streak alive.
- 🎯 **Weekly Goals** — Stay motivated with weekly fitness targets and progress tracking.
- 🏆 **Mystery Badges** — Discover and unlock hidden achievements as you progress.
- 📱 **Responsive Experience** — Optimized layouts for mobile devices, tablets, and desktop screens.
- 🌗 **Light & Dark Themes** — Switch between thoughtfully designed themes with readable, high-contrast UI elements.
- ⚡ **Fast & Lightweight** — Powered by Vite for a smooth development experience and optimized production builds.
- 🔄 **Automated Deployment** — GitHub Actions handles the deployment workflow to GitHub Pages.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React 18 | Component-based UI |
| TypeScript | Type-safe development |
| Vite | Development server & build tooling |
| Tailwind CSS | Utility-first styling |
| Zustand | Lightweight state management |
| Zustand Persist | LocalStorage persistence |
| GitHub Actions | Automated CI/CD |
| GitHub Pages | Hosting & deployment |

## 🏗️ Architecture

CozyFit follows a **local-first architecture**, keeping application state and user data on the client side.

```text
         ┌──────────────────────┐
         │      CozyFit UI      │
         │   React + TypeScript │
         └──────────┬───────────┘
                    │
         ┌──────────▼───────────┐
         │   Zustand Store      │
         │  State Management    │
         └──────────┬───────────┘
                    │
         ┌──────────▼───────────┐
         │  Persist Middleware  │
         │     LocalStorage     │
         └──────────────────────┘
```

No external database is required. Your workout information remains stored in your browser's local storage.

## 💻 Local Development

Get CozyFit running locally in just a few steps.

**1. Clone the repository**

```bash
git clone https://github.com/nagamanikanta5455/cozy-fit.git
```

**2. Navigate to the project directory**

```bash
cd cozy-fit
```

**3. Install dependencies**

```bash
npm install
```

**4. Start the development server**

```bash
npm run dev
```

**5. Open in your browser**

Visit the local URL displayed in your terminal (usually `http://localhost:5173`).

## 📦 Production Build

To generate an optimized production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## 🚀 Deployment

CozyFit is deployed using **GitHub Pages**, with GitHub Actions automating the deployment process.

Every deployment follows the configured GitHub Actions workflow, keeping the published application synchronized with the repository.

## 🔐 Privacy & Data

CozyFit is designed with privacy at its core.

- Workout logs are stored in browser LocalStorage.
- Zustand Persist maintains application state between sessions.
- No external database or user account is required.
- Clearing browser storage or changing browsers/devices can remove or make locally stored data inaccessible.

**Your fitness data belongs to you.**

## 🌱 Future Improvements

- 📊 Workout analytics and visual progress charts.
- 🗓️ Workout calendar and history.
- 🏋️ Exercise library and customizable routines.
- 📤 Export and import workout data.
- 🎖️ More achievements and progression milestones.

## 👨‍💻 Author

**Naga Manikanta Konda**

- GitHub: [@nagamanikanta5455](https://github.com/nagamanikanta5455)
- LinkedIn: [Naga Manikanta Konda](https://linkedin.com/in/nagamanikanta-konda-3aba08296)

---

<p align="center">
  Made with ❤️ and consistency.
  <br />
  <strong>Small workouts. Big progress. ✨</strong>
</p>
