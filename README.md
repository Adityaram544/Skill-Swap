# 🔄 SkillSwap — Peer-to-Peer Skill Exchange & Learning Platform

SkillSwap is a full-stack modern web application designed for 1-on-1 peer skill sharing. Users can teach what they know and learn what they love—without subscription fees or middleman costs.

---

## ✨ Features

- ⚡ **Bidirectional Skill Match Engine**: Automatically computes percentage compatibility between users based on skills offered vs. skills wanted.
- 💬 **Real-Time Socket.io Messaging**: Direct 1-on-1 chat featuring typing indicators (`Alex is typing ● ● ●`), timestamps, read receipts, image attachments, emoji picker, and real-time message deletion.
- 📞🎥 **WebRTC Voice & Video Calling**: Built-in 1-on-1 audio and video calls using native WebRTC peer connections with Socket.io signaling and MongoDB `Call` logging.
- 🎨 **Modern Design System**: Custom Teal (`#0d9488`), Sky Blue (`#0ea5e9`), and Warm Coral (`#f97316`) theme with instant Light Mode & Dark Mode toggling (< 1ms zero-delay).
- 🔍 **Skill Discovery Hub**: Fresh Explore page featuring category filters (Technology, Languages, Design, Music, Business, Cooking, Fitness), search bar, and custom skill indexing.
- 📬 **Swap Request Management**: Visual proposal cards displaying exchange flow (`[YOU OFFER] (Skill) ➔ [THEY REQUEST] (Skill)`) with Accept, Reject, and Open Chat actions.
- 📱 **Mobile First & Responsive**: Fixed thumb-friendly bottom navigation bar with safe-area offsets ensuring chat inputs remain visible on screen sizes from 320px to 4K displays.

---

## 🛠️ Technology Stack

### **Frontend** (`/client`)
- **Core**: React 18, Vite 5, JavaScript (ES6+)
- **Styling**: Tailwind CSS 3.4, Vanilla CSS Design Tokens
- **Icons**: Lucide React
- **Routing**: React Router DOM v6
- **Real-Time Client**: Socket.io Client v4
- **HTTP Client**: Axios

### **Backend** (`/server`)
- **Runtime**: Node.js, Express.js
- **Database**: MongoDB Atlas via Mongoose ORM
- **Real-Time Server**: Socket.io v4
- **Authentication**: JWT (JSON Web Tokens), bcryptjs password hashing
- **Media & WebRTC Signaling**: Socket.io peer candidate relay

---

## 📁 Project Architecture

```
Skill-swap/
├── client/                     # Frontend Vite + React application
│   ├── public/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── CallModal.jsx     # WebRTC Voice/Video call modals
│   │   │   ├── ChatWindow.jsx    # Real-time chat interface & WebRTC integration
│   │   │   ├── Footer.jsx        # App footer component
│   │   │   ├── Modal.jsx         # Accessible backdrop modal wrapper
│   │   │   ├── Navbar.jsx        # Top header with search & theme toggle
│   │   │   ├── RequestCard.jsx   # Skill exchange proposal card
│   │   │   ├── Sidebar.jsx       # Floating desktop sidebar & mobile bottom navbar
│   │   │   ├── SkillCard.jsx     # Category-colored skill badges & cards
│   │   │   └── UserCard.jsx      # Peer cards & match percentage score cards
│   │   ├── context/            # React Context providers
│   │   │   ├── AuthContext.jsx   # Global user state & JWT handling
│   │   │   ├── SocketContext.jsx # Global Socket.io instance & notifications
│   │   │   └── ThemeContext.jsx  # Instant Light/Dark mode state manager
│   │   ├── pages/              # Main application views
│   │   │   ├── Chat.jsx          # Conversations list & messaging hub
│   │   │   ├── Dashboard.jsx     # Main social dashboard & quick stats
│   │   │   ├── ExploreSkills.jsx # Skill discovery hero & catalog filter
│   │   │   ├── Landing.jsx       # Public landing page
│   │   │   ├── Login.jsx         # Authentication login form
│   │   │   ├── NotFound.jsx      # 404 page
│   │   │   ├── Profile.jsx       # Public bio, avatar picker & skill editor
│   │   │   ├── Requests.jsx      # Incoming/Outgoing swap requests page
│   │   │   ├── Settings.jsx      # Preferences & notification toggles
│   │   │   └── Signup.jsx        # Account registration form
│   │   ├── services/           # Axios API integrations
│   │   │   ├── api.js            # Base Axios instance
│   │   │   ├── authService.js   # Login/Signup endpoints
│   │   │   ├── chatService.js   # Chat history & deletion APIs
│   │   │   ├── requestService.js# Proposal request APIs
│   │   │   ├── skillService.js  # Custom skill index APIs
│   │   │   └── userService.js   # User profiles & match engine APIs
│   │   ├── index.css           # Global CSS variables & design tokens
│   │   └── main.jsx            # React root entrypoint
│   ├── index.html
│   ├── tailwind.config.js
│   └── package.json
│
└── server/                     # Backend Node.js Express server
    ├── config/
    │   └── db.js               # Mongoose MongoDB connection
    ├── controllers/            # Request handlers
    │   ├── authController.js
    │   ├── matchController.js
    │   ├── messageController.js
    │   ├── requestController.js
    │   ├── skillController.js
    │   └── userController.js
    ├── middleware/
    │   └── authMiddleware.js   # JWT authentication verifier
    ├── models/                 # Mongoose schemas
    │   ├── Call.js             # WebRTC call history schema
    │   ├── Message.js          # Chat message schema
    │   ├── Request.js          # Skill swap proposal schema
    │   ├── Skill.js            # Custom skill catalog schema
    │   └── User.js             # User account & skills schema
    ├── routes/                 # Express REST API endpoints
    ├── sockets/
    │   └── chatSocket.js       # Socket.io chat & WebRTC call signaling
    ├── utils/
    │   ├── jwt.js              # Token signing utility
    │   └── seedData.js         # Initial database seeder
    ├── .env                    # Backend environment variables
    ├── server.js               # Express application entrypoint
    └── package.json
```

