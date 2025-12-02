import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchMessages,
  sendMessage 
} from '../../store/slices/messageSlice';
import { 
  markMessagesRead,
  startTyping,
  stopTyping 
} from '../../services/socketService';
import {
  Send,
  Paperclip,
  Image,
  X,
  Minimize2,
  Maximize2,
  MessageCircle
} from 'lucide-react';

const ChatWindow = ({ 
  isOpen, 
  conversation, 
  onClose, 
  onMinimize,
  isMinimized 
}) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { activeConversations, typingUsers } = useSelector(state => state.socket);
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const conversationId = conversation ? 
    [user.id, conversation.user.id].sort().join('_') : null;
  
  const messages = conversationId ? activeConversations[conversationId] || [] : [];
  const isTypingActive = conversationId && typingUsers[conversationId]?.includes(conversation.user.id);

  useEffect(() => {
    if (conversation && isOpen) {
      dispatch(fetchMessages({ userId: conversation.user.id }));
      markMessagesRead(user.id, conversation.user.id);
    }
  }, [dispatch, conversation, user.id, isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (conversationId && isOpen) {
      startTyping(conversationId, user.id);
      setIsTyping(true);
    }

    return () => {
      if (conversationId && isTyping) {
        stopTyping(conversationId, user.id);
      }
    };
  }, [conversationId, isOpen, user.id, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e) => {
    setMessageText(e.target.value);

    if (!isTyping) {
      startTyping(conversationId, user.id);
      setIsTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(conversationId, user.id);
      setIsTyping(false);
    }, 1000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageText.trim() || !conversation) return;

    const messageData = {
      from: user.id,
      to: conversation.user.id,
      text: messageText.trim(),
    };

    // Clear typing
    if (isTyping) {
      stopTyping(conversationId, user.id);
      setIsTyping(false);
    }

    // Send via socket (fallback to REST in socket service)
    const { sendMessage } = await import('../../services/socketService');
    sendMessage.default.sendMessage(messageData);

    setMessageText('');
  };

  const formatMessageTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!conversation) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ 
            opacity: 1, 
            y: isMinimized ? 0 : 0, 
            scale: 1,
            height: isMinimized ? 60 : 500,
            width: isMinimized ? 300 : 400
          }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
          style={{ 
            width: isMinimized ? 300 : 400,
            height: isMinimized ? 60 : 500 
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center gap-3">
              {conversation.user.avatarUrl ? (
                <img
                  src={conversation.user.avatarUrl}
                  alt={conversation.user.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                  {conversation.user.name}
                </h3>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${
                    isTypingActive ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {isTypingActive ? 'Typing...' : 'Online'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={onMinimize}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </button>
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      No messages yet. Start the conversation!
                    </p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.from === user.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          message.from === user.id
                            ? 'bg-primary-500 text-white rounded-br-none'
                            : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none border border-gray-200 dark:border-gray-600'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <div className={`text-xs mt-1 ${
                          message.from === user.id 
                            ? 'text-primary-100' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {formatMessageTime(message.createdAt)}
                          {message.from === user.id && (
                            <span className="ml-1">
                              {message.read ? '✓✓' : '✓'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {/* Typing Indicator */}
                {isTypingActive && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-gray-700 px-4 py-2 rounded-2xl rounded-bl-none border border-gray-200 dark:border-gray-600">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <Paperclip className="h-5 w-5" />
                  </button>
                  
                  <input
                    type="text"
                    value={messageText}
                    onChange={handleInputChange}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  
                  <button
                    type="submit"
                    disabled={!messageText.trim()}
                    className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </form>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatWindow;