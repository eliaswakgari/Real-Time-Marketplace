import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isConnected: false,
  onlineUsers: [],
  activeConversations: {},
  typingUsers: {},
  notifications: [],
};

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    setConnected: (state, action) => {
      state.isConnected = action.payload;
    },
    
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    
    userOnline: (state, action) => {
      const userId = action.payload;
      if (!state.onlineUsers.includes(userId)) {
        state.onlineUsers.push(userId);
      }
    },
    
    userOffline: (state, action) => {
      const userId = action.payload;
      state.onlineUsers = state.onlineUsers.filter(id => id !== userId);
    },
    
    addMessage: (state, action) => {
      const { conversationId, message } = action.payload;
      
      if (!state.activeConversations[conversationId]) {
        state.activeConversations[conversationId] = [];
      }
      
      state.activeConversations[conversationId].push(message);
    },
    
    setTyping: (state, action) => {
      const { userId, conversationId, isTyping } = action.payload;
      
      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = [];
      }
      
      if (isTyping) {
        if (!state.typingUsers[conversationId].includes(userId)) {
          state.typingUsers[conversationId].push(userId);
        }
      } else {
        state.typingUsers[conversationId] = state.typingUsers[conversationId].filter(
          id => id !== userId
        );
      }
    },
    
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        ...action.payload,
      });
    },
    
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    
    clearNotifications: (state) => {
      state.notifications = [];
    },
    
    setConversationMessages: (state, action) => {
      const { conversationId, messages } = action.payload;
      state.activeConversations[conversationId] = messages;
    },
    
    markConversationRead: (state, action) => {
      const { conversationId, userId } = action.payload;
      
      if (state.activeConversations[conversationId]) {
        state.activeConversations[conversationId] = state.activeConversations[conversationId].map(
          message => {
            if (message.from === userId && !message.read) {
              return { ...message, read: true, readAt: new Date().toISOString() };
            }
            return message;
          }
        );
      }
    },
  },
});

export const {
  setConnected,
  setOnlineUsers,
  userOnline,
  userOffline,
  addMessage,
  setTyping,
  addNotification,
  removeNotification,
  clearNotifications,
  setConversationMessages,
  markConversationRead,
} = socketSlice.actions;

export default socketSlice.reducer;