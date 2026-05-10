const mongoose = require('mongoose');

const whitelistSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    role: { type: String, default: 'Student' },
    cohortBadge: { type: String, default: '' },
    addedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Whitelist', whitelistSchema);