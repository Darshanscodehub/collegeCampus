const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the 'uploads' directory exists to prevent errors
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configure storage logic
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Renames file to: timestamp-originalName (e.g. 1715355384201-map.png)
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// File filter (Optional: you can restrict to images and csv only)
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['.csv', '.jpg', '.jpeg', '.png', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Only Images and CSV files are allowed'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter
});

module.exports = upload;