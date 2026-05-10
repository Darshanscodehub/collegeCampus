const mongoose = require('mongoose');

const whitelistSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true }
}, { timestamps: true });

module.exports = mongoose.model('Whitelist', whitelistSchema);