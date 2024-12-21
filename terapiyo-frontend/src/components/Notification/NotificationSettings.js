import React from 'react';
import { Switch } from '@headlessui/react';
import {
  BellIcon,
  MailIcon,
  DeviceMobileIcon,
  CalendarIcon,
  ChatIcon,
  CurrencyDollarIcon,
  StarIcon
} from '@heroicons/react/outline';
import { useNotification } from '../../hooks/useNotification';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';

const NotificationSettings = () => {
  const {
    settings,
    updateSettings,
    requestPushPermission,
    isLoading,
    errors
  } = useNotification();

  // Ayarları güncelle
  const handleSettingChange = (key, value) => {
    updateSettings({ ...settings, [key]: value });
  };

  // Push bildirim izni iste
  const handlePushPermission = async () => {
    const result = await requestPushPermission();
    if (result === 'granted') {
      handleSettingChange('push', true);
    }
  };

  if (isLoading.settings) {
    return <LoadingSpinner />;
  }

  if (errors.settings) {
    return (
      <ErrorMessage
        title="Ayarlar yüklenemedi"
        message="Lütfen sayfayı yenileyip tekrar deneyin"
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Başlık */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium text-gray-900">
          Bildirim Ayarları
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Hangi bildirimler almak istediğinizi seçin
        </p>
      </div>

      {/* Bildirim kanalları */}
      <div className="p-4 border-b">
        <h3 className="text-sm font-medium text-gray-900">
          Bildirim Kanalları
        </h3>
        <div className="mt-4 space-y-4">
          {/* Push bildirimleri */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BellIcon className="h-5 w-5 text-gray-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  Push Bildirimleri
                </p>
                <p className="text-sm text-gray-500">
                  Tarayıcı bildirimleri
                </p>
              </div>
            </div>
            <Switch
              checked={settings.push}
              onChange={() => handlePushPermission()}
              className={`${
                settings.push ? 'bg-blue-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            >
              <span
                className={`${
                  settings.push ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </Switch>
          </div>

          {/* E-posta bildirimleri */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MailIcon className="h-5 w-5 text-gray-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  E-posta Bildirimleri
                </p>
                <p className="text-sm text-gray-500">
                  E-posta ile bildirimler
                </p>
              </div>
            </div>
            <Switch
              checked={settings.email}
              onChange={(value) => handleSettingChange('email', value)}
              className={`${
                settings.email ? 'bg-blue-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            >
              <span
                className={`${
                  settings.email ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </Switch>
          </div>

          {/* SMS bildirimleri */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <DeviceMobileIcon className="h-5 w-5 text-gray-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  SMS Bildirimleri
                </p>
                <p className="text-sm text-gray-500">
                  SMS ile bildirimler
                </p>
              </div>
            </div>
            <Switch
              checked={settings.sms}
              onChange={(value) => handleSettingChange('sms', value)}
              className={`${
                settings.sms ? 'bg-blue-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            >
              <span
                className={`${
                  settings.sms ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </Switch>
          </div>
        </div>
      </div>

      {/* Bildirim türleri */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900">
          Bildirim Türleri
        </h3>
        <div className="mt-4 space-y-4">
          {/* Randevu bildirimleri */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  Randevu Bildirimleri
                </p>
                <p className="text-sm text-gray-500">
                  Randevu hatırlatmaları ve güncellemeleri
                </p>
              </div>
            </div>
            <Switch
              checked={settings.appointments}
              onChange={(value) => handleSettingChange('appointments', value)}
              className={`${
                settings.appointments ? 'bg-blue-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            >
              <span
                className={`${
                  settings.appointments ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </Switch>
          </div>

          {/* Mesaj bildirimleri */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ChatIcon className="h-5 w-5 text-gray-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  Mesaj Bildirimleri
                </p>
                <p className="text-sm text-gray-500">
                  Yeni mesaj bildirimleri
                </p>
              </div>
            </div>
            <Switch
              checked={settings.messages}
              onChange={(value) => handleSettingChange('messages', value)}
              className={`${
                settings.messages ? 'bg-blue-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            >
              <span
                className={`${
                  settings.messages ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </Switch>
          </div>

          {/* Ödeme bildirimleri */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  Ödeme Bildirimleri
                </p>
                <p className="text-sm text-gray-500">
                  Ödeme onayları ve faturalar
                </p>
              </div>
            </div>
            <Switch
              checked={settings.payments}
              onChange={(value) => handleSettingChange('payments', value)}
              className={`${
                settings.payments ? 'bg-blue-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            >
              <span
                className={`${
                  settings.payments ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </Switch>
          </div>

          {/* Değerlendirme bildirimleri */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <StarIcon className="h-5 w-5 text-gray-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  Değerlendirme Bildirimleri
                </p>
                <p className="text-sm text-gray-500">
                  Değerlendirme hatırlatmaları
                </p>
              </div>
            </div>
            <Switch
              checked={settings.reviews}
              onChange={(value) => handleSettingChange('reviews', value)}
              className={`${
                settings.reviews ? 'bg-blue-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            >
              <span
                className={`${
                  settings.reviews ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </Switch>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
