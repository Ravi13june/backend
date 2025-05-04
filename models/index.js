const mongoose  = require("mongoose");

// Follow System
const followSchema = new mongoose.Schema({
    followerId: String,
    followingId: String,
    createdAt: { type: Date, default: Date.now }
  });
  
  // Like System
  const likeSchema = new mongoose.Schema({
    userId: String,
    postId: String,
    postOwnerId: String,
    createdAt: { type: Date, default: Date.now }
  });
  
  // Comment System
  const commentSchema = new mongoose.Schema({
    userId: String,
    postId: String,
    postOwnerId: String,
    text: String,
    createdAt: { type: Date, default: Date.now }
  });

  const notificationSchema = new mongoose.Schema({
    userId: String,
    message: String,
    type: String,
    createdAt: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
    metadata: mongoose.Schema.Types.Mixed
  });
  
  module.exports = {
    Follow: mongoose.model('Follow', followSchema),
    Like: mongoose.model('Like', likeSchema),
    Comment: mongoose.model('Comment', commentSchema),
    Notification: mongoose.model('Notification', notificationSchema)
  };