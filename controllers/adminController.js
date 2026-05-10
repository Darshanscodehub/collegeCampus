const fs = require('fs');
const csv = require('csv-parser');
const Whitelist = require('../models/Whitelist');
const User = require('../models/User');

exports.getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const studentCount = await User.countDocuments({ role: 'Student' });
        const whitelistedCount = await Whitelist.countDocuments();

        res.status(200).json({ totalUsers, studentCount, whitelistedCount });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats.' });
    }
};

exports.bulkOnboard = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No CSV file uploaded' });

    const results = [];
    let addedCount = 0;

    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            try {
                for (const row of results) {
                    const email = row.Email ? row.Email.toLowerCase().trim() : null;
                    if (email) {
                        await Whitelist.findOneAndUpdate(
                            { email: email },
                            { 
                                email: email,
                                role: row.Role || 'Student',
                                cohortBadge: row.CohortBadge || ''
                            },
                            { upsert: true }
                        );
                        addedCount++;
                    }
                }
                fs.unlinkSync(req.file.path);
                res.status(200).json({ message: 'Bulk onboarding successful', addedCount });
            } catch (error) {
                res.status(500).json({ message: 'Error processing file' });
            }
        });
};
