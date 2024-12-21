import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import notificationService from '../services/notification.service';

export const useNotification = () => {
  const queryClient = useQueryClient();

  // Bildirim listesi
  const useNotifications = (options = {}) => {
    return useQuery(
      ['notifications', options],
      () => notificationService.getNotifications(options),
      {
        keepPreviousData: true
      }
    );
  };

  // Okunmamış bildirim sayısı
  const {
    data: unreadCount,
    isLoading: isLoadingUnreadCount,
    error: unreadCountError
  } = useQuery('notificationUnreadCount', () =>
    notificationService.getUnreadCount()
  );

  // Bildirim ayarları
  const {
    data: settings,
    isLoading: isLoadingSettings,
    error: settingsError
  } = useQuery('notificationSettings', () => notificationService.getSettings());

  // Bildirimi okundu olarak işaretle
  const markAsReadMutation = useMutation(
    (notificationId) => notificationService.markAsRead(notificationId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notifications');
        queryClient.invalidateQueries('notificationUnreadCount');
      }
    }
  );

  // Tüm bildirimleri okundu olarak işaretle
  const markAllAsReadMutation = useMutation(
    () => notificationService.markAllAsRead(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notifications');
        queryClient.invalidateQueries('notificationUnreadCount');
        toast.success('Tüm bildirimler okundu olarak işaretlendi');
      },
      onError: () => {
        toast.error('Bildirimler işaretlenemedi');
      }
    }
  );

  // Bildirimi sil
  const deleteNotificationMutation = useMutation(
    (notificationId) => notificationService.deleteNotification(notificationId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notifications');
        queryClient.invalidateQueries('notificationUnreadCount');
        toast.success('Bildirim silindi');
      },
      onError: () => {
        toast.error('Bildirim silinemedi');
      }
    }
  );

  // Tüm bildirimleri sil
  const deleteAllNotificationsMutation = useMutation(
    () => notificationService.deleteAllNotifications(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notifications');
        queryClient.invalidateQueries('notificationUnreadCount');
        toast.success('Tüm bildirimler silindi');
      },
      onError: () => {
        toast.error('Bildirimler silinemedi');
      }
    }
  );

  // Bildirim ayarlarını güncelle
  const updateSettingsMutation = useMutation(
    (settings) => notificationService.updateSettings(settings),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notificationSettings');
        toast.success('Bildirim ayarları güncellendi');
      },
      onError: () => {
        toast.error('Bildirim ayarları güncellenemedi');
      }
    }
  );

  // Push bildirim izni iste
  const requestPushPermissionMutation = useMutation(
    () => notificationService.requestPushPermission(),
    {
      onSuccess: (permission) => {
        if (permission === 'granted') {
          toast.success('Push bildirimleri aktifleştirildi');
        } else {
          toast.warning('Push bildirimlerine izin verilmedi');
        }
      },
      onError: () => {
        toast.error('Push bildirimleri aktifleştirilemedi');
      }
    }
  );

  return {
    // Veriler
    useNotifications,
    unreadCount,
    settings,

    // Yükleniyor durumları
    isLoading: {
      unreadCount: isLoadingUnreadCount,
      settings: isLoadingSettings,
      markAsRead: markAsReadMutation.isLoading,
      markAllAsRead: markAllAsReadMutation.isLoading,
      delete: deleteNotificationMutation.isLoading,
      deleteAll: deleteAllNotificationsMutation.isLoading,
      updateSettings: updateSettingsMutation.isLoading,
      requestPushPermission: requestPushPermissionMutation.isLoading
    },

    // Hatalar
    errors: {
      unreadCount: unreadCountError,
      settings: settingsError
    },

    // Metodlar
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
    deleteAllNotifications: deleteAllNotificationsMutation.mutate,
    updateSettings: updateSettingsMutation.mutate,
    requestPushPermission: requestPushPermissionMutation.mutate
  };
};
