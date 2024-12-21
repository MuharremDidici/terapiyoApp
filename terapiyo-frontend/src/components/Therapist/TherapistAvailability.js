import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';

const TherapistAvailability = ({ availability, isLoading, error }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date()));

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ErrorMessage
        title="Müsaitlik durumu yüklenemedi"
        message="Lütfen sayfayı yenileyip tekrar deneyin"
      />
    );
  }

  // Önceki hafta
  const previousWeek = () => {
    setCurrentWeek(addDays(currentWeek, -7));
  };

  // Sonraki hafta
  const nextWeek = () => {
    setCurrentWeek(addDays(currentWeek, 7));
  };

  // Haftanın günlerini oluştur
  const weekDays = [...Array(7)].map((_, i) => addDays(currentWeek, i));

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900">Müsaitlik Durumu</h2>

      {/* Takvim navigasyonu */}
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={previousWeek}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
        </button>

        <div className="text-sm font-medium text-gray-900">
          {format(currentWeek, 'd MMMM', { locale: tr })} -{' '}
          {format(addDays(currentWeek, 6), 'd MMMM', { locale: tr })}
        </div>

        <button
          onClick={nextWeek}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <ChevronRightIcon className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Günler */}
      <div className="mt-4 grid grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const dayAvailability = availability.slots.filter((slot) =>
            isSameDay(new Date(slot.startTime), day)
          );

          return (
            <button
              key={day.toString()}
              onClick={() => setSelectedDate(day)}
              className={`p-2 text-center rounded-lg ${
                isSelected
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-100 text-gray-900'
              }`}
            >
              <div className="text-xs font-medium">
                {format(day, 'EEE', { locale: tr })}
              </div>
              <div className="mt-1 text-sm font-semibold">
                {format(day, 'd')}
              </div>
              <div className="mt-1 text-xs">
                {dayAvailability.length > 0
                  ? `${dayAvailability.length} slot`
                  : 'Müsait değil'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Seçili günün saatleri */}
      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-900">
          {format(selectedDate, 'd MMMM EEEE', { locale: tr })}
        </h3>

        <div className="mt-2 grid grid-cols-3 gap-2">
          {availability.slots
            .filter((slot) =>
              isSameDay(new Date(slot.startTime), selectedDate)
            )
            .map((slot) => (
              <div
                key={slot.startTime}
                className="p-2 text-center border border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer"
              >
                <div className="text-sm font-medium text-gray-900">
                  {format(new Date(slot.startTime), 'HH:mm')}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {slot.duration} dk
                </div>
              </div>
            ))}
        </div>

        {availability.slots.filter((slot) =>
          isSameDay(new Date(slot.startTime), selectedDate)
        ).length === 0 && (
          <div className="mt-2 text-center text-sm text-gray-500">
            Bu tarihte müsait saat bulunmuyor
          </div>
        )}
      </div>
    </div>
  );
};

export default TherapistAvailability;
