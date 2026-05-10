const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
        profile: { firstName: 'System', lastName: 'Admin' },
        email: 'admin@campusnet.com',
        password: hashedAdminPassword,
        role: 'Admin',
        badge: 'Staff'
    });
    await admin.save();
    console.log("✅ Admin Created: admin@campusnet.com / admin123");
    process.exit();
});