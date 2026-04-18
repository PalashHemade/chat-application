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
app.use('/api', router);

mongoose.connect('mongodb://127.0.0.1:27017/chat_app').then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

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

  socket.on('sendMessage', async ({ receiver, text, isGroup, mediaBase64 }, callback) => {
    try {
      const senderUser = await User.findOne({ socketId: socket.id });
      if (!senderUser) return callback('Sender not found.');

      const message = new Message({
        sender: senderUser.name,
        receiver,
        text,
        isGroup: isGroup || false,
        mediaBase64: mediaBase64 || ''
      });
      await message.save();

      if (isGroup) {
        io.to(receiver).emit('message', message);
      } else {
        const receiverUser = await User.findOne({ name: receiver });
        if (receiverUser && receiverUser.isOnline && receiverUser.socketId) {
          io.to(receiverUser.socketId).emit('message', message);
        }
        socket.emit('message', message);
      }

      if (callback) callback();
    } catch (err) {
      if (callback) callback(err.message);
    }
  });

  socket.on('typing', ({ receiver }) => {
    User.findOne({ name: receiver }).then(user => {
      if(user && user.isOnline) io.to(user.socketId).emit('typing', { sender: socket.id });
    });
  });

  socket.on('stopTyping', ({ receiver }) => {
    User.findOne({ name: receiver }).then(user => {
      if(user && user.isOnline) io.to(user.socketId).emit('stopTyping');
    });
  });

  socket.on('markAsRead', async ({ sender }) => {
    // Current user read messages from sender
    const currentUser = await User.findOne({ socketId: socket.id });
    if(currentUser) {
      await Message.updateMany(
        { sender: sender, receiver: currentUser.name, status: { $ne: 'read' } },
        { $set: { status: 'read' } }
      );
      const senderUser = await User.findOne({ name: sender });
      if(senderUser && senderUser.isOnline) {
        io.to(senderUser.socketId).emit('messagesRead', { reader: currentUser.name });
      }
    }
  });

  socket.on('deleteMessage', async ({ messageId }, callback) => {
    try {
      const message = await Message.findById(messageId);
      if(message) {
        message.isDeleted = true;
        await message.save();
        io.emit('messageDeleted', { messageId });
      }
      if(callback) callback();
    } catch(err) {}
  });

  socket.on('editMessage', async ({ messageId, text }, callback) => {
    try {
      const message = await Message.findById(messageId);
      if(message) {
        message.text = text;
        message.isEdited = true;
        await message.save();
        io.emit('messageEdited', { message });
      }
      if(callback) callback();
    } catch(err) {}
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