const Message = require('../models/Message');
const User = require('../models/User');

// Store online users
const onlineUsers = new Map();

const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Authenticate user and add to online users
    socket.on('user_online', async (userId) => {
      try {
        onlineUsers.set(socket.id, userId);
        
        // Update user's online status
        await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });
        
        // Notify others about user coming online
        socket.broadcast.emit('user_status_changed', {
          userId,
          status: 'online',
        });

        console.log(`User ${userId} is now online`);
      } catch (error) {
        console.error('Error setting user online:', error);
      }
    });

    // Join conversation room
    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`User joined conversation: ${conversationId}`);
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(conversationId);
      console.log(`User left conversation: ${conversationId}`);
    });

    // Send message
    socket.on('send_message', async (messageData) => {
      try {
        const { from, to, text, productId, attachments = [] } = messageData;

        // Create and save message
        const message = new Message({
          from,
          to,
          text,
          productId,
          attachments,
        });

        await message.save();

        // Populate sender info
        await message.populate('from', 'name avatarUrl');
        await message.populate('to', 'name avatarUrl');
        if (productId) {
          await message.populate('productId', 'title images');
        }

        // Create conversation ID (unique for each pair of users)
        const conversationId = [from, to].sort().join('_');

        // Emit to both users in the conversation
        io.to(conversationId).emit('new_message', message);

        // Emit notification to recipient if they're not in the conversation
        const recipientOnline = Array.from(onlineUsers.values()).includes(to);
        if (!recipientOnline) {
          socket.broadcast.emit('new_message_notification', {
            to,
            message: {
              id: message.id,
              text: message.text,
              from: message.from,
              createdAt: message.createdAt,
            },
          });
        }

        console.log(`Message sent from ${from} to ${to}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message_error', {
          error: 'Failed to send message',
          details: error.message,
        });
      }
    });

    // Mark messages as read
    socket.on('mark_messages_read', async ({ userId, conversationWith }) => {
      try {
        await Message.updateMany(
          {
            from: conversationWith,
            to: userId,
            read: false,
          },
          {
            read: true,
            readAt: new Date(),
          }
        );

        // Notify the sender that their messages were read
        socket.to([userId, conversationWith].sort().join('_')).emit('messages_read', {
          userId,
          conversationWith,
        });

        console.log(`Messages from ${conversationWith} to ${userId} marked as read`);
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Typing indicators
    socket.on('typing_start', ({ conversationId, userId }) => {
      socket.to(conversationId).emit('user_typing', {
        userId,
        typing: true,
      });
    });

    socket.on('typing_stop', ({ conversationId, userId }) => {
      socket.to(conversationId).emit('user_typing', {
        userId,
        typing: false,
      });
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      try {
        const userId = onlineUsers.get(socket.id);
        if (userId) {
          onlineUsers.delete(socket.id);
          
          // Update user's online status
          await User.findByIdAndUpdate(userId, { 
            isOnline: false, 
            lastSeen: new Date() 
          });

          // Notify others about user going offline
          socket.broadcast.emit('user_status_changed', {
            userId,
            status: 'offline',
          });

          console.log(`User ${userId} is now offline`);
        }
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
};

module.exports = { setupSocketHandlers, onlineUsers };