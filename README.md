# 🎬 ZooTube

A full-stack video streaming platform built with React, Node.js, Express, and MongoDB. Inspired by YouTube — designed to be better.

[![Live Demo](https://img.shields.io/badge/Live-Demo-6366f1?style=for-the-badge&logo=vercel)](https://zootube.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render-22c55e?style=for-the-badge&logo=render)](https://your-backend-url.onrender.com)

---

## ✨ Features

### 🎥 Video Platform
- Upload, stream, and manage videos & YouTube Shorts-style vertical content
- Cinematic **Ambilight** video player — video thumbnail glows as ambient background
- **Video quality selector** (Auto / 1080p / 720p / 480p / 360p) powered by Cloudinary transforms
- **Floating Mini Player** — navigate away while video keeps playing; drag anywhere on screen
- Like, comment, share, and save to playlist
- Recommended videos sidebar

### 🔐 Authentication
- JWT-based auth with `httpOnly` secure cookies
- Session persists across browser tabs and refreshes
- Fully protected routes — unauthenticated users are redirected to login

### 👤 User & Channel
- Creator Studio dashboard with stats, views graph, and content management
- Upload videos & shorts from Studio
- Subscribe / unsubscribe to channels
- Watch History, Liked Videos, and Subscriptions pages

### 🎨 UI/UX
- **Light Mode & Dark Mode** — fully theme-aware across every page
- Interactive animated canvas background (particles follow cursor)
- Custom cursor, glassmorphism panels, smooth framer-motion animations
- Shorts player with TikTok-style swipe navigation and keyboard arrows
- Floating bottom navigation dock

### ⚙️ Infrastructure
- **Keep-Alive** ping every 10 minutes to prevent Render free-tier sleep
- GitHub Actions CI/CD pipeline with Docker Compose v2
- Vercel (Frontend) + Render (Backend) deployment

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB + Mongoose |
| **Auth** | JWT, bcrypt, httpOnly cookies |
| **Media** | Cloudinary (upload + quality transforms) |
| **Deployment** | Vercel + Render + GitHub Actions |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB instance (local or Atlas)
- Cloudinary account

### Backend Setup

```bash
git clone https://github.com/Joyboy48/js-backend.git
cd js-backend/backend
npm install
```

Create a `.env` file in `backend/`:

```env
PORT=8000
MONGODB_URI=your_mongodb_uri
CORS_ORIGIN=http://localhost:5173
ACCESS_TOKEN_SECRET=your_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 📁 Project Structure

```
js-backend/
├── backend/
│   └── src/
│       ├── controllers/   # Route logic
│       ├── models/        # Mongoose schemas
│       ├── routes/        # API routes
│       ├── middlewares/   # Auth, multer, error handlers
│       └── utils/         # Cloudinary, ApiResponse, ApiError
└── frontend/
    └── src/
        ├── components/    # Navbar, MiniPlayer, VideoCard, etc.
        ├── context/       # AuthContext, ThemeContext, MiniPlayerContext
        ├── pages/         # Home, VideoDetail, Dashboard, Shorts, etc.
        └── api/           # Axios instance with credentials
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/users/register` | Register user |
| POST | `/api/v1/users/login` | Login |
| POST | `/api/v1/users/logout` | Logout |
| GET | `/api/v1/videos` | Get all videos |
| POST | `/api/v1/videos` | Upload video |
| GET | `/api/v1/videos/:id` | Get single video |
| POST | `/api/v1/likes/toggle/v/:id` | Like/Unlike video |
| GET | `/api/v1/comments/:videoId` | Get comments |
| POST | `/api/v1/comments/:videoId` | Add comment |
| POST | `/api/v1/subscriptions/c/:channelId` | Subscribe/Unsubscribe |
| GET | `/api/v1/playlists/user/:userId` | Get user playlists |
| GET | `/api/v1/healthcheck` | Health check |

---

## 📄 License

MIT © [Joyboy48](https://github.com/Joyboy48)
