import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  XIcon,
  VideoCameraIcon,
  PhoneIcon,
  UserGroupIcon,
  LocationMarkerIcon
} from '@heroicons/react/outline';

const AppointmentModal = ({
  isOpen,
  onClose,
  therapist,
  availability,
  sessionTypes,
  onSubmit,
  isLoading
}) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [notes, setNotes] = useState('');

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

  // Form gönderme
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedDate || !selectedTime || !selectedType) {
      return;
    }

    onSubmit({
      therapistId: therapist._id,
      date: selectedDate,
      time: selectedTime,
      sessionType: selectedType,
      notes
    });
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen p-4">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded-lg max-w-2xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <Dialog.Title className="text-lg font-medium text-gray-900">
              Randevu Oluştur
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Seans tipleri */}
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                Seans Tipi Seçin
              </h3>
              <div className="mt-2 grid grid-cols-2 gap-4">
                {sessionTypes.map((type) => (
                  <button
                    key={type._id}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={`flex items-center p-4 border rounded-lg ${
                      selectedType?._id === type._id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-500'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      <div
                        className={`w-10 h-10 flex items-center justify-center rounded-lg ${
                          selectedType?._id === type._id
                            ? 'bg-blue-500 text-white'
                            : 'bg-blue-100 text-blue-600'
                        }`}
                      >
                        {getSessionIcon(type.type)}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {getSessionTitle(type.type)}
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        {type.duration} dk - {type.price} TL
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tarih seçimi */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900">
                Tarih Seçin
              </h3>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {availability.dates.map((date) => (
                  <button
                    key={date}
                    type="button"
                    onClick={() => setSelectedDate(date)}
                    className={`p-3 text-center border rounded-lg ${
                      selectedDate === date
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-500'
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-900">
                      {format(new Date(date), 'EEE', { locale: tr })}
                    </div>
                    <div className="mt-1 text-lg font-semibold text-gray-900">
                      {format(new Date(date), 'd')}
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      {format(new Date(date), 'MMM', { locale: tr })}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Saat seçimi */}
            {selectedDate && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900">
                  Saat Seçin
                </h3>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {availability.slots
                    .filter(
                      (slot) =>
                        format(new Date(slot.startTime), 'yyyy-MM-dd') ===
                        format(new Date(selectedDate), 'yyyy-MM-dd')
                    )
                    .map((slot) => (
                      <button
                        key={slot.startTime}
                        type="button"
                        onClick={() => setSelectedTime(slot.startTime)}
                        className={`p-3 text-center border rounded-lg ${
                          selectedTime === slot.startTime
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-500'
                        }`}
                      >
                        <div className="text-sm font-medium text-gray-900">
                          {format(new Date(slot.startTime), 'HH:mm')}
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Notlar */}
            <div className="mt-6">
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-900"
              >
                Notlar (İsteğe bağlı)
              </label>
              <textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Terapistinize iletmek istediğiniz notları yazabilirsiniz"
              />
            </div>

            {/* Özet */}
            {selectedDate && selectedTime && selectedType && (
              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900">
                  Randevu Özeti
                </h3>
                <dl className="mt-2 space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Terapist</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {therapist.name}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Tarih</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {format(new Date(selectedDate), 'd MMMM yyyy', {
                        locale: tr
                      })}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Saat</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {format(new Date(selectedTime), 'HH:mm')}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Seans Tipi</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {getSessionTitle(selectedType.type)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Süre</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {selectedType.duration} dakika
                    </dd>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <dt className="text-sm font-medium text-gray-900">
                      Toplam Ücret
                    </dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {selectedType.price} TL
                    </dd>
                  </div>
                </dl>
              </div>
            )}

            {/* Butonlar */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={!selectedDate || !selectedTime || !selectedType || isLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'İşleniyor...' : 'Randevu Oluştur'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
};

export default AppointmentModal;
