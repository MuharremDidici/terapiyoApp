import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import messageService from '../services/message.service';

export const useMessage = (chatId) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Mesaj listesi
  const {
    data: messages,
    isLoading: isLoadingMessages,
    error: messagesError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useQuery(
    ['messages', chatId],
    () => messageService.getMessages(chatId),
    {
      enabled: !!chatId,
      getNextPageParam: (lastPage) =>
        lastPage.hasMore ? lastPage.nextPage : undefined
    }
  );

  // Sohbet listesi
  const useChats = (options = {}) => {
    return useQuery(['chats', options], () => messageService.getChats(options), {
      keepPreviousData: true
    });
  };

  // Okunmamış mesaj sayısı
  const {
    data: unreadCount,
    isLoading: isLoadingUnreadCount,
    error: unreadCountError
  } = useQuery('unreadCount', () => messageService.getUnreadCount(), {
    refetchInterval: 30000 // Her 30 saniyede bir güncelle
  });

  // Mesaj gönder
  const sendMessageMutation = useMutation(
    (message) => messageService.sendMessage(chatId, message),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['messages', chatId]);
      },
      onError: () => {
        toast.error('Mesaj gönderilemedi');
      }
    }
  );

  // Dosya gönder
  const sendFileMutation = useMutation(
    (file) => messageService.sendFile(chatId, file),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['messages', chatId]);
      },
      onError: () => {
        toast.error('Dosya gönderilemedi');
      }
    }
  );

  // Mesaj işaretle
  const markMessageMutation = useMutation(
    ({ messageId, action }) => messageService.markMessage(messageId, action),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['messages', chatId]);
      },
      onError: () => {
        toast.error('Mesaj işaretlenemedi');
      }
    }
  );

  // Mesaj sil
  const deleteMessageMutation = useMutation(
    (messageId) => messageService.deleteMessage(messageId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['messages', chatId]);
        toast.success('Mesaj silindi');
      },
      onError: () => {
        toast.error('Mesaj silinemedi');
      }
    }
  );

  // Sohbet arşivle
  const archiveChatMutation = useMutation(
    () => messageService.archiveChat(chatId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('chats');
        toast.success('Sohbet arşivlendi');
        navigate('/messages');
      },
      onError: () => {
        toast.error('Sohbet arşivlenemedi');
      }
    }
  );

  // Sohbet sil
  const deleteChatMutation = useMutation(
    () => messageService.deleteChat(chatId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('chats');
        toast.success('Sohbet silindi');
        navigate('/messages');
      },
      onError: () => {
        toast.error('Sohbet silinemedi');
      }
    }
  );

  // Okundu olarak işaretle
  const markAsReadMutation = useMutation(
    () => messageService.markAsRead(chatId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('unreadCount');
      }
    }
  );

  return {
    // Veriler
    messages,
    useChats,
    unreadCount,

    // Yükleniyor durumları
    isLoading: {
      messages: isLoadingMessages,
      unreadCount: isLoadingUnreadCount,
      send: sendMessageMutation.isLoading,
      file: sendFileMutation.isLoading,
      mark: markMessageMutation.isLoading,
      delete: deleteMessageMutation.isLoading,
      archive: archiveChatMutation.isLoading,
      deleteChat: deleteChatMutation.isLoading,
      markAsRead: markAsReadMutation.isLoading
    },

    // Hatalar
    errors: {
      messages: messagesError,
      unreadCount: unreadCountError
    },

    // Sayfalama
    pagination: {
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage
    },

    // Metodlar
    sendMessage: sendMessageMutation.mutate,
    sendFile: sendFileMutation.mutate,
    markMessage: markMessageMutation.mutate,
    deleteMessage: deleteMessageMutation.mutate,
    archiveChat: archiveChatMutation.mutate,
    deleteChat: deleteChatMutation.mutate,
    markAsRead: markAsReadMutation.mutate
  };
};
