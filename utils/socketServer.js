const socketio = require('socket.io');

const initSocket = (server) => {
    const io = socketio(server, {
        cors: {
            origin: "*", // Allows your frontend to connect
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('🔌 New User Connected:', socket.id);

        // 1. Join Global Campus Chat Room
        socket.on('joinGlobal', () => {
            socket.join('global-room');
            console.log(`User ${socket.id} joined Global Chat`);
        });

        // 2. Handle Global Message Broadcast
        socket.on('sendGlobalMessage', (messageData) => {
            // This sends the message to EVERYONE in the global-room
            io.to('global-room').emit('receiveGlobalMessage', messageData);
        });

        // 3. Join Private Room (Unique to each user)
        socket.on('joinPrivate', (userId) => {
            socket.join(userId);
            console.log(`User joined private room: ${userId}`);
        });

        // 4. Handle Private Direct Message
        socket.on('sendPrivateMessage', (data) => {
            const { receiverId, messageData } = data;
            // Send only to the specific receiver's private room
            io.to(receiverId).emit('receivePrivateMessage', messageData);
        });

        socket.on('disconnect', () => {
            console.log('❌ User Disconnected');
        });
    });

    return io;
};

module.exports = initSocket;