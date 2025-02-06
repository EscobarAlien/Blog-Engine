const express = require('express');
const router = express.Router();
const User = require('backend/models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {verifyToken, authorizeRole} = require('../middleware/authMiddleware');

router.post('/register', async(req, res) => {
    try {
        const { username, password, role } = req.body;

        const user = new User({
            username,
            password,
            role
        });

        await user.save();
        res.status(201).json({ message: 'User created successssfully' });
    }
    catch(error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating user' });
    }
});

router.post('/login', async(req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if(!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = await user.comparePassword(password);
        if(!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn:'1h' },
            (err, token) => {
                if(err) throw err;
                res.json({ token });
            }
        );
    }
    catch(error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/current', verifyToken, async(req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    }
    catch(error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/',  verifyToken, authorizeRole(['admin']), async(req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    }
    catch(error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;