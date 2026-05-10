const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// Send a message (Global or DM)
router.post('/send', messageController.sendMessage);

// Get Global Campus Chat history
router.get('/global', messageController.getGlobalMessages);

// Get Private DM history between two users
router.get('/private/:userId/:otherId', messageController.getPrivateMessages);



module.exports = router;