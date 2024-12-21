import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { ExclamationIcon } from '@heroicons/react/outline';
import { useProfile } from '../../hooks/useProfile';
import LoadingSpinner from '../Common/LoadingSpinner';

const DeleteAccount = ({ onClose }) => {
  const { deleteAccount, isLoading } = useProfile();

  const [reason, setReason] = useState('');
  const [confirmation, setConfirmation] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (confirmation === 'HESABIMI SİL') {
      deleteAccount(reason);
      onClose();
    }
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      className="fixed inset-0 z-10 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded-lg max-w-md w-full mx-4">
          <div className="p-4">
            {/* Uyarı ikonu */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <ExclamationIcon
                className="h-6 w-6 text-red-600"
                aria-hidden="true"
              />
            </div>

            {/* Başlık */}
            <div className="mt-3 text-center">
              <Dialog.Title
                as="h3"
                className="text-lg font-medium text-gray-900"
              >
                Hesabı Sil
              </Dialog.Title>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Hesabınızı silmek üzeresiniz. Bu işlem geri alınamaz ve
                  tüm verileriniz kalıcı olarak silinecektir.
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-4">
              <div className="space-y-4">
                {/* Silme nedeni */}
                <div>
                  <label
                    htmlFor="reason"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Hesabınızı silme nedeniniz
                  </label>
                  <textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    placeholder="Lütfen hesabınızı silme nedeninizi belirtin..."
                    required
                  />
                </div>

                {/* Onay kutusu */}
                <div>
                  <label
                    htmlFor="confirmation"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Onay
                  </label>
                  <p className="mt-1 text-sm text-gray-500">
                    Hesabınızı silmek için "HESABIMI SİL" yazın
                  </p>
                  <input
                    type="text"
                    id="confirmation"
                    value={confirmation}
                    onChange={(e) => setConfirmation(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    required
                  />
                </div>
              </div>

              {/* Butonlar */}
              <div className="mt-5 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={
                    isLoading.delete ||
                    confirmation !== 'HESABIMI SİL' ||
                    !reason
                  }
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  {isLoading.delete ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    'Hesabı Sil'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default DeleteAccount;
