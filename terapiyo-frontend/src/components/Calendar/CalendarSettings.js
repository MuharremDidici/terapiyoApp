import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { useCalendar } from '../../hooks/useCalendar';
import LoadingSpinner from '../Common/LoadingSpinner';

const CalendarSettings = ({ isOpen, onClose }) => {
  const { useSettings, updateSettings, isLoading } = useCalendar();
  const { data: settings, isLoading: isLoadingSettings } = useSettings();

  const [formData, setFormData] = useState({
    workingHours: {
      start: '09:00',
      end: '18:00'
    },
    workingDays: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    },
    slotDuration: 30,
    breakTime: {
      start: '12:00',
      end: '13:00'
    },
    notifications: {
      email: true,
      sms: true,
      push: true
    },
    googleCalendarSync: true,
    defaultView: 'timeGridWeek'
  });

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettings(formData);
    onClose();
  };

  if (isLoadingSettings) {
    return <LoadingSpinner />;
  }

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
                Takvim Ayarları
              </Dialog.Title>
            </div>

            {/* Form alanları */}
            <div className="p-4 space-y-4">
              {/* Çalışma saatleri */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Çalışma Saatleri
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="workStart"
                      className="block text-sm text-gray-500"
                    >
                      Başlangıç
                    </label>
                    <input
                      type="time"
                      id="workStart"
                      value={formData.workingHours.start}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          workingHours: {
                            ...formData.workingHours,
                            start: e.target.value
                          }
                        })
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="workEnd"
                      className="block text-sm text-gray-500"
                    >
                      Bitiş
                    </label>
                    <input
                      type="time"
                      id="workEnd"
                      value={formData.workingHours.end}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          workingHours: {
                            ...formData.workingHours,
                            end: e.target.value
                          }
                        })
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Çalışma günleri */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Çalışma Günleri
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(formData.workingDays).map(([day, value]) => (
                    <label
                      key={day}
                      className="inline-flex items-center"
                    >
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            workingDays: {
                              ...formData.workingDays,
                              [day]: e.target.checked
                            }
                          })
                        }
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Randevu süresi */}
              <div>
                <label
                  htmlFor="slotDuration"
                  className="block text-sm font-medium text-gray-900"
                >
                  Randevu Süresi (dakika)
                </label>
                <select
                  id="slotDuration"
                  value={formData.slotDuration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      slotDuration: parseInt(e.target.value)
                    })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value={15}>15</option>
                  <option value={30}>30</option>
                  <option value={45}>45</option>
                  <option value={60}>60</option>
                </select>
              </div>

              {/* Mola saati */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Mola Saati
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="breakStart"
                      className="block text-sm text-gray-500"
                    >
                      Başlangıç
                    </label>
                    <input
                      type="time"
                      id="breakStart"
                      value={formData.breakTime.start}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          breakTime: {
                            ...formData.breakTime,
                            start: e.target.value
                          }
                        })
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="breakEnd"
                      className="block text-sm text-gray-500"
                    >
                      Bitiş
                    </label>
                    <input
                      type="time"
                      id="breakEnd"
                      value={formData.breakTime.end}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          breakTime: {
                            ...formData.breakTime,
                            end: e.target.value
                          }
                        })
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Bildirimler */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Bildirimler
                </h3>
                <div className="space-y-2">
                  {Object.entries(formData.notifications).map(
                    ([type, value]) => (
                      <label
                        key={type}
                        className="inline-flex items-center mr-4"
                      >
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              notifications: {
                                ...formData.notifications,
                                [type]: e.target.checked
                              }
                            })
                          }
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </span>
                      </label>
                    )
                  )}
                </div>
              </div>

              {/* Google Calendar */}
              <div>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.googleCalendarSync}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        googleCalendarSync: e.target.checked
                      })
                    }
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Google Calendar ile senkronize et
                  </span>
                </label>
              </div>

              {/* Varsayılan görünüm */}
              <div>
                <label
                  htmlFor="defaultView"
                  className="block text-sm font-medium text-gray-900"
                >
                  Varsayılan Görünüm
                </label>
                <select
                  id="defaultView"
                  value={formData.defaultView}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      defaultView: e.target.value
                    })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="dayGridMonth">Ay</option>
                  <option value="timeGridWeek">Hafta</option>
                  <option value="timeGridDay">Gün</option>
                </select>
              </div>
            </div>

            {/* Butonlar */}
            <div className="px-4 py-3 bg-gray-50 flex justify-end rounded-b-lg">
              <button
                type="button"
                onClick={onClose}
                className="mr-2 inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={isLoading.updateSettings}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isLoading.updateSettings ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  'Kaydet'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
};

export default CalendarSettings;
