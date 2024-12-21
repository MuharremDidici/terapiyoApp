import React, { useState } from 'react';
import { useProfile } from '../../hooks/useProfile';
import LoadingSpinner from '../Common/LoadingSpinner';

const NotificationPreferences = ({ profile }) => {
  const { updateNotificationPreferences, isLoading } = useProfile();

  const [preferences, setPreferences] = useState({
    email: {
      appointments: profile.notifications?.email?.appointments ?? true,
      messages: profile.notifications?.email?.messages ?? true,
      reminders: profile.notifications?.email?.reminders ?? true,
      updates: profile.notifications?.email?.updates ?? true,
      marketing: profile.notifications?.email?.marketing ?? false
    },
    sms: {
      appointments: profile.notifications?.sms?.appointments ?? true,
      messages: profile.notifications?.sms?.messages ?? true,
      reminders: profile.notifications?.sms?.reminders ?? true
    },
    push: {
      appointments: profile.notifications?.push?.appointments ?? true,
      messages: profile.notifications?.push?.messages ?? true,
      reminders: profile.notifications?.push?.reminders ?? true,
      updates: profile.notifications?.push?.updates ?? true
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateNotificationPreferences(preferences);
  };

  const handleToggle = (channel, type) => {
    setPreferences((prev) => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [type]: !prev[channel][type]
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* E-posta bildirimleri */}
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          E-posta Bildirimleri
        </h3>
        <div className="mt-4 space-y-4">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                checked={preferences.email.appointments}
                onChange={() => handleToggle('email', 'appointments')}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3">
              <label className="text-sm font-medium text-gray-700">
                Randevu Bildirimleri
              </label>
              <p className="text-sm text-gray-500">
                Randevu onayları, iptal ve değişiklik bildirimleri
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                checked={preferences.email.messages}
                onChange={() => handleToggle('email', 'messages')}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3">
              <label className="text-sm font-medium text-gray-700">
                Mesaj Bildirimleri
              </label>
              <p className="text-sm text-gray-500">
                Yeni mesaj ve sohbet bildirimleri
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                checked={preferences.email.reminders}
                onChange={() => handleToggle('email', 'reminders')}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3">
              <label className="text-sm font-medium text-gray-700">
                Hatırlatıcılar
              </label>
              <p className="text-sm text-gray-500">
                Yaklaşan randevu ve ödev hatırlatıcıları
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                checked={preferences.email.updates}
                onChange={() => handleToggle('email', 'updates')}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3">
              <label className="text-sm font-medium text-gray-700">
                Güncellemeler
              </label>
              <p className="text-sm text-gray-500">
                Sistem güncellemeleri ve yeni özellikler
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                checked={preferences.email.marketing}
                onChange={() => handleToggle('email', 'marketing')}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3">
              <label className="text-sm font-medium text-gray-700">
                Pazarlama
              </label>
              <p className="text-sm text-gray-500">
                Kampanyalar, özel teklifler ve duyurular
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SMS bildirimleri */}
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          SMS Bildirimleri
        </h3>
        <div className="mt-4 space-y-4">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                checked={preferences.sms.appointments}
                onChange={() => handleToggle('sms', 'appointments')}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3">
              <label className="text-sm font-medium text-gray-700">
                Randevu Bildirimleri
              </label>
              <p className="text-sm text-gray-500">
                Randevu onayları ve hatırlatıcıları
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                checked={preferences.sms.messages}
                onChange={() => handleToggle('sms', 'messages')}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3">
              <label className="text-sm font-medium text-gray-700">
                Mesaj Bildirimleri
              </label>
              <p className="text-sm text-gray-500">
                Yeni mesaj bildirimleri
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                checked={preferences.sms.reminders}
                onChange={() => handleToggle('sms', 'reminders')}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3">
              <label className="text-sm font-medium text-gray-700">
                Hatırlatıcılar
              </label>
              <p className="text-sm text-gray-500">
                Yaklaşan randevu hatırlatıcıları
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Push bildirimleri */}
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          Push Bildirimleri
        </h3>
        <div className="mt-4 space-y-4">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                checked={preferences.push.appointments}
                onChange={() => handleToggle('push', 'appointments')}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3">
              <label className="text-sm font-medium text-gray-700">
                Randevu Bildirimleri
              </label>
              <p className="text-sm text-gray-500">
                Randevu onayları ve değişiklikleri
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                checked={preferences.push.messages}
                onChange={() => handleToggle('push', 'messages')}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3">
              <label className="text-sm font-medium text-gray-700">
                Mesaj Bildirimleri
              </label>
              <p className="text-sm text-gray-500">
                Yeni mesaj ve sohbet bildirimleri
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                checked={preferences.push.reminders}
                onChange={() => handleToggle('push', 'reminders')}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3">
              <label className="text-sm font-medium text-gray-700">
                Hatırlatıcılar
              </label>
              <p className="text-sm text-gray-500">
                Yaklaşan randevu ve ödev hatırlatıcıları
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                checked={preferences.push.updates}
                onChange={() => handleToggle('push', 'updates')}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3">
              <label className="text-sm font-medium text-gray-700">
                Güncellemeler
              </label>
              <p className="text-sm text-gray-500">
                Sistem güncellemeleri ve yeni özellikler
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Kaydet butonu */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading.notifications}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {isLoading.notifications ? (
            <LoadingSpinner size="sm" />
          ) : (
            'Kaydet'
          )}
        </button>
      </div>
    </form>
  );
};

export default NotificationPreferences;
