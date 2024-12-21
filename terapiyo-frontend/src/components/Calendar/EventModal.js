import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  TrashIcon,
  DownloadIcon
} from '@heroicons/react/outline';
import { useCalendar } from '../../hooks/useCalendar';
import LoadingSpinner from '../Common/LoadingSpinner';

const EventModal = ({
  isOpen,
  onClose,
  event,
  selectedDate,
  onSave,
  onUpdate,
  onDelete
}) => {
  const { checkConflicts, exportICalendar, isLoading } = useCalendar();

  const [formData, setFormData] = useState({
    title: '',
    start: '',
    end: '',
    type: 'appointment',
    description: '',
    participants: []
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        start: format(event.start, "yyyy-MM-dd'T'HH:mm"),
        end: format(event.end, "yyyy-MM-dd'T'HH:mm"),
        type: event.extendedProps.type,
        description: event.extendedProps.description,
        participants: event.extendedProps.participants || []
      });
    } else if (selectedDate) {
      setFormData({
        ...formData,
        start: format(selectedDate.start, "yyyy-MM-dd'T'HH:mm"),
        end: format(selectedDate.end, "yyyy-MM-dd'T'HH:mm")
      });
    }
  }, [event, selectedDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Çakışma kontrolü
    const conflicts = await checkConflicts(formData);
    if (conflicts.hasConflicts) {
      // Çakışma var, kullanıcıya bildir
      return;
    }

    if (event) {
      onUpdate({ eventId: event.id, eventData: formData });
    } else {
      onSave(formData);
    }
    onClose();
  };

  const handleDelete = () => {
    if (event) {
      onDelete(event.id);
      onClose();
    }
  };

  const handleExport = () => {
    if (event) {
      exportICalendar(event.id);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-10 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded-lg max-w-md w-full mx-4">
          <form onSubmit={handleSubmit}>
            {/* Başlık */}
            <div className="px-4 py-3 border-b">
              <Dialog.Title className="text-lg font-medium text-gray-900">
                {event ? 'Etkinliği Düzenle' : 'Yeni Etkinlik'}
              </Dialog.Title>
            </div>

            {/* Form alanları */}
            <div className="p-4 space-y-4">
              {/* Başlık */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700"
                >
                  Başlık
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>

              {/* Tarih ve saat */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="start"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Başlangıç
                  </label>
                  <input
                    type="datetime-local"
                    id="start"
                    value={formData.start}
                    onChange={(e) =>
                      setFormData({ ...formData, start: e.target.value })
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="end"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Bitiş
                  </label>
                  <input
                    type="datetime-local"
                    id="end"
                    value={formData.end}
                    onChange={(e) =>
                      setFormData({ ...formData, end: e.target.value })
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
              </div>

              {/* Tür */}
              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-700"
                >
                  Tür
                </label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="appointment">Randevu</option>
                  <option value="meeting">Toplantı</option>
                  <option value="break">Mola</option>
                </select>
              </div>

              {/* Açıklama */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Açıklama
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Butonlar */}
            <div className="px-4 py-3 bg-gray-50 flex justify-between rounded-b-lg">
              <div>
                {event && (
                  <>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isLoading.delete}
                      className="mr-2 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Sil
                    </button>
                    <button
                      type="button"
                      onClick={handleExport}
                      disabled={isLoading.export}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <DownloadIcon className="h-4 w-4 mr-1" />
                      Dışa Aktar
                    </button>
                  </>
                )}
              </div>
              <div>
                <button
                  type="button"
                  onClick={onClose}
                  className="mr-2 inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={
                    isLoading.create || isLoading.update || isLoading.delete
                  }
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {isLoading.create || isLoading.update ? (
                    <LoadingSpinner size="sm" />
                  ) : event ? (
                    'Güncelle'
                  ) : (
                    'Oluştur'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
};

export default EventModal;
