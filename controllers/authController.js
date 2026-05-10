const User = require('../models/User');
const Whitelist = require('../models/Whitelist'); // NEW IMPORT
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTER USER
exports.register = async (req, res) => {
    try {
        const { firstName, lastName, email, role, badge, password } = req.body;

        // --- STEP 1: WHITELIST SECURITY CHECK ---
        const isAllowed = await Whitelist.findOne({ email: email.toLowerCase().trim() });
        if (!isAllowed) {
            return res.status(403).json({ 
                message: "Access Denied: This email is not on the college's approved list." 
            });
        }

        // --- STEP 2: CHECK IF ALREADY REGISTERED ---
        let user = await User.findOne({ email: email.toLowerCase() });
        if (user) return res.status(400).json({ message: "User already exists" });

        // --- STEP 3: PROCEED WITH CREATION ---
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            profile: { firstName, lastName },
            email: email.toLowerCase(),
            role,
            badge,
            password: hashedPassword
        });

        await user.save();
        res.status(201).json({ message: "Account created successfully!" });

    } catch (err) {
        console.error("Reg Error:", err.message);
        res.status(500).json({ message: "Server error during registration" });
    }
};

// ... updateProfile and login stay the same
exports.updateProfile = async (req, res) => {
    const { userId, firstName, lastName, badge } = req.body;
    try {
        const user = await User.findByIdAndUpdate(userId, {
            "profile.firstName": firstName,
            "profile.lastName": lastName,
            badge: badge
        }, { new: true });
        res.json({ message: "Profile Updated", user });
    } catch (err) {
        res.status(500).json({ message: "Update failed" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });
        
        if (!user) return res.status(400).json({ message: "Invalid Credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({
            token,
            userId: user._id,
            userName: user.profile.firstName,
            role: user.role
        });
    } catch (err) {
        res.status(500).json({ message: "Server error during login" });
    }
};