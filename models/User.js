const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    profile: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true }
    },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true 
    },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['Student', 'Alumni', 'Faculty' , 'Admin'], 
        default: 'Student' 
    },
    badge: { type: String }, // For your "MCA 2026" field
    reports: { type: Number, default: 0 }
}, { timestamps: true });

// This compiles the model and exports it
module.exports = mongoose.model('User', userSchema);