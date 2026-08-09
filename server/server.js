const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

dotenv.config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const initSocket = require('./sockets/chatSocket');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const skillRoutes = require('./routes/skillRoutes');
const matchRoutes = require('./routes/matchRoutes');
const requestRoutes = require('./routes/requestRoutes');
const chatRoutes = require('./routes/chatRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const server = http.createServer(app);

// Socket.io initialization with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/messages', chatRoutes);
app.use('/api/notifications', notificationRoutes);


// Root route — API info only (frontend runs on port 3000)
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: '🚀 SkillSwap Backend API Server is running',
    api: 'http://localhost:5000/api',
    health: 'http://localhost:5000/api/health',
    frontend: 'http://localhost:3000'
  });
});

// Root health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'SkillSwap API Server is running smoothly' });
});


// Socket connection
initSocket(io);

// Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect Database & Start Server
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 SkillSwap Server listening on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
});
