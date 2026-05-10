const Message = require('../models/Message');
const ChatRequest = require('../models/ChatRequest');

// 1. Send/Save a Message
exports.sendMessage = async (req, res) => {
    try {
        const { senderId, receiverId, content } = req.body;

        // Create the message
        const newMessage = new Message({
            senderId,
            receiverId: receiverId || null, // null means it's Global Chat
            content
        });

        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ error: 'Failed to send message' });
    }
};

// 2. Get Global Chat History
exports.getGlobalMessages = async (req, res) => {
    try {
        // Fetch messages where receiverId is null
        const messages = await Message.find({ receiverId: null })
            .populate('senderId', 'profile.firstName profile.lastName badge')
            .sort({ createdAt: 1 }) // Order by time (oldest to newest)
            .limit(50); // Keep it fast, only load last 50
        
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch global chat' });
    }
};

// 3. Get Direct Message History (1-on-1)
exports.getPrivateMessages = async (req, res) => {
    try {
        const { userId, otherId } = req.params;

        // Fetch messages between two specific users
        const messages = await Message.find({
            $or: [
                { senderId: userId, receiverId: otherId },
                { senderId: otherId, receiverId: userId }
            ]
        }).sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch private chat' });
    }
};