require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { connectDB } = require('./config/db');

const app = express();
const httpServer = createServer(app);

// ---------------- Socket.IO Setup ----------------
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL, // e.g., 'http://localhost:5173'
    methods: ['GET', 'POST'],
    credentials: true, // allow cookies for sockets
  },
});

// Example: your socket handlers
const { setupSocketHandlers } = require('./sockets/socketHandlers');
setupSocketHandlers(io);

// ---------------- Middleware ----------------
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// ⚡ CORS Setup
app.use(cors({
  origin: process.env.CLIENT_URL, // exact frontend URL
  credentials: true,              // must be true to allow cookies
}));

// ---------------- MongoDB ----------------
connectDB();

// ---------------- Routes ----------------
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Marketplace API running' });
});

// ---------------- Error Handler ----------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {},
  });
});

// ---------------- Server Listen ----------------
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
