import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useMessage } from '../../hooks/useMessage';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';

const MessageList = () => {
  const { useChats } = useMessage();
  const { data: chats, isLoading, error } = useChats();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ErrorMessage
        title="Mesajlar yüklenemedi"
        message="Lütfen sayfayı yenileyip tekrar deneyin"
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <ul className="divide-y divide-gray-200">
        {chats.items.map((chat) => (
          <li key={chat._id}>
            <Link
              to={`/messages/${chat._id}`}
              className="block hover:bg-gray-50"
            >
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {/* Avatar */}
                    <img
                      src={chat.participant.avatar}
                      alt={chat.participant.name}
                      className="h-10 w-10 rounded-full"
                    />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        {chat.participant.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {chat.lastMessage?.content}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text-sm text-gray-500">
                      {format(new Date(chat.lastMessage?.createdAt), 'HH:mm', {
                        locale: tr
                      })}
                    </p>
                    {chat.unreadCount > 0 && (
                      <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MessageList;
