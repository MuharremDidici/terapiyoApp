import React, { useState } from 'react';
import { useProfile } from '../../hooks/useProfile';
import LoadingSpinner from '../Common/LoadingSpinner';

const PrivacySettings = ({ profile }) => {
  const { updatePrivacySettings, isLoading } = useProfile();

  const [settings, setSettings] = useState({
    profileVisibility: profile.privacy?.profileVisibility ?? 'public',
    showOnlineStatus: profile.privacy?.showOnlineStatus ?? true,
    showLastSeen: profile.privacy?.showLastSeen ?? true,
    allowMessages: profile.privacy?.allowMessages ?? true,
    showEmail: profile.privacy?.showEmail ?? false,
    showPhone: profile.privacy?.showPhone ?? false,
    allowReviews: profile.privacy?.allowReviews ?? true,
    dataUsage: {
      analytics: profile.privacy?.dataUsage?.analytics ?? true,
      personalization: profile.privacy?.dataUsage?.personalization ?? true,
      marketing: profile.privacy?.dataUsage?.marketing ?? false
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updatePrivacySettings(settings);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Profil görünürlüğü */}
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          Profil Görünürlüğü
        </h3>
        <div className="mt-4">
          <select
            value={settings.profileVisibility}
            onChange={(e) =>
              setSettings({
                ...settings,
                profileVisibility: e.target.value
              })
            }
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="public">Herkese Açık</option>
            <option value="registered">Sadece Kayıtlı Kullanıcılar</option>
            <option value="private">Gizli</option>
          </select>
        </div>
      </div>

      {/* Çevrimiçi durum */}
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          Çevrimiçi Durum
        </h3>
        <div className="mt-4 space-y-4">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                checked={settings.showOnlineStatus}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    showOnlineStatus: e.target.checked
                  })
                }
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3">
              <label className="text-sm font-medium text-gray-700">
                Çevrimiçi durumumu göster
              </label>
              <p className="text-sm text-gray-500">
                Diğer kullanıcılar çevrimiçi olduğunuzu görebilir
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                checked={settings.showLastSeen}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    showLastSeen: e.target.checked
                  })
                }
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3">
              <label className="text-sm font-medium text-gray-700">
                Son görülme zamanımı göster
              </label>
              <p className="text-sm text-gray-500">
                Diğer kullanıcılar son çevrimiçi olduğunuz zamanı görebilir
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* İletişim tercihleri */}
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          İletişim Tercihleri
        </h3>
        <div className="mt-4 space-y-4">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                checked={settings.allowMessages}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    allowMessages: e.target.checked
                  })
                }
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3">
              <label className="text-sm font-medium text-gray-700">
                Mesajlaşmaya izin ver
              </label>
              <p className="text-sm text-gray-500">
                Diğer kullanıcılar size mesaj gönderebilir
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                checked={settings.showEmail}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    showEmail: e.target.checked
                  })
                }
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3">
              <label className="text-sm font-medium text-gray-700">
                E-posta adresimi göster
              </label>
              <p className="text-sm text-gray-500">
                E-posta adresiniz profilinizde görünür
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                checked={settings.showPhone}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    showPhone: e.target.checked
                  })
                }
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3">
              <label className="text-sm font-medium text-gray-700">
                Telefon numaramı göster
              </label>
              <p className="text-sm text-gray-500">
                Telefon numaranız profilinizde görünür
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Değerlendirmeler */}
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          Değerlendirmeler
        </h3>
        <div className="mt-4">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                checked={settings.allowReviews}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    allowReviews: e.target.checked
                  })
                }
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3">
              <label className="text-sm font-medium text-gray-700">
                Değerlendirmelere izin ver
              </label>
              <p className="text-sm text-gray-500">
                Diğer kullanıcılar profilinize değerlendirme yapabilir
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Veri kullanımı */}
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          Veri Kullanımı
        </h3>
        <div className="mt-4 space-y-4">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                checked={settings.dataUsage.analytics}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    dataUsage: {
                      ...settings.dataUsage,
                      analytics: e.target.checked
                    }
                  })
                }
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3">
              <label className="text-sm font-medium text-gray-700">
                Analitik
              </label>
              <p className="text-sm text-gray-500">
                Hizmet kalitesini artırmak için kullanım verilerinin
                toplanmasına izin ver
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                checked={settings.dataUsage.personalization}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    dataUsage: {
                      ...settings.dataUsage,
                      personalization: e.target.checked
                    }
                  })
                }
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3">
              <label className="text-sm font-medium text-gray-700">
                Kişiselleştirme
              </label>
              <p className="text-sm text-gray-500">
                Size özel öneriler ve içerik sunmak için verilerinizin
                kullanılmasına izin ver
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                checked={settings.dataUsage.marketing}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    dataUsage: {
                      ...settings.dataUsage,
                      marketing: e.target.checked
                    }
                  })
                }
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3">
              <label className="text-sm font-medium text-gray-700">
                Pazarlama
              </label>
              <p className="text-sm text-gray-500">
                Size özel kampanya ve teklifler sunmak için verilerinizin
                kullanılmasına izin ver
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Kaydet butonu */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading.privacy}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {isLoading.privacy ? <LoadingSpinner size="sm" /> : 'Kaydet'}
        </button>
      </div>
    </form>
  );
};

export default PrivacySettings;
