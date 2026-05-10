const Whitelist = require('../models/Whitelist');
const User = require('../models/User');
const csv = require('csv-parser');
const fs = require('fs');

// 1. Whitelist Users via CSV
exports.bulkOnboard = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a CSV file.' });
        }

        const results = [];
        const filePath = req.file.path;

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => {
                if (data.email) {
                    results.push({ email: data.email.toLowerCase().trim() });
                }
            })
            .on('end', async () => {
                try {
                    // Using ordered: false so it continues even if some emails are duplicates
                    await Whitelist.insertMany(results, { ordered: false });
                    
                    fs.unlinkSync(filePath); // Clean up temp file
                    res.status(200).json({ 
                        message: `Successfully whitelisted ${results.length} student emails.` 
                    });
                } catch (err) {
                    // If some emails already existed, unlink and return success anyway
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                    res.status(200).json({ message: "Whitelist updated (duplicates ignored)." });
                }
            });
    } catch (error) {
        res.status(500).json({ error: 'Failed to process CSV.' });
    }
};

// 2. Dashboard Statistics
exports.getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const studentCount = await User.countDocuments({ role: 'Student' });
        const alumniCount = await User.countDocuments({ role: 'Alumni' });
        const whitelistedCount = await Whitelist.countDocuments();

        res.status(200).json({ totalUsers, studentCount, alumniCount, whitelistedCount });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats.' });
    }
};