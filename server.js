const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const { Server } = require('socket.io');
const { Follow, Like, Comment,Notification } = require('./models/index');
const app = express();
const url = process.env.FRONTEND_URL
app.use(cors({
    origin: true, 
    credentials: true
}));
app.use(express.json());
mongoose.connect('mongodb+srv://ravi-dev:ravi-dev@cluster0.bifue9z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0').then(()=>console.log('Database connected')).catch((err)=>console.log("Failed to connect",err))
const server = require('http').createServer(app);
const io = new Server(server, {
    cors: {
        origin: [
            url, // Without trailing slash
          `${url}/` // With trailing slash
        ],
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
        credentials: true
      },
      transports: ['polling', 'websocket']
  });

// Add connection validation
io.use((socket, next) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      socket.userId = userId;
      return next();
    }
    next(new Error('Authentication error'));
  });
  
  io.on('connection', (socket) => {
    console.log('User connected:', socket.userId);
    socket.join(socket.userId);
  });

app.post('/api/follow', async (req, res) => {
    const { followerId, followingId } = req.body;
    
    // Create follow relationship
    const follow = new Follow({ followerId, followingId });
    await follow.save();
    
    const notification = new Notification({
      userId: followingId,
      message:"follow message",
      type: 'follow',
      metadata: { followerId }
    });
    
    await notification.save();
    io.to(followingId).emit('new-notification', notification);
    
    res.status(201).json(follow);
  });

  app.post('/api/like', async (req, res) => {
    const { userId, postId, postOwnerId } = req.body;
    
    const like = new Like({ userId, postId, postOwnerId });
    await like.save();
    
    const notification = new Notification({
      userId: postOwnerId,
      message:"Like massage",
      type: 'like',
      metadata: { postId }
    });
    
    await notification.save();
    io.to(postOwnerId).emit('new-notification', notification);
    
    res.status(201).json(like);
  });
  // Add Comment
app.post('/api/comment', async (req, res) => {
    const { userId, postId, postOwnerId, text } = req.body;
    
    const comment = new Comment({ userId, postId, postOwnerId, text });
    await comment.save();
    
    const notification = new Notification({
      userId: postOwnerId,
      message:"comment notification",
      type: 'comment',
      metadata: { postId, commentId: comment._id }
    });
    
    await notification.save();
    io.to(postOwnerId).emit('new-notification', notification);
    
    res.status(201).json(comment);
  });

  app.get('/api/notifications/:userId', async (req, res) => {
    try {
        console.log("url",url);
        
        const notifications = await Notification.find({ userId: req.params.userId })
          .sort({ createdAt: -1 });
        res.json(notifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
      }
  });

  const PORT = process.env.PORT || 8080;
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));