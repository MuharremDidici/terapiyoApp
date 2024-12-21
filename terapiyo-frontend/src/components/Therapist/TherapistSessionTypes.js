import React from 'react';
import {
  VideoCameraIcon,
  PhoneIcon,
  UserGroupIcon,
  LocationMarkerIcon
} from '@heroicons/react/outline';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';

const TherapistSessionTypes = ({ sessionTypes, isLoading, error }) => {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ErrorMessage
        title="Seans tipleri yüklenemedi"
        message="Lütfen sayfayı yenileyip tekrar deneyin"
      />
    );
  }

  // Seans tipi ikonları
  const getSessionIcon = (type) => {
    switch (type) {
      case 'video':
        return <VideoCameraIcon className="h-6 w-6" />;
      case 'phone':
        return <PhoneIcon className="h-6 w-6" />;
      case 'group':
        return <UserGroupIcon className="h-6 w-6" />;
      case 'inPerson':
        return <LocationMarkerIcon className="h-6 w-6" />;
      default:
        return null;
    }
  };

  // Seans tipi başlıkları
  const getSessionTitle = (type) => {
    switch (type) {
      case 'video':
        return 'Online Görüntülü';
      case 'phone':
        return 'Online Sesli';
      case 'group':
        return 'Grup Terapisi';
      case 'inPerson':
        return 'Yüz Yüze';
      default:
        return type;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900">Seans Tipleri</h2>

      <div className="mt-4 space-y-4">
        {sessionTypes.map((session) => (
          <div
            key={session._id}
            className="flex items-start p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors"
          >
            {/* İkon */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                {getSessionIcon(session.type)}
              </div>
            </div>

            {/* Detaylar */}
            <div className="ml-4 flex-grow">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  {getSessionTitle(session.type)}
                </h3>
                <div className="text-lg font-bold text-gray-900">
                  {session.price} TL
                </div>
              </div>

              <div className="mt-1 text-sm text-gray-500">
                {session.duration} dakika
              </div>

              <p className="mt-2 text-sm text-gray-600">
                {session.description}
              </p>

              {/* Özellikler */}
              {session.features && session.features.length > 0 && (
                <div className="mt-3">
                  <ul className="space-y-1">
                    {session.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-center text-sm text-gray-600"
                      >
                        <span className="mr-2">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TherapistSessionTypes;
