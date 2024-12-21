import React, { useState, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import ChatList from './ChatList';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';

const Chat = () => {
  const [selectedChatId, setSelectedChatId] = useState(null);
  const { chats, archiveChat, deleteChat } = useChat(selectedChatId);

  // İlk sohbeti otomatik seç
  useEffect(() => {
    if (chats?.length > 0 && !selectedChatId) {
      setSelectedChatId(chats[0].id);
    }
  }, [chats, selectedChatId]);

  const selectedChat = chats?.find(
    (chat) => chat.id === selectedChatId
  );

  const handleArchiveChat = async () => {
    try {
      await archiveChat();
      setSelectedChatId(null);
    } catch (error) {
      console.error('Sohbet arşivleme hatası:', error);
    }
  };

  const handleDeleteChat = async () => {
    try {
      await deleteChat();
      setSelectedChatId(null);
    } catch (error) {
      console.error('Sohbet silme hatası:', error);
    }
  };

  return (
    <div className="flex h-full">
      {/* Sol panel - Sohbet listesi */}
      <div className="w-80 border-r flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-lg font-medium text-gray-900">
            Mesajlar
          </h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ChatList
            onSelectChat={setSelectedChatId}
            selectedChatId={selectedChatId}
          />
        </div>
      </div>

      {/* Sağ panel - Sohbet içeriği */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            <ChatHeader
              chat={selectedChat}
              onArchive={handleArchiveChat}
              onDelete={handleDeleteChat}
            />
            <div className="flex-1 overflow-y-auto">
              <ChatMessages chatId={selectedChatId} />
            </div>
            <ChatInput chatId={selectedChatId} />
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Bir sohbet seçin
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
