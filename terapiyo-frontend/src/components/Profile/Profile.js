import React, { useState } from 'react';
import {
  UserIcon,
  LockClosedIcon,
  BellIcon,
  ShieldCheckIcon,
  DownloadIcon,
  TrashIcon
} from '@heroicons/react/outline';
import { useProfile } from '../../hooks/useProfile';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';
import PersonalInfo from './PersonalInfo';
import Security from './Security';
import NotificationPreferences from './NotificationPreferences';
import PrivacySettings from './PrivacySettings';
import DeleteAccount from './DeleteAccount';

const Profile = () => {
  const { useProfileData } = useProfile();
  const { data: profile, isLoading: isLoadingProfile } = useProfileData();

  const [activeTab, setActiveTab] = useState('personal');

  const tabs = [
    {
      id: 'personal',
      name: 'Kişisel Bilgiler',
      icon: UserIcon
    },
    {
      id: 'security',
      name: 'Güvenlik',
      icon: LockClosedIcon
    },
    {
      id: 'notifications',
      name: 'Bildirimler',
      icon: BellIcon
    },
    {
      id: 'privacy',
      name: 'Gizlilik',
      icon: ShieldCheckIcon
    }
  ];

  if (isLoadingProfile) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Başlık */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium text-gray-900">
          Hesap Ayarları
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Hesap bilgilerinizi ve tercihlerinizi yönetin
        </p>
      </div>

      {/* Sekmeler */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm`}
            >
              <tab.icon
                className={`${
                  activeTab === tab.id
                    ? 'text-blue-500'
                    : 'text-gray-400 group-hover:text-gray-500'
                } mx-auto h-5 w-5`}
                aria-hidden="true"
              />
              <span className="mt-2 block">{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* İçerik */}
      <div className="p-4">
        {activeTab === 'personal' && <PersonalInfo profile={profile} />}
        {activeTab === 'security' && <Security profile={profile} />}
        {activeTab === 'notifications' && (
          <NotificationPreferences profile={profile} />
        )}
        {activeTab === 'privacy' && <PrivacySettings profile={profile} />}
      </div>

      {/* Alt butonlar */}
      <div className="p-4 bg-gray-50 rounded-b-lg">
        <div className="flex justify-between">
          <button
            onClick={() => setActiveTab('delete')}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <TrashIcon className="h-4 w-4 mr-1" />
            Hesabı Sil
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <DownloadIcon className="h-4 w-4 mr-1" />
            Verileri İndir
          </button>
        </div>
      </div>

      {/* Hesap silme modalı */}
      {activeTab === 'delete' && (
        <DeleteAccount onClose={() => setActiveTab('personal')} />
      )}
    </div>
  );
};

export default Profile;
