const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const upload = require('../middleware/uploadMiddleware');

// 1. Create a Post (Supports Text + Device Image Upload)
// We use 'image' as the field name for the Multer upload
router.post('/create', upload.single('image'), postController.createPost);

// 2. Get All Posts
// This route returns the feed (automatically hides posts with 5+ reports)
router.get('/all', postController.getPosts);

// 3. Like/Unlike a Post
router.post('/:postId/like', postController.toggleLike);

// 4. Report a Post
// Triggers the threshold logic: if reports >= 5, post is hidden from /all
router.post('/:postId/report', postController.reportPost);

module.exports = router;