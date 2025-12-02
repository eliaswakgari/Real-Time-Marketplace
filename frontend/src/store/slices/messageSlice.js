import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../utils/axios';

// Async thunks
export const fetchConversations = createAsyncThunk(
  'messages/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/messages/conversations');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch conversations' });
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async ({ userId, page = 1 }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/messages/${userId}?page=${page}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch messages' });
    }
  }
);

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async (messageData, { rejectWithValue }) => {
    try {
      const response = await api.post('/messages', messageData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to send message' });
    }
  }
);

export const markMessagesAsRead = createAsyncThunk(
  'messages/markAsRead',
  async (messageIds, { rejectWithValue }) => {
    try {
      const response = await api.patch('/messages/read', { messageIds });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to mark messages as read' });
    }
  }
);

const initialState = {
  conversations: [],
  currentConversation: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
  },
};

const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    setCurrentConversation: (state, action) => {
      state.currentConversation = action.payload;
    },
    
    addNewMessage: (state, action) => {
      const message = action.payload;
      
      // Update conversations list with new last message
      const conversationIndex = state.conversations.findIndex(
        conv => conv.user.id === message.from || conv.user.id === message.to
      );
      
      if (conversationIndex !== -1) {
        state.conversations[conversationIndex].lastMessage = {
          id: message.id,
          text: message.text,
          createdAt: message.createdAt,
          read: message.read,
        };
        
        // Move conversation to top
        const conversation = state.conversations.splice(conversationIndex, 1)[0];
        state.conversations.unshift(conversation);
      }
      
      // Add message to current conversation if active
      if (state.currentConversation && 
          (state.currentConversation.user.id === message.from || 
           state.currentConversation.user.id === message.to)) {
        if (!state.currentConversation.messages) {
          state.currentConversation.messages = [];
        }
        state.currentConversation.messages.push(message);
      }
    },
    
    updateMessageReadStatus: (state, action) => {
      const { userId } = action.payload;
      
      // Update in conversations
      state.conversations = state.conversations.map(conv => {
        if (conv.user.id === userId) {
          return {
            ...conv,
            unreadCount: 0,
          };
        }
        return conv;
      });
      
      // Update in current conversation
      if (state.currentConversation && state.currentConversation.user.id === userId) {
        state.currentConversation.messages = state.currentConversation.messages.map(message => {
          if (message.from === userId && !message.read) {
            return { ...message, read: true, readAt: new Date().toISOString() };
          }
          return message;
        });
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Conversations
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload.conversations;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch conversations';
      })
      // Fetch Messages
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentConversation) {
          state.currentConversation.messages = action.payload.messages;
        }
        state.pagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          total: action.payload.total,
        };
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch messages';
      });
  },
});

export const {
  setLoading,
  clearError,
  setCurrentConversation,
  addNewMessage,
  updateMessageReadStatus,
} = messageSlice.actions;

export default messageSlice.reducer;