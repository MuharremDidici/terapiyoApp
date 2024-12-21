import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  BellIcon,
  CalendarIcon,
  ChatIcon,
  CurrencyDollarIcon,
  StarIcon,
  XIcon,
  CheckIcon
} from '@heroicons/react/outline';
import { useNotification } from '../../hooks/useNotification';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';

const NotificationList = () => {
  const {
    useNotifications,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    deleteAllNotifications,
    isLoading
  } = useNotification();

  const { data: notifications, isLoading: isLoadingNotifications } =
    useNotifications();

  // Bildirim ikonu
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment':
        return <CalendarIcon className="h-6 w-6" />;
      case 'message':
        return <ChatIcon className="h-6 w-6" />;
      case 'payment':
        return <CurrencyDollarIcon className="h-6 w-6" />;
      case 'review':
        return <StarIcon className="h-6 w-6" />;
      default:
        return <BellIcon className="h-6 w-6" />;
    }
  };

  // Bildirim rengi
  const getNotificationColor = (type) => {
    switch (type) {
      case 'appointment':
        return 'text-blue-500 bg-blue-100';
      case 'message':
        return 'text-green-500 bg-green-100';
      case 'payment':
        return 'text-yellow-500 bg-yellow-100';
      case 'review':
        return 'text-purple-500 bg-purple-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  };

  if (isLoadingNotifications) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Başlık */}
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Bildirimler</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={markAllAsRead}
            disabled={isLoading.markAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Tümünü Okundu İşaretle
          </button>
          <button
            onClick={deleteAllNotifications}
            disabled={isLoading.deleteAll}
            className="text-sm text-red-600 hover:text-red-500"
          >
            Tümünü Sil
          </button>
        </div>
      </div>

      {/* Bildirim listesi */}
      <div className="divide-y divide-gray-200">
        {notifications.items.map((notification) => (
          <div
            key={notification._id}
            className={`p-4 ${
              !notification.isRead ? 'bg-blue-50' : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start">
              {/* İkon */}
              <div
                className={`p-2 rounded-full ${getNotificationColor(
                  notification.type
                )}`}
              >
                {getNotificationIcon(notification.type)}
              </div>

              {/* İçerik */}
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <p
                    className={`text-sm ${
                      !notification.isRead
                        ? 'font-medium text-gray-900'
                        : 'text-gray-500'
                    }`}
                  >
                    {notification.title}
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {format(new Date(notification.createdAt), 'HH:mm', {
                        locale: tr
                      })}
                    </span>
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification._id)}
                        disabled={isLoading.markAsRead}
                        className="p-1 rounded-full hover:bg-gray-200"
                      >
                        <CheckIcon className="h-4 w-4 text-gray-500" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification._id)}
                      disabled={isLoading.delete}
                      className="p-1 rounded-full hover:bg-gray-200"
                    >
                      <XIcon className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  {notification.message}
                </p>
                {notification.link && (
                  <Link
                    to={notification.link}
                    className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
                  >
                    Detayları Görüntüle
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}

        {notifications.items.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            Henüz bildiriminiz yok
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationList;
