const User = require('../models/User');
const Whitelist = require('../models/Whitelist');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Register a new user (Whitelist restricted)
// @route   POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        // --- STEP 1: WHITELIST SECURITY CHECK ---
        const whitelistedEntry = await Whitelist.findOne({ email: email.toLowerCase().trim() });
        
        if (!whitelistedEntry) {
            return res.status(403).json({ 
                message: "Access Denied: Your email is not on the approved campus list. Please contact the administrator." 
            });
        }

        // --- STEP 2: CHECK IF ALREADY REGISTERED ---
        let user = await User.findOne({ email: email.toLowerCase() });
        if (user) {
            return res.status(400).json({ message: "An account with this email already exists." });
        }

        // --- STEP 3: HASH PASSWORD ---
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // --- STEP 4: CREATE USER ---
        // Note: We use 'whitelistedEntry' values for role and badge to ensure data integrity
        user = new User({
            profile: { 
                firstName: firstName.trim(), 
                lastName: lastName.trim() 
            },
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: whitelistedEntry.role, // Inherited from Admin CSV
            badge: whitelistedEntry.cohortBadge // Inherited from Admin CSV
        });

        await user.save();
        res.status(201).json({ 
            success: true,
            message: "Account created successfully! You can now log in." 
        });

    } catch (err) {
        console.error("Registration Error:", err.message);
        res.status(500).json({ message: "Server error during registration" });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find user
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password." });
        }

        // 2. Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password." });
        }

        // 3. Generate JWT
        const token = jwt.sign(
            { userId: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );

        // 4. Send Response
        res.json({
            token,
            userId: user._id,
            userName: user.profile.firstName,
            role: user.role,
            badge: user.badge
        });

    } catch (err) {
        console.error("Login Error:", err.message);
        res.status(500).json({ message: "Server error during login" });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// controllers/authController.js

exports.updateProfile = async (req, res) => {
    const { userId, firstName, lastName, bio } = req.body; // Add bio here
    try {
        const updateData = {};
        if (firstName) updateData["profile.firstName"] = firstName;
        if (lastName) updateData["profile.lastName"] = lastName;
        if (bio) updateData["profile.bio"] = bio; // Support bio update

        const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
        res.json({ message: "Profile Updated", user });
    } catch (err) {
        res.status(500).json({ message: "Update failed" });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, 'profile.firstName role'); // Only get name and role
        res.json(users);
    } catch (err) {
        res.status(500).send("Error fetching users");
    }
};

// controllers/authController.js

// controllers/authController.js
exports.getProfile = async (req, res) => {
    try {
        // req.params.userId must match the :userId in your route
        const user = await User.findById(req.params.userId); 
        if (!user) return res.status(404).json({ message: "Not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};