const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('./models/User');
const Message = require('./models/Message');
const Group = require('./models/Group');

const JWT_SECRET = 'supersecretchatkey'; // in real app use .env

router.get('/', (req, res) => {
  res.send({ response: "Server is up and running." }).status(200);
});

// User Registration
router.post('/auth/register', async (req, res) => {
  try {
    const { name, password } = req.body;
    let user = await User.findOne({ name });
    if (user) return res.status(400).json({ error: 'User already exists' });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ name, password: hashedPassword });
    await user.save();
    
    const token = jwt.sign({ id: user._id, name: user.name }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { name: user.name, avatar: user.avatar, bio: user.bio, themePreference: user.themePreference } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User Login
router.post('/auth/login', async (req, res) => {
  try {
    const { name, password } = req.body;
    const user = await User.findOne({ name });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, name: user.name }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { name: user.name, avatar: user.avatar, bio: user.bio, themePreference: user.themePreference } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get User Profile
router.get('/users/profile/:name', async (req, res) => {
  try {
    const user = await User.findOne({ name: req.params.name }).select('-password').populate('contacts', 'name avatar bio isOnline');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Profile
router.put('/users/profile/:name', async (req, res) => {
  try {
    const { avatar, bio, themePreference } = req.body;
    const user = await User.findOneAndUpdate(
      { name: req.params.name }, 
      { avatar, bio, themePreference }, 
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search Users
router.get('/users/search/:query', async (req, res) => {
  try {
    const users = await User.find({ name: { $regex: req.params.query, $options: 'i' } }).select('name avatar bio');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add Contact
router.post('/users/contact', async (req, res) => {
  try {
    const { userName, contactName } = req.body;
    const user = await User.findOne({ name: userName });
    const contact = await User.findOne({ name: contactName });
    
    if (!user || !contact) return res.status(404).json({ error: 'User not found' });
    
    if (!user.contacts.includes(contact._id)) {
      user.contacts.push(contact._id);
      await user.save();
    }
    res.json({ success: true, message: 'Contact added' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get messages for 1-on-1 chat
router.get('/messages/:user1/:user2', async (req, res) => {
  try {
    const { user1, user2 } = req.params;
    const messages = await Message.find({
      isGroup: false,
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 }
      ]
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get images for Gallery
router.get('/gallery/:user1/:user2', async (req, res) => {
  try {
    const { user1, user2 } = req.params;
    const messages = await Message.find({
      isGroup: false,
      mediaBase64: { $ne: '' },
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 }
      ]
    }).sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;