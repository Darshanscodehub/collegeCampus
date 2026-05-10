const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route for creating a new account: POST /api/auth/register
router.post('/register', authController.register);

// Route for logging in: POST /api/auth/login
router.post('/login', authController.login);

// Search for users by name
// router.get('/search', async (req, res) => {
//     const { query } = req.query;
//     try {
//         const users = await User.find({
//             $or: [
//                 { "profile.firstName": { $regex: query, $options: 'i' } },
//                 { "profile.lastName": { $regex: query, $options: 'i' } }
//             ]
//         }).limit(5).select('profile role badge');
//         res.json(users);
//     } catch (err) {
//         res.status(500).json({ message: "Search failed" });
//     }
// });
// GET USER PROFILE DATA
router.get('/profile/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});
// SEARCH USERS BY NAME
router.get('/search', async (req, res) => {
    const { query } = req.query;
    try {
        const users = await User.find({
            $or: [
                { "profile.firstName": { $regex: query, $options: 'i' } },
                { "profile.lastName": { $regex: query, $options: 'i' } }
            ]
        }).limit(5).select('profile badge'); // Only return safe info
        
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Search error" });
    }
});
module.exports = router;