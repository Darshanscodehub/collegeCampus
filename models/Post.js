const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true // Every post must belong to a logged-in user
    },
    spaceCategory: {
        type: String,
        enum: ['General', 'Events', 'Opportunities'],
        required: true
    },
    content: {
        type: String,
        required: true,
        maxlength: 1000
    },
    imageUrl: {
        type: String,
        default: null // Will hold the path to the uploaded image file (e.g., '/uploads/image123.jpg')
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Stores IDs of users who liked it, so they can't like it twice!
    }],
    reportCount: {
        type: Number,
        default: 0 
    }
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);