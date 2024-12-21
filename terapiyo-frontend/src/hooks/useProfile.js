import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import profileService from '../services/profile.service';

export const useProfile = () => {
  const queryClient = useQueryClient();

  // Profil bilgileri
  const useProfileData = () => {
    return useQuery('profile', () => profileService.getProfile());
  };

  // Oturum geçmişi
  const useSessionHistory = () => {
    return useQuery('sessionHistory', () =>
      profileService.getSessionHistory()
    );
  };

  // Profil güncelleme
  const updateProfileMutation = useMutation(
    (profileData) => profileService.updateProfile(profileData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('profile');
        toast.success('Profil bilgileri güncellendi');
      },
      onError: () => {
        toast.error('Profil bilgileri güncellenemedi');
      }
    }
  );

  // Profil fotoğrafı güncelleme
  const updateAvatarMutation = useMutation(
    (file) => profileService.updateAvatar(file),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('profile');
        toast.success('Profil fotoğrafı güncellendi');
      },
      onError: () => {
        toast.error('Profil fotoğrafı güncellenemedi');
      }
    }
  );

  // Şifre değiştirme
  const changePasswordMutation = useMutation(
    (passwordData) => profileService.changePassword(passwordData),
    {
      onSuccess: () => {
        toast.success('Şifreniz başarıyla değiştirildi');
      },
      onError: () => {
        toast.error('Şifre değiştirilemedi');
      }
    }
  );

  // Bildirim tercihleri güncelleme
  const updateNotificationPreferencesMutation = useMutation(
    (preferences) => profileService.updateNotificationPreferences(preferences),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('profile');
        toast.success('Bildirim tercihleri güncellendi');
      },
      onError: () => {
        toast.error('Bildirim tercihleri güncellenemedi');
      }
    }
  );

  // Gizlilik ayarları güncelleme
  const updatePrivacySettingsMutation = useMutation(
    (settings) => profileService.updatePrivacySettings(settings),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('profile');
        toast.success('Gizlilik ayarları güncellendi');
      },
      onError: () => {
        toast.error('Gizlilik ayarları güncellenemedi');
      }
    }
  );

  // Hesap verilerini indirme
  const exportDataMutation = useMutation(
    () => profileService.exportData(),
    {
      onSuccess: (data) => {
        // Dosyayı indir
        const blob = new Blob([data], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'hesap-verileri.json';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast.success('Hesap verileri indirildi');
      },
      onError: () => {
        toast.error('Hesap verileri indirilemedi');
      }
    }
  );

  // Hesap silme
  const deleteAccountMutation = useMutation(
    (reason) => profileService.deleteAccount(reason),
    {
      onSuccess: () => {
        toast.success('Hesabınız başarıyla silindi');
        // Kullanıcıyı çıkış sayfasına yönlendir
        window.location.href = '/logout';
      },
      onError: () => {
        toast.error('Hesap silinemedi');
      }
    }
  );

  // 2FA etkinleştirme
  const enable2FAMutation = useMutation(
    () => profileService.enable2FA(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('profile');
        toast.success('İki faktörlü doğrulama etkinleştirildi');
      },
      onError: () => {
        toast.error('İki faktörlü doğrulama etkinleştirilemedi');
      }
    }
  );

  // 2FA devre dışı bırakma
  const disable2FAMutation = useMutation(
    (code) => profileService.disable2FA(code),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('profile');
        toast.success('İki faktörlü doğrulama devre dışı bırakıldı');
      },
      onError: () => {
        toast.error('İki faktörlü doğrulama devre dışı bırakılamadı');
      }
    }
  );

  // Oturum sonlandırma
  const terminateSessionsMutation = useMutation(
    (sessionIds) => profileService.terminateSessions(sessionIds),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('sessionHistory');
        toast.success('Seçili oturumlar sonlandırıldı');
      },
      onError: () => {
        toast.error('Oturumlar sonlandırılamadı');
      }
    }
  );

  return {
    // Sorgular
    useProfileData,
    useSessionHistory,

    // Yükleniyor durumları
    isLoading: {
      profile: updateProfileMutation.isLoading,
      avatar: updateAvatarMutation.isLoading,
      password: changePasswordMutation.isLoading,
      notifications: updateNotificationPreferencesMutation.isLoading,
      privacy: updatePrivacySettingsMutation.isLoading,
      export: exportDataMutation.isLoading,
      delete: deleteAccountMutation.isLoading,
      enable2FA: enable2FAMutation.isLoading,
      disable2FA: disable2FAMutation.isLoading,
      terminateSessions: terminateSessionsMutation.isLoading
    },

    // Metodlar
    updateProfile: updateProfileMutation.mutate,
    updateAvatar: updateAvatarMutation.mutate,
    changePassword: changePasswordMutation.mutate,
    updateNotificationPreferences:
      updateNotificationPreferencesMutation.mutate,
    updatePrivacySettings: updatePrivacySettingsMutation.mutate,
    exportData: exportDataMutation.mutate,
    deleteAccount: deleteAccountMutation.mutate,
    enable2FA: enable2FAMutation.mutate,
    disable2FA: disable2FAMutation.mutate,
    terminateSessions: terminateSessionsMutation.mutate
  };
};
