const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

const User = require('./models/User');
const Message = require('./models/Message');
const router = require('./router');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use(router);

mongoose.connect('mongodb://127.0.0.1:27017/chat_app').then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// API Routes
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/messages/:user1/:user2', async (req, res) => {
  try {
    const { user1, user2 } = req.params;
    const messages = await Message.find({
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

// Socket Logic
io.on('connect', (socket) => {
  socket.on('join', async ({ name }, callback) => {
    try {
      if(!name) return callback('Name is required.');
      
      let user = await User.findOne({ name });
      if (user) {
        user.isOnline = true;
        user.socketId = socket.id;
        await user.save();
      } else {
        user = new User({ name, isOnline: true, socketId: socket.id });
        await user.save();
      }

      // Broadcast updated user list to everyone
      const users = await User.find({});
      io.emit('roomData', { users });
      
      callback();
    } catch (err) {
      if (callback) callback(err.message);
    }
  });

  socket.on('sendMessage', async ({ receiver, text }, callback) => {
    try {
      const senderUser = await User.findOne({ socketId: socket.id });
      if (!senderUser) return callback('Sender not found.');

      const message = new Message({
        sender: senderUser.name,
        receiver,
        text
      });
      await message.save();

      const receiverUser = await User.findOne({ name: receiver });

      // Send to receiver if online
      if (receiverUser && receiverUser.isOnline && receiverUser.socketId) {
        io.to(receiverUser.socketId).emit('message', message);
      }
      // Send back to sender
      socket.emit('message', message);

      if (callback) callback();
    } catch (err) {
      if (callback) callback(err.message);
    }
  });

  socket.on('disconnect', async () => {
    try {
      const user = await User.findOne({ socketId: socket.id });
      if (user) {
        user.isOnline = false;
        user.socketId = null;
        await user.save();
        
        const users = await User.find({});
        io.emit('roomData', { users });
      }
    } catch (err) {
      console.log(err);
    }
  });
});

server.listen(process.env.PORT || 5000, () => console.log(`Server has started on port ${process.env.PORT || 5000}.`));