---

## 🚀 Getting Started

### **Prerequisites**
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB Atlas Connection URI** (or local MongoDB instance)

---

### **1. Backend Setup (`/server`)**

1. Navigate to the server folder:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create or inspect the `.env` file in `/server`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/skillswap?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=30d
   NODE_ENV=development
   ```

4. (Optional) Seed the database with demo users & skills:
   ```bash
   npm run seed
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   > Server will start listening on `http://localhost:5000`

---

### **2. Frontend Setup (`/client`)**

1. Open a new terminal and navigate to the client folder:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   > Client will launch at `http://localhost:3000`

---

## 🔑 Demo Login Accounts

If you ran `npm run seed`, you can quickly log in with these demo accounts:

| Email | Password | Primary Skills Offered |
| :--- | :--- | :--- |
| `alex@skillswap.com` | `password123` | React, Node.js, JavaScript |
| `sophia@skillswap.com` | `password123` | Spanish, UI/UX Design |

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register new user account | ❌ |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT | ❌ |
| `GET` | `/api/auth/me` | Fetch logged in user profile | ✅ |
| `GET` | `/api/users` | Fetch all peer profiles (with search/category) | ✅ |
| `PUT` | `/api/users/profile` | Update profile bio, avatar, skills & settings | ✅ |
| `GET` | `/api/matches` | Get recommended reciprocal matches | ✅ |
| `GET` | `/api/skills` | List indexed skill catalog | ✅ |
| `POST` | `/api/skills` | Create custom skill | ✅ |
| `GET` | `/api/requests` | List user swap proposals | ✅ |
| `POST` | `/api/requests` | Send new swap proposal | ✅ |
| `PUT` | `/api/requests/:id` | Update request status (`Accepted`/`Rejected`) | ✅ |
| `GET` | `/api/messages/:userId` | Fetch chat message history with user | ✅ |
| `DELETE`| `/api/messages/:id` | Delete message for me or for everyone | ✅ |

---

## 📞 Socket.io & WebRTC Signaling Events

### **Real-Time Chat Events**
- `join_chat`: Join room for specific conversation pairing.
- `send_message`: Broadcast message to recipient room & save to DB.
- `receive_message`: Incoming message event.
- `typing` / `stop_typing`: Broadcast bouncing typing indicator dots.
- `mark_read`: Mark unread messages as read.

### **WebRTC Call Signaling Events**
- `call_user`: Initiate call and send WebRTC SDP offer to target user.
- `incoming_call`: Display `IncomingCallModal` on target client.
- `answer_call`: Accept call and return WebRTC SDP answer.
- `reject_call`: Decline call and close caller modal.
- `end_call`: Terminate WebRTC peer connection and save call duration to MongoDB.
- `ice_candidate`: Relay WebRTC ICE candidates between peers.

---

## 📜 License

This project is open source and available under the **MIT License**.
