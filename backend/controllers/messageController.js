const Message = require('../models/Message');
const User = require('../models/User');

// Get conversations for a user
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get distinct conversations with last message
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ from: userId }, { to: userId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$from', userId] },
              '$to',
              '$from',
            ],
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$to', userId] }, { $eq: ['$read', false] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          _id: 0,
          user: {
            id: '$user._id',
            name: '$user.name',
            avatarUrl: '$user.avatarUrl',
            isOnline: '$user.isOnline',
            lastSeen: '$user.lastSeen',
          },
          lastMessage: {
            id: '$lastMessage._id',
            text: '$lastMessage.text',
            createdAt: '$lastMessage.createdAt',
            read: '$lastMessage.read',
          },
          unreadCount: 1,
        },
      },
      {
        $sort: { 'lastMessage.createdAt': -1 },
      },
    ]);

    res.json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations',
    });
  }
};

// Get messages between two users
exports.getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const otherUserId = req.params.userId;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({
      $or: [
        { from: userId, to: otherUserId },
        { from: otherUserId, to: userId },
      ],
    })
      .populate('from', 'name avatarUrl')
      .populate('to', 'name avatarUrl')
      .populate('productId', 'title images price')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Mark messages as read
    await Message.updateMany(
      {
        from: otherUserId,
        to: userId,
        read: false,
      },
      {
        read: true,
        readAt: new Date(),
      }
    );

    const total = await Message.countDocuments({
      $or: [
        { from: userId, to: otherUserId },
        { from: otherUserId, to: userId },
      ],
    });

    res.json({
      success: true,
      messages: messages.reverse(), // Return in chronological order
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
    });
  }
};

// Send message (REST endpoint for fallback)
exports.sendMessage = async (req, res) => {
  try {
    const { to, text, productId, attachments = [] } = req.body;

    const message = new Message({
      from: req.user.id,
      to,
      text,
      productId,
      attachments,
    });

    await message.save();
    await message.populate('from', 'name avatarUrl');
    await message.populate('to', 'name avatarUrl');
    if (productId) {
      await message.populate('productId', 'title images');
    }

    res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
    });
  }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    const { messageIds } = req.body;

    await Message.updateMany(
      {
        _id: { $in: messageIds },
        to: req.user.id,
      },
      {
        read: true,
        readAt: new Date(),
      }
    );

    res.json({
      success: true,
      message: 'Messages marked as read',
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking messages as read',
    });
  }
};