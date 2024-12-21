import React, { useState } from 'react';
import { useProfile } from '../../hooks/useProfile';
import LoadingSpinner from '../Common/LoadingSpinner';

const Security = ({ profile }) => {
  const {
    changePassword,
    enable2FA,
    disable2FA,
    terminateSessions,
    useSessionHistory,
    isLoading
  } = useProfile();

  const { data: sessions } = useSessionHistory();

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [selectedSessions, setSelectedSessions] = useState([]);

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return;
    }
    changePassword(passwordData);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handle2FA = () => {
    if (profile.is2FAEnabled) {
      disable2FA();
    } else {
      enable2FA();
    }
  };

  const handleSessionTerminate = () => {
    if (selectedSessions.length > 0) {
      terminateSessions(selectedSessions);
      setSelectedSessions([]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Şifre değiştirme */}
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          Şifre Değiştir
        </h3>
        <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Mevcut Şifre
            </label>
            <input
              type="password"
              id="currentPassword"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  currentPassword: e.target.value
                })
              }
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Yeni Şifre
            </label>
            <input
              type="password"
              id="newPassword"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value
                })
              }
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Yeni Şifre (Tekrar)
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  confirmPassword: e.target.value
                })
              }
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading.password}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isLoading.password ? (
                <LoadingSpinner size="sm" />
              ) : (
                'Şifreyi Değiştir'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* İki faktörlü doğrulama */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              İki Faktörlü Doğrulama
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Hesabınızı daha güvenli hale getirmek için iki faktörlü
              doğrulamayı etkinleştirin.
            </p>
          </div>
          <button
            onClick={handle2FA}
            disabled={isLoading.enable2FA || isLoading.disable2FA}
            className={`${
              profile.is2FAEnabled
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            } inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {isLoading.enable2FA || isLoading.disable2FA ? (
              <LoadingSpinner size="sm" />
            ) : profile.is2FAEnabled ? (
              'Devre Dışı Bırak'
            ) : (
              'Etkinleştir'
            )}
          </button>
        </div>
      </div>

      {/* Oturum geçmişi */}
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          Oturum Geçmişi
        </h3>
        <div className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              Aktif cihazlarınızı ve oturumlarınızı görüntüleyin.
            </p>
            <button
              onClick={handleSessionTerminate}
              disabled={
                isLoading.terminateSessions || selectedSessions.length === 0
              }
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              {isLoading.terminateSessions ? (
                <LoadingSpinner size="sm" />
              ) : (
                'Seçili Oturumları Sonlandır'
              )}
            </button>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {sessions?.map((session) => (
                <li key={session.id}>
                  <div className="px-4 py-4 flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedSessions.includes(session.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSessions([
                            ...selectedSessions,
                            session.id
                          ]);
                        } else {
                          setSelectedSessions(
                            selectedSessions.filter((id) => id !== session.id)
                          );
                        }
                      }}
                      disabled={session.isCurrent}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {session.device}
                        {session.isCurrent && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Aktif
                          </span>
                        )}
                      </p>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <span>{session.location}</span>
                        <span className="mx-2">&middot;</span>
                        <span>{session.lastActive}</span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Security;
