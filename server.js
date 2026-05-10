/**
 * CAMPUSNET - MASTER SERVER
 * Architecture: Node.js, Express, MongoDB, Socket.io
 * Developed by: Darshan Deshmukh & Team
 */

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const http = require('http'); 
const initSocket = require('./utils/socketServer');
// 1. INITIAL CONFIG
dotenv.config();
const app = express();
const server = http.createServer(app); // Wraps Express for WebSockets

// 2. MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: true }));app.use(cors({
    origin: "*", // Adjust this to your frontend URL in production
    methods: ["GET", "POST", "PUT", "DELETE"]
}));

// 3. STATIC FILE SERVING
// Serves images from 'backend/uploads' so frontend can access them
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4. DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected Successfully'))
    .catch((err) => {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1); 
    });

// 5. INITIALIZE SOCKET.IO
// This connects the logic in utils/socketServer.js to our server
const io = initSocket(server);
app.set('socketio', io); // Makes io accessible in your controllers if needed

// ----------------------------------------------------
// 6. MVC ROUTES
// ----------------------------------------------------

// Authentication (Login/Register)
app.use('/api/auth', require('./routes/authRoutes'));

// Feed (Posts, Likes, Reports, Image Uploads)
app.use('/api/posts', require('./routes/postRoutes'));

// Messaging (History & Private Chat)
app.use('/api/messages', require('./routes/messageRoutes'));

// Admin (CSV Uploads & Moderation)
app.use('/api/admin', require('./routes/adminRoutes'));

// ----------------------------------------------------
// 7. GLOBAL ERROR HANDLING & HEALTH CHECK
// ----------------------------------------------------
app.get('/', (req, res) => {
    res.status(200).json({ status: 'Operational', platform: 'CampusNet' });
});

// Middleware to catch 404
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// ----------------------------------------------------
// 8. LAUNCH
// ----------------------------------------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Socket.io: Real-time WebSockets Active`);
    console.log(`📁 Multer: Static Uploads served at /uploads`);
});