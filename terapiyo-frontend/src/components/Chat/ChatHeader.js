import React, { useState } from 'react';
import {
  DotsVerticalIcon,
  PhoneIcon,
  VideoCameraIcon,
  UserCircleIcon
} from '@heroicons/react/outline';
import { Menu, Transition } from '@headlessui/react';
import { useChat } from '../../hooks/useChat';

const ChatHeader = ({ chat, onArchive, onDelete }) => {
  const { markChatAsRead } = useChat(chat?.id);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  const handleArchive = () => {
    if (
      window.confirm(
        'Bu sohbeti arşivlemek istediğinizden emin misiniz?'
      )
    ) {
      onArchive();
    }
  };

  const handleDelete = () => {
    if (
      window.confirm(
        'Bu sohbeti silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.'
      )
    ) {
      onDelete();
    }
  };

  if (!chat) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b">
      {/* Kullanıcı bilgileri */}
      <div className="flex items-center space-x-3">
        <div className="relative">
          {chat.recipient.avatar ? (
            <img
              src={chat.recipient.avatar}
              alt={chat.recipient.name}
              className="h-10 w-10 rounded-full"
            />
          ) : (
            <UserCircleIcon className="h-10 w-10 text-gray-400" />
          )}
          {chat.recipient.isOnline && (
            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white" />
          )}
        </div>
        <div>
          <h2 className="text-sm font-medium text-gray-900">
            {chat.recipient.name}
          </h2>
          <p className="text-xs text-gray-500">
            {chat.recipient.isOnline
              ? 'Çevrimiçi'
              : chat.recipient.lastSeen
              ? `Son görülme: ${chat.recipient.lastSeen}`
              : 'Çevrimdışı'}
          </p>
        </div>
      </div>

      {/* Eylemler */}
      <div className="flex items-center space-x-2">
        {/* Sesli arama */}
        <button className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100">
          <PhoneIcon className="h-5 w-5" />
        </button>

        {/* Görüntülü arama */}
        <button className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100">
          <VideoCameraIcon className="h-5 w-5" />
        </button>

        {/* Diğer seçenekler */}
        <Menu as="div" className="relative">
          <Menu.Button className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100">
            <DotsVerticalIcon className="h-5 w-5" />
          </Menu.Button>

          <Transition
            show={isOptionsOpen}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items
              static
              className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
            >
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => markChatAsRead()}
                    className={`${
                      active ? 'bg-gray-100' : ''
                    } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                  >
                    Okundu olarak işaretle
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleArchive}
                    className={`${
                      active ? 'bg-gray-100' : ''
                    } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                  >
                    Arşivle
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleDelete}
                    className={`${
                      active ? 'bg-gray-100' : ''
                    } block w-full text-left px-4 py-2 text-sm text-red-600`}
                  >
                    Sohbeti sil
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </div>
  );
};

export default ChatHeader;
