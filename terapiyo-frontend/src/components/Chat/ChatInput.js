import React, { useState, useRef } from 'react';
import {
  PaperAirplaneIcon,
  PaperClipIcon,
  PhotographIcon,
  XIcon
} from '@heroicons/react/outline';
import { useChat } from '../../hooks/useChat';
import LoadingSpinner from '../Common/LoadingSpinner';

const ChatInput = ({ chatId }) => {
  const {
    sendMessage,
    uploadFile,
    handleTyping,
    isLoading
  } = useChat(chatId);

  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() && attachments.length === 0) return;

    try {
      await sendMessage({
        content: message.trim(),
        attachments
      });
      setMessage('');
      setAttachments([]);
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
    }
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      const uploadedFiles = await Promise.all(
        files.map(async (file) => {
          const result = await uploadFile(file);
          return {
            id: result.id,
            name: file.name,
            size: file.size,
            type: file.type,
            url: result.url
          };
        })
      );

      setAttachments((prev) => [...prev, ...uploadedFiles]);
    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
    }

    // Dosya input'unu temizle
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id) => {
    setAttachments((prev) =>
      prev.filter((attachment) => attachment.id !== id)
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="p-4 border-t">
      {/* Dosya önizlemeleri */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {attachments.map((file) => (
            <div
              key={file.id}
              className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-1"
            >
              {file.type.startsWith('image/') ? (
                <PhotographIcon className="h-4 w-4 text-gray-500" />
              ) : (
                <PaperClipIcon className="h-4 w-4 text-gray-500" />
              )}
              <span className="text-sm text-gray-700 truncate max-w-xs">
                {file.name}
              </span>
              <button
                onClick={() => removeAttachment(file.id)}
                className="p-1 rounded-full hover:bg-gray-200"
              >
                <XIcon className="h-3 w-3 text-gray-500" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Mesaj formu */}
      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Bir mesaj yazın..."
            className="block w-full resize-none rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            rows={1}
            style={{
              minHeight: '2.5rem',
              maxHeight: '10rem'
            }}
          />
        </div>

        {/* Dosya ekleme butonu */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading.upload}
            className="inline-flex items-center p-2 border border-transparent rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isLoading.upload ? (
              <LoadingSpinner size="sm" />
            ) : (
              <PaperClipIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Gönder butonu */}
        <button
          type="submit"
          disabled={
            (!message.trim() && attachments.length === 0) ||
            isLoading.upload
          }
          className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PaperAirplaneIcon className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
