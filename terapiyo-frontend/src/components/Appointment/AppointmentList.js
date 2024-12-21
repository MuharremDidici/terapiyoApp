import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  VideoCameraIcon,
  PhoneIcon,
  UserGroupIcon,
  LocationMarkerIcon,
  ChevronDownIcon
} from '@heroicons/react/outline';
import { useAppointment } from '../../hooks/useAppointment';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';
import Pagination from '../Common/Pagination';

const AppointmentList = () => {
  const [filters, setFilters] = useState({
    status: 'upcoming',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 gün
    page: 1,
    limit: 10
  });

  const {
    data: appointments,
    isLoading,
    error,
    isFetching
  } = useAppointment().useAppointmentList(filters);

  // Seans tipi ikonları
  const getSessionIcon = (type) => {
    switch (type) {
      case 'video':
        return <VideoCameraIcon className="h-5 w-5" />;
      case 'phone':
        return <PhoneIcon className="h-5 w-5" />;
      case 'group':
        return <UserGroupIcon className="h-5 w-5" />;
      case 'inPerson':
        return <LocationMarkerIcon className="h-5 w-5" />;
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

  // Durum renkleri
  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Durum başlıkları
  const getStatusTitle = (status) => {
    switch (status) {
      case 'upcoming':
        return 'Yaklaşan';
      case 'completed':
        return 'Tamamlandı';
      case 'cancelled':
        return 'İptal Edildi';
      case 'pending':
        return 'Onay Bekliyor';
      default:
        return status;
    }
  };

  // Sayfa değiştir
  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  // Durum filtresi
  const handleStatusFilter = (status) => {
    setFilters((prev) => ({ ...prev, status, page: 1 }));
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ErrorMessage
        title="Randevular yüklenemedi"
        message="Lütfen sayfayı yenileyip tekrar deneyin"
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Filtreler */}
      <div className="p-4 border-b">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="flex items-center space-x-2">
            {['upcoming', 'completed', 'cancelled', 'pending'].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusFilter(status)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filters.status === status
                    ? getStatusColor(status)
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {getStatusTitle(status)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Randevu listesi */}
      <div className="overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {appointments.items.map((appointment) => (
            <li key={appointment._id}>
              <Link
                to={`/appointments/${appointment._id}`}
                className="block hover:bg-gray-50"
              >
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {/* Terapist avatarı */}
                      <img
                        src={appointment.therapist.avatar}
                        alt={appointment.therapist.name}
                        className="h-10 w-10 rounded-full"
                      />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">
                          {appointment.therapist.name}
                        </p>
                        <div className="flex items-center mt-1">
                          <div
                            className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              appointment.status
                            )}`}
                          >
                            {getStatusTitle(appointment.status)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      {/* Seans tipi */}
                      <div className="mr-6 flex items-center text-sm text-gray-500">
                        {getSessionIcon(appointment.sessionType)}
                        <span className="ml-1">
                          {getSessionTitle(appointment.sessionType)}
                        </span>
                      </div>

                      {/* Tarih ve saat */}
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {format(
                            new Date(appointment.startTime),
                            'd MMMM yyyy',
                            { locale: tr }
                          )}
                        </p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(appointment.startTime), 'HH:mm')}
                        </p>
                      </div>

                      <ChevronDownIcon className="ml-4 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Sayfalama */}
      {appointments.pagination && (
        <div className="p-4 border-t">
          <Pagination
            currentPage={appointments.pagination.page}
            totalPages={appointments.pagination.pages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default AppointmentList;
