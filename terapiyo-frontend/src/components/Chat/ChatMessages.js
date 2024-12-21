import React, { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useChat } from '../../hooks/useChat';
import {
  DocumentIcon,
  DownloadIcon,
  TrashIcon
} from '@heroicons/react/outline';
import LoadingSpinner from '../Common/LoadingSpinner';

const ChatMessages = ({ chatId }) => {
  const {
    messages,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isTyping,
    deleteMessage,
    markMessage
  } = useChat(chatId);

  const messagesEndRef = useRef(null);
  const observerRef = useRef(null);

  // Mesajları otomatik kaydır
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Sonsuz kaydırma
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage]);

  const formatMessageDate = (date) => {
    return format(new Date(date), 'HH:mm', { locale: tr });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${
      sizes[i]
    }`;
  };

  const handleDeleteMessage = (messageId) => {
    if (
      window.confirm('Bu mesajı silmek istediğinizden emin misiniz?')
    ) {
      deleteMessage(messageId);
    }
  };

  if (isLoading.messages) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 p-4">
      {/* Sonsuz kaydırma referansı */}
      {hasNextPage && <div ref={observerRef} />}

      {messages?.pages.map((page, pageIndex) =>
        page.messages.map((message, messageIndex) => {
          const isOwnMessage = message.senderId === 'currentUser'; // Kullanıcı ID'sini kontrol et
          return (
            <div
              key={message.id}
              className={`flex ${
                isOwnMessage ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] ${
                  isOwnMessage
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                } rounded-lg px-4 py-2 space-y-1`}
              >
                {/* Mesaj içeriği */}
                {!message.deletedAt && message.content && (
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                )}

                {/* Silinen mesaj */}
                {message.deletedAt && (
                  <p className="text-sm italic opacity-75">
                    Bu mesaj silindi
                  </p>
                )}

                {/* Dosya ekleri */}
                {message.attachments?.map((attachment) => (
                  <div
                    key={attachment.id}
                    className={`flex items-center space-x-2 p-2 rounded ${
                      isOwnMessage
                        ? 'bg-blue-700'
                        : 'bg-gray-200'
                    }`}
                  >
                    <DocumentIcon className="h-5 w-5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {attachment.name}
                      </p>
                      <p className="text-xs opacity-75">
                        {formatFileSize(attachment.size)}
                      </p>
                    </div>
                    <a
                      href={attachment.url}
                      download
                      className="p-1 rounded-full hover:bg-opacity-10 hover:bg-black"
                    >
                      <DownloadIcon className="h-4 w-4" />
                    </a>
                  </div>
                ))}

                {/* Alt bilgi */}
                <div
                  className={`flex items-center justify-end space-x-2 text-xs ${
                    isOwnMessage
                      ? 'text-blue-100'
                      : 'text-gray-500'
                  }`}
                >
                  <span>
                    {formatMessageDate(message.createdAt)}
                  </span>
                  {message.read && isOwnMessage && (
                    <span>✓✓</span>
                  )}
                  {isOwnMessage && !message.deletedAt && (
                    <button
                      onClick={() => handleDeleteMessage(message.id)}
                      className="p-1 rounded-full hover:bg-opacity-10 hover:bg-black"
                    >
                      <TrashIcon className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* Yazıyor göstergesi */}
      {isTyping && (
        <div className="flex items-center space-x-2 text-gray-500">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
          </div>
          <span className="text-sm">Yazıyor...</span>
        </div>
      )}

      {/* Otomatik kaydırma referansı */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
