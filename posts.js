const express = require('express');
const router = express.Router();
const Post = require('backend/models/Post');
const {verifyToken, authorizeRole} = require('../middleware/authMiddleware');

router.get('/', async(req, res) => {
    try {
        const posts = await Post.find().populate('author', 'usernamme');
        res.json(posts);
    }
    catch(error)
    {
        res.status(500).json({ message: error.message });
    }
});

router.get('/:id', async(req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('author', 'username');
        if(!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json(post);
    }
    catch(error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/', verifyToken, authorizeRole(['admin', 'author']) ,async(req, res) => {
    const post = new Post({
        title: req.body.title,
        content: req.body.content,
        author: req.user.id
    });
    try {
        const newPost = await post.save();
        res.status(201).json(newPost);
    }
    catch(error) {
        res.status(400).json({ message: error.message });
    }
});

router.patch('/:id', verifyToken, authorizeRole(['admin', 'author']), async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post)
        {
            return res.status(404).json({message: 'Post not found' });
        }

        if(post.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'No authorized' });
        }

        if(req.body.title)
        {
            post.title = req.body.title;
        }
        if(req.body.content)
        {
            post.content = req.body.content;
        }
        post.updatedAt = Date.now();

        const updatedPost = await post.save();
        res.json(updatedPost);
    }
    catch(error)
    {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/:id', verifyToken, authorizeRole(['admin', 'author']) ,async(req, res) => {
    try {
        const  post = await Post.findById(req.params.id);
        if(!post)
        {
            return res.status(404).json({ message: 'Post not found' });
        }

        if(post.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }
        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: 'Post deleted' });
    }
    catch(error)
    {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;