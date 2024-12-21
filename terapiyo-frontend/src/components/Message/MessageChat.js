import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  PaperAirplaneIcon,
  PaperClipIcon,
  DotsVerticalIcon,
  PhotographIcon,
  DocumentIcon,
  XIcon
} from '@heroicons/react/outline';
import { useMessage } from '../../hooks/useMessage';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';

const MessageChat = () => {
  const { chatId } = useParams();
  const {
    messages,
    isLoading,
    errors,
    pagination,
    sendMessage,
    sendFile,
    markMessage,
    deleteMessage
  } = useMessage(chatId);

  const [newMessage, setNewMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sohbet sonuna kaydır
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mesaj gönder
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    sendMessage({ content: newMessage });
    setNewMessage('');
  };

  // Dosya gönder
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await sendFile(file);
    } finally {
      setIsUploading(false);
    }
  };

  // Mesaj menüsü
  const MessageMenu = ({ message }) => {
    const [showMenu, setShowMenu] = useState(false);

    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <DotsVerticalIcon className="h-5 w-5 text-gray-500" />
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
            <div className="py-1">
              <button
                onClick={() => {
                  markMessage({
                    messageId: message._id,
                    action: 'favorite'
                  });
                  setShowMenu(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Favorilere Ekle
              </button>
              <button
                onClick={() => {
                  deleteMessage(message._id);
                  setShowMenu(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                Sil
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading.messages) {
    return <LoadingSpinner />;
  }

  if (errors.messages) {
    return (
      <ErrorMessage
        title="Mesajlar yüklenemedi"
        message="Lütfen sayfayı yenileyip tekrar deneyin"
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Mesaj listesi */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.items.map((message) => (
          <div
            key={message._id}
            className={`flex ${
              message.isSender ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] ${
                message.isSender
                  ? 'bg-blue-600 text-white rounded-l-lg rounded-tr-lg'
                  : 'bg-gray-100 text-gray-900 rounded-r-lg rounded-tl-lg'
              } p-3`}
            >
              {/* Dosya içeriği */}
              {message.file && (
                <div className="mb-2">
                  {message.file.type.startsWith('image/') ? (
                    <img
                      src={message.file.url}
                      alt="Görsel"
                      className="max-w-full rounded-lg"
                    />
                  ) : (
                    <a
                      href={message.file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-sm hover:underline"
                    >
                      <DocumentIcon className="h-5 w-5" />
                      <span>{message.file.name}</span>
                    </a>
                  )}
                </div>
              )}

              {/* Mesaj içeriği */}
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>

              {/* Mesaj detayları */}
              <div
                className={`mt-1 flex items-center justify-end space-x-2 text-xs ${
                  message.isSender ? 'text-blue-200' : 'text-gray-500'
                }`}
              >
                <span>
                  {format(new Date(message.createdAt), 'HH:mm', {
                    locale: tr
                  })}
                </span>
                {message.isSender && message.isRead && (
                  <span>Okundu</span>
                )}
              </div>
            </div>

            {/* Mesaj menüsü */}
            {message.isSender && <MessageMenu message={message} />}
          </div>
        ))}

        {/* Daha fazla yükle */}
        {pagination.hasNextPage && (
          <div className="text-center">
            <button
              onClick={() => pagination.fetchNextPage()}
              disabled={pagination.isFetchingNextPage}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              {pagination.isFetchingNextPage
                ? 'Yükleniyor...'
                : 'Daha fazla mesaj yükle'}
            </button>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Mesaj gönderme formu */}
      <div className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          {/* Dosya yükleme */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <PaperClipIcon className="h-5 w-5 text-gray-500" />
          </button>

          {/* Mesaj girişi */}
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Mesajınızı yazın..."
            className="flex-1 border-gray-300 rounded-full focus:ring-blue-500 focus:border-blue-500"
          />

          {/* Gönder butonu */}
          <button
            type="submit"
            disabled={!newMessage.trim() || isLoading.send}
            className="p-2 rounded-full text-blue-600 hover:bg-blue-50 disabled:opacity-50"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </form>

        {/* Yükleme durumu */}
        {isUploading && (
          <div className="mt-2 text-sm text-gray-500">
            Dosya yükleniyor...
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageChat;
