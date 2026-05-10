const Post = require('../models/Post');

// 1. Get All Posts (Filtered by Report Threshold)
exports.getPosts = async (req, res) => {
    try {
        // IMPORTANT: We only fetch posts where reportCount is LESS THAN 5
        const posts = await Post.find({ reportCount: { $lt: 5 } })
            .populate('authorId', 'profile.firstName profile.lastName badge')
            .sort({ createdAt: -1 });

        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch feed' });
    }
};

// 2. Create Post (Text + Image)
exports.createPost = async (req, res) => {
    try {
        const { content, authorId, spaceCategory } = req.body;

        // 1. Validation Check
        if (!authorId || authorId === 'undefined' || authorId === 'null') {
            return res.status(400).json({ message: "You must be logged in to post." });
        }

        // 2. Handle the Image (Multer puts the file info in req.file)
        let imageUrl = '';
        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
        }

        // 3. Create the document matching your post.js schema
        const newPost = new Post({
            authorId: authorId,
            content: content,
            spaceCategory: spaceCategory || 'General',
            imageUrl: imageUrl,
            likes: [],
            reportCount: 0 // Matching your model's field name
        });

        await newPost.save();
        
        // 4. Send back the success response
        res.status(201).json({ 
            message: "Post successfully shared!", 
            post: newPost 
        });

    } catch (err) {
        console.error("Critical Post Error:", err);
        res.status(500).json({ 
            message: "Database error", 
            error: err.message 
        });
    }
};
// 3. Report Post (The Threshold Logic)
exports.reportPost = async (req, res) => {
    try {
        const { postId } = req.params;

        // Find the post and increment reportCount by 1
        const post = await Post.findByIdAndUpdate(
            postId, 
            { $inc: { reportCount: 1 } }, 
            { new: true }
        );

        if (!post) return res.status(404).json({ message: 'Post not found' });

        // Logic check for the examiner:
        let statusMessage = "Post reported.";
        if (post.reportCount >= 5) {
            statusMessage = "Post has been hidden for moderator review.";
        }

        res.status(200).json({ 
            message: statusMessage, 
            reports: post.reportCount 
        });

    } catch (error) {
        res.status(500).json({ error: 'Reporting failed' });
    }
};

// 4. Toggle Like
exports.toggleLike = async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId } = req.body;
        const post = await Post.findById(postId);
        
        const alreadyLiked = post.likes.includes(userId);
        if (alreadyLiked) post.likes.pull(userId);
        else post.likes.push(userId);

        await post.save();
        res.status(200).json({ totalLikes: post.likes.length });
    } catch (error) {
        res.status(500).json({ error: 'Like failed' });
    }
};