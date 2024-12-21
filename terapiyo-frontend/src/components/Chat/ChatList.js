import React from 'react';
import { useChat } from '../../hooks/useChat';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { UserCircleIcon } from '@heroicons/react/solid';
import LoadingSpinner from '../Common/LoadingSpinner';

const ChatList = ({ onSelectChat, selectedChatId }) => {
  const { chats, isLoading } = useChat();

  if (isLoading.chats) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  const formatLastMessage = (message) => {
    if (!message) return '';
    if (message.deletedAt) return 'Bu mesaj silindi';
    if (message.attachments?.length > 0) return '📎 Dosya';
    return message.content;
  };

  const formatDate = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return format(messageDate, 'HH:mm');
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Dün';
    } else if (messageDate.getFullYear() === today.getFullYear()) {
      return format(messageDate, 'd MMM', { locale: tr });
    } else {
      return format(messageDate, 'd MMM yyyy', { locale: tr });
    }
  };

  return (
    <div className="divide-y divide-gray-200">
      {chats?.map((chat) => (
        <button
          key={chat.id}
          onClick={() => onSelectChat(chat.id)}
          className={`w-full px-4 py-3 flex items-start space-x-3 hover:bg-gray-50 focus:outline-none ${
            selectedChatId === chat.id ? 'bg-blue-50' : ''
          }`}
        >
          {/* Avatar */}
          <div className="flex-shrink-0">
            {chat.recipient.avatar ? (
              <img
                src={chat.recipient.avatar}
                alt={chat.recipient.name}
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <UserCircleIcon className="h-10 w-10 text-gray-400" />
            )}
            {chat.recipient.isOnline && (
              <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white" />
            )}
          </div>

          {/* İçerik */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p
                className={`text-sm font-medium ${
                  chat.unreadCount > 0
                    ? 'text-gray-900'
                    : 'text-gray-600'
                }`}
              >
                {chat.recipient.name}
              </p>
              <p
                className={`text-xs ${
                  chat.unreadCount > 0
                    ? 'text-gray-900'
                    : 'text-gray-500'
                }`}
              >
                {formatDate(chat.lastMessage?.createdAt)}
              </p>
            </div>
            <div className="flex items-center justify-between mt-1">
              <p
                className={`text-sm truncate ${
                  chat.unreadCount > 0
                    ? 'text-gray-900 font-medium'
                    : 'text-gray-500'
                }`}
              >
                {formatLastMessage(chat.lastMessage)}
              </p>
              {chat.unreadCount > 0 && (
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-xs font-medium text-blue-800">
                  {chat.unreadCount}
                </span>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default ChatList;
