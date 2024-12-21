import React from 'react';
import { BellIcon } from '@heroicons/react/outline';
import { useNotification } from '../../hooks/useNotification';

const NotificationBadge = () => {
  const { unreadCount, isLoading } = useNotification();

  if (isLoading.unreadCount) {
    return null;
  }

  return (
    <button className="relative p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
      <BellIcon className="h-6 w-6" />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
      )}
    </button>
  );
};

export default NotificationBadge;
