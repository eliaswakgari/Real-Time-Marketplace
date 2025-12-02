import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  fetchConversations,
  setCurrentConversation 
} from '../../store/slices/messageSlice';
import { 
  Search, 
  MessageCircle, 
  Circle, 
  CheckCircle2,
  User
} from 'lucide-react';

const ChatSidebar = ({ isOpen, onSelectConversation, onClose }) => {
  const dispatch = useDispatch();
  const { conversations, loading } = useSelector(state => state.messages);
  const { onlineUsers } = useSelector(state => state.socket);
  const { user } = useSelector(state => state.auth);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchConversations());
    }
  }, [dispatch, isOpen]);

  const filteredConversations = conversations.filter(conv =>
    conv.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConversationSelect = (conversation) => {
    dispatch(setCurrentConversation(conversation));
    onSelectConversation(conversation.user.id);
    onClose();
  };

  const formatLastMessage = (text) => {
    if (text.length > 40) {
      return text.substring(0, 40) + '...';
    }
    return text;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-900 shadow-xl z-50 border-r border-gray-200 dark:border-gray-700"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Messages
                </h2>
                <button
                  onClick={onClose}
                  className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  ✕
                </button>
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="h-[calc(100vh-120px)] overflow-y-auto">
              {loading ? (
                <div className="p-4 space-y-4">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-3 animate-pulse">
                      <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center p-4">
                  <MessageCircle className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No conversations yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Start a conversation by messaging a seller or buyer.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredConversations.map((conversation) => (
                    <motion.button
                      key={conversation.user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => handleConversationSelect(conversation)}
                      className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          {conversation.user.avatarUrl ? (
                            <img
                              src={conversation.user.avatarUrl}
                              alt={conversation.user.name}
                              className="w-12 h-12 rounded-full"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                              <User className="h-6 w-6 text-white" />
                            </div>
                          )}
                          
                          {/* Online Status */}
                          {onlineUsers.includes(conversation.user.id) ? (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
                          ) : (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gray-400 rounded-full border-2 border-white dark:border-gray-900" />
                          )}
                        </div>

                        {/* Conversation Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                              {conversation.user.name}
                            </h3>
                            {conversation.lastMessage && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                                {formatTime(conversation.lastMessage.createdAt)}
                              </span>
                            )}
                          </div>

                          {conversation.lastMessage && (
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-gray-600 dark:text-gray-400 truncate flex-1">
                                {formatLastMessage(conversation.lastMessage.text)}
                              </p>
                              
                              {/* Unread Indicator */}
                              {conversation.unreadCount > 0 && (
                                <span className="bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">
                                  {conversation.unreadCount}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChatSidebar;