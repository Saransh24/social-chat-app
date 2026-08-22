# 💬 Social — Full Stack Real-Time Chat App 🚀

![Demo App](/frontend/public/screenshot-for-readme.png)

**🔗 Live demo: [social-chat-app-yj42.onrender.com](https://social-chat-app-yj42.onrender.com)**

> Heads up — the app is hosted on a free instance, so the very first visit may take
> up to a minute to wake up. It's quick after that.

---

## ✨ Highlights

- 💬 Full stack real-time chat application
- ⚛️ React 19 frontend with Vite, Tailwind CSS & Hero UI
- 🚀 Node.js & Express backend
- 🔐 Email and Google sign-in via Clerk — no passwords ever touch this app
- 🗄️ Messages and profiles stored in MongoDB
- ⚡ Instant delivery over Socket.io — no refreshing, ever
- 🟢 Live online-presence tracking
- 🔔 Toast alerts for messages that land in a chat you aren't reading
- 🔄 Automatic catch-up when a device wakes or comes back online
- 🖼️ Image & video sharing, served from a CDN
- 🎨 Light & dark mode
- 🖌️ 13 wallpapers and 11 accent themes
- ⌨️ Optional keyboard sound effects
- 📤 Media uploads handled by ImageKit
- 🪝 Clerk webhooks with signature verification
- ⏰ Cron job that keeps the free instance awake
- 🐳 Single multi-stage Docker image — one service, one URL
- 📱 Fully responsive on desktop and mobile
- 🌐 Deployed with a live URL
- 🆓 100% free hosting stack

---

## 🧪 Environment Variables

### Backend (`/backend`)

```bash
PORT=<your_port>

NODE_ENV=<development_or_production>

MONGO_URI=<your_mongodb_connection_string>

CLERK_PUBLISHABLE_KEY=<your_clerk_publishable_key>
CLERK_SECRET_KEY=<your_clerk_secret_key>
CLERK_WEBHOOK_SIGNING_SECRET=<your_clerk_webhook_signing_secret>

IMAGEKIT_PRIVATE_KEY=<your_imagekit_private_key>

FRONTEND_URL=<your_frontend_url>
```

### Frontend (`/frontend`)

```bash
VITE_CLERK_PUBLISHABLE_KEY=<your_clerk_publishable_key>
```

There's a `.env.example` in both folders to copy from.

> `MONGO_URI` needs the database name between the `/` and the `?` —
> `...mongodb.net/social?retryWrites=true&w=majority`. Atlas leaves it out of the
> string it gives you.

> `VITE_CLERK_PUBLISHABLE_KEY` is read at **build** time, not runtime — Vite bakes it
> into the bundle, so it must be set before `npm run build`.

---

## 🛠️ Running Locally

```bash
# backend → http://localhost:3000
cd backend
npm install
npm run dev

# frontend → http://localhost:5173
cd frontend
npm install
npm run dev
```

New sign-ups reach the database through a Clerk webhook, and webhooks can't reach
`localhost` — so use a tunnel if you need to test the full sign-up flow locally.

---

## 🚀 Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Hero UI
- Zustand
- Socket.io Client

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- Socket.io
- Clerk
- ImageKit
- Multer

### Deployment

- App: Render (Docker)
- Database: MongoDB Atlas
- Media: ImageKit

---

## 🏗️ How It's Built

Express serves the compiled React app **and** the API from a single service, so the
whole thing runs on one URL with no cross-origin setup. The Docker build compiles the
frontend, copies it into the backend image, and ships only production dependencies.

Messages take two paths at once: saved to MongoDB so they last, and pushed straight to
the recipient's socket so they arrive instantly. Clerk owns identity and notifies the
backend over a signed webhook whenever a user is created, updated or deleted.

---

## 📄 License

ISC
