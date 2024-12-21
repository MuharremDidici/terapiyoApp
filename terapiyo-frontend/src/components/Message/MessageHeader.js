import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DotsVerticalIcon,
  ArchiveIcon,
  TrashIcon,
  XIcon
} from '@heroicons/react/outline';
import { useMessage } from '../../hooks/useMessage';

const MessageHeader = ({ chat }) => {
  const { archiveChat, deleteChat } = useMessage(chat._id);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
      {/* Kullanıcı bilgileri */}
      <Link
        to={`/therapists/${chat.participant._id}`}
        className="flex items-center"
      >
        <img
          src={chat.participant.avatar}
          alt={chat.participant.name}
          className="h-10 w-10 rounded-full"
        />
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-900">
            {chat.participant.name}
          </p>
          <p className="text-xs text-gray-500">{chat.participant.title}</p>
        </div>
      </Link>

      {/* Menü */}
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <DotsVerticalIcon className="h-5 w-5 text-gray-500" />
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
            <div className="py-1">
              <button
                onClick={() => {
                  archiveChat();
                  setShowMenu(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <ArchiveIcon className="h-5 w-5 mr-2" />
                Arşivle
              </button>
              <button
                onClick={() => {
                  deleteChat();
                  setShowMenu(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                <TrashIcon className="h-5 w-5 mr-2" />
                Sohbeti Sil
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageHeader;
