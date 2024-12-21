import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import chatService from '../services/chat.service';

export const useChat = (chatId) => {
  const queryClient = useQueryClient();
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const socket = useRef(null);

  // Socket bağlantısını başlat
  useEffect(() => {
    socket.current = chatService.initSocket();

    // Socket olaylarını dinle
    if (socket.current) {
      // Yeni mesaj
      socket.current.on('message', (message) => {
        queryClient.setQueryData(
          ['messages', message.chatId],
          (oldData) => {
            if (!oldData) return [message];
            return [...oldData, message];
          }
        );
      });

      // Yazıyor durumu
      socket.current.on('typing', ({ chatId: typingChatId, isTyping }) => {
        if (typingChatId === chatId) {
          setIsTyping(isTyping);
        }
      });

      // Çevrimiçi durum
      socket.current.on('status', ({ userId, status }) => {
        queryClient.setQueryData(['userStatus', userId], status);
      });
    }

    return () => {
      if (socket.current) {
        socket.current.off('message');
        socket.current.off('typing');
        socket.current.off('status');
      }
    };
  }, [chatId, queryClient]);

  // Sohbet listesini getir
  const {
    data: chats,
    isLoading: isLoadingChats,
    error: chatsError
  } = useQuery('chats', () => chatService.getChats());

  // Mesajları getir
  const {
    data: messages,
    isLoading: isLoadingMessages,
    error: messagesError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useQuery(
    ['messages', chatId],
    ({ pageParam = 1 }) =>
      chatService.getChatMessages(chatId, pageParam),
    {
      enabled: !!chatId,
      getNextPageParam: (lastPage) =>
        lastPage.hasMore ? lastPage.nextPage : undefined
    }
  );

  // Yeni sohbet oluştur
  const { mutate: createChat } = useMutation(
    (recipientId) => chatService.createChat(recipientId),
    {
      onSuccess: (data) => {
        queryClient.setQueryData('chats', (oldData) => {
          if (!oldData) return [data];
          return [...oldData, data];
        });
      }
    }
  );

  // Mesaj gönder
  const { mutate: sendMessage } = useMutation(
    ({ content, attachments }) =>
      chatService.sendMessage(chatId, content, attachments),
    {
      onSuccess: (data) => {
        queryClient.setQueryData(['messages', chatId], (oldData) => {
          if (!oldData) return [data];
          return [...oldData, data];
        });
      }
    }
  );

  // Mesajı işaretle
  const { mutate: markMessage } = useMutation(
    ({ messageId, action }) => chatService.markMessage(messageId, action),
    {
      onSuccess: (data) => {
        queryClient.setQueryData(['messages', chatId], (oldData) => {
          if (!oldData) return oldData;
          return oldData.map((message) =>
            message.id === data.id ? data : message
          );
        });
      }
    }
  );

  // Mesajı sil
  const { mutate: deleteMessage } = useMutation(
    (messageId) => chatService.deleteMessage(messageId),
    {
      onSuccess: (_, messageId) => {
        queryClient.setQueryData(['messages', chatId], (oldData) => {
          if (!oldData) return oldData;
          return oldData.filter((message) => message.id !== messageId);
        });
      }
    }
  );

  // Sohbeti arşivle
  const { mutate: archiveChat } = useMutation(
    () => chatService.archiveChat(chatId),
    {
      onSuccess: (data) => {
        queryClient.setQueryData('chats', (oldData) => {
          if (!oldData) return oldData;
          return oldData.map((chat) =>
            chat.id === data.id ? data : chat
          );
        });
      }
    }
  );

  // Sohbeti sil
  const { mutate: deleteChat } = useMutation(
    () => chatService.deleteChat(chatId),
    {
      onSuccess: () => {
        queryClient.setQueryData('chats', (oldData) => {
          if (!oldData) return oldData;
          return oldData.filter((chat) => chat.id !== chatId);
        });
      }
    }
  );

  // Sohbeti okundu olarak işaretle
  const { mutate: markChatAsRead } = useMutation(
    () => chatService.markChatAsRead(chatId),
    {
      onSuccess: (data) => {
        queryClient.setQueryData('chats', (oldData) => {
          if (!oldData) return oldData;
          return oldData.map((chat) =>
            chat.id === data.id ? data : chat
          );
        });
      }
    }
  );

  // Dosya yükle
  const { mutate: uploadFile, isLoading: isUploading } = useMutation(
    (file) => chatService.uploadFile(file)
  );

  // Yazıyor durumunu gönder
  const sendTypingStatus = useCallback(
    (isTyping) => {
      if (socket.current && chatId) {
        chatService.sendTypingStatus(chatId, isTyping);
      }
    },
    [chatId]
  );

  // Yazıyor durumunu otomatik gönder
  const handleTyping = useCallback(() => {
    sendTypingStatus(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(false);
    }, 3000);
  }, [sendTypingStatus]);

  // Çevrimiçi durumunu güncelle
  const updateOnlineStatus = useCallback((status) => {
    if (socket.current) {
      chatService.updateOnlineStatus(status);
    }
  }, []);

  return {
    // Veriler
    chats,
    messages,
    isTyping,

    // Yükleme durumları
    isLoading: {
      chats: isLoadingChats,
      messages: isLoadingMessages,
      upload: isUploading,
      nextPage: isFetchingNextPage
    },

    // Hatalar
    errors: {
      chats: chatsError,
      messages: messagesError
    },

    // Sayfalama
    hasNextPage,
    fetchNextPage,

    // Mutasyonlar
    createChat,
    sendMessage,
    markMessage,
    deleteMessage,
    archiveChat,
    deleteChat,
    markChatAsRead,
    uploadFile,

    // Yardımcı fonksiyonlar
    handleTyping,
    updateOnlineStatus
  };
};
