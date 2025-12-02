import { io } from 'socket.io-client';
import { store } from '../app/store';
import {
  setConnected,
  userOnline,
  userOffline,
  addMessage,
  setTyping,
  addNotification,
} from '../store/slices/socketSlice';
import { addNewMessage, updateMessageReadStatus } from '../store/slices/messageSlice';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect() {
    if (this.socket) return;

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    this.socket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000', {
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
    });

    this.setupEventListeners();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      store.dispatch(setConnected(false));
    }
  }

  setupEventListeners() {
    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
      store.dispatch(setConnected(true));

      // Notify server that user is online
      const { user } = store.getState().auth;
      if (user) {
        this.socket.emit('user_online', user.id);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.isConnected = false;
      store.dispatch(setConnected(false));
    });

    this.socket.on('user_status_changed', (data) => {
      if (data.status === 'online') {
        store.dispatch(userOnline(data.userId));
      } else {
        store.dispatch(userOffline(data.userId));
      }
    });

    this.socket.on('new_message', (message) => {
      store.dispatch(addMessage({
        conversationId: this.getConversationId(message.from, message.to),
        message,
      }));
      store.dispatch(addNewMessage(message));
    });

    this.socket.on('new_message_notification', (data) => {
      const { user } = store.getState().auth;
      if (user && data.to === user.id) {
        store.dispatch(addNotification({
          type: 'message',
          title: 'New Message',
          message: `New message from ${data.message.from.name}`,
          data: data.message,
        }));
      }
    });

    this.socket.on('user_typing', (data) => {
      const { user } = store.getState().auth;
      const conversationId = this.getConversationId(data.userId, user.id);
      
      store.dispatch(setTyping({
        userId: data.userId,
        conversationId,
        isTyping: data.typing,
      }));
    });

    this.socket.on('messages_read', (data) => {
      store.dispatch(updateMessageReadStatus(data));
    });

    this.socket.on('message_error', (error) => {
      console.error('Socket message error:', error);
      store.dispatch(addNotification({
        type: 'error',
        title: 'Message Error',
        message: error.error,
      }));
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      store.dispatch(addNotification({
        type: 'error',
        title: 'Connection Error',
        message: 'Failed to connect to chat server',
      }));
    });
  }

  // Helper method to generate consistent conversation ID
  getConversationId(userId1, userId2) {
    return [userId1, userId2].sort().join('_');
  }

  // Join a conversation room
  joinConversation(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_conversation', conversationId);
    }
  }

  // Leave a conversation room
  leaveConversation(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_conversation', conversationId);
    }
  }

  // Send a message
  sendMessage(messageData) {
    if (this.socket && this.isConnected) {
      this.socket.emit('send_message', messageData);
    } else {
      // Fallback to REST API
      store.dispatch(sendMessage(messageData));
    }
  }

  // Mark messages as read
  markMessagesRead(userId, conversationWith) {
    if (this.socket && this.isConnected) {
      this.socket.emit('mark_messages_read', { userId, conversationWith });
    }
  }

  // Typing indicators
  startTyping(conversationId, userId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_start', { conversationId, userId });
    }
  }

  stopTyping(conversationId, userId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_stop', { conversationId, userId });
    }
  }

  // Check connection status
  getConnectionStatus() {
    return this.isConnected;
  }
}

export default new SocketService();