import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  VideoCameraIcon,
  PhoneIcon,
  UserGroupIcon,
  LocationMarkerIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChatIcon,
  BellIcon,
  DocumentTextIcon
} from '@heroicons/react/outline';
import { useAppointment } from '../../hooks/useAppointment';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';
import CancelModal from './CancelModal';
import NotesModal from './NotesModal';
import PaymentModal from './PaymentModal';
import ReminderModal from './ReminderModal';
import FeedbackModal from './FeedbackModal';

const AppointmentDetails = () => {
  const { appointmentId } = useParams();
  const {
    appointment,
    isLoading,
    errors,
    cancelAppointment,
    updateNotes,
    processPayment,
    setReminder,
    submitFeedback
  } = useAppointment(appointmentId);

  // Modal durumları
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

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

  if (isLoading.appointment) {
    return <LoadingSpinner />;
  }

  if (errors.appointment) {
    return (
      <ErrorMessage
        title="Randevu detayları yüklenemedi"
        message="Lütfen sayfayı yenileyip tekrar deneyin"
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Üst bar */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Randevu Detayları
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              #{appointment._id}
            </p>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
              appointment.status
            )}`}
          >
            {getStatusTitle(appointment.status)}
          </div>
        </div>
      </div>

      {/* Ana içerik */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Terapist bilgileri */}
        <div className="p-6 border-b">
          <div className="flex items-center">
            <img
              src={appointment.therapist.avatar}
              alt={appointment.therapist.name}
              className="h-16 w-16 rounded-full"
            />
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-900">
                {appointment.therapist.name}
              </h2>
              <p className="text-sm text-gray-500">
                {appointment.therapist.title}
              </p>
              <Link
                to={`/therapists/${appointment.therapist._id}`}
                className="mt-1 text-sm text-blue-600 hover:text-blue-500"
              >
                Profili Görüntüle
              </Link>
            </div>
          </div>
        </div>

        {/* Randevu detayları */}
        <div className="p-6 border-b">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            {/* Seans tipi */}
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Seans Tipi</dt>
              <dd className="mt-1 flex items-center text-sm text-gray-900">
                {getSessionIcon(appointment.sessionType)}
                <span className="ml-2">
                  {getSessionTitle(appointment.sessionType)}
                </span>
              </dd>
            </div>

            {/* Tarih ve saat */}
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">
                Tarih ve Saat
              </dt>
              <dd className="mt-1 flex items-center text-sm text-gray-900">
                <ClockIcon className="h-5 w-5 text-gray-400" />
                <span className="ml-2">
                  {format(new Date(appointment.startTime), 'd MMMM yyyy HH:mm', {
                    locale: tr
                  })}
                </span>
              </dd>
            </div>

            {/* Süre */}
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Süre</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {appointment.duration} dakika
              </dd>
            </div>

            {/* Ücret */}
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Ücret</dt>
              <dd className="mt-1 flex items-center text-sm text-gray-900">
                <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                <span className="ml-2">{appointment.price} TL</span>
              </dd>
            </div>

            {/* Notlar */}
            {appointment.notes && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Notlar</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {appointment.notes}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Eylem butonları */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            {appointment.status === 'upcoming' && (
              <>
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="inline-flex justify-center items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  İptal Et
                </button>
                <button
                  onClick={() => setShowReminderModal(true)}
                  className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <BellIcon className="h-5 w-5 mr-2" />
                  Hatırlatıcı Ayarla
                </button>
              </>
            )}

            {appointment.status === 'completed' && (
              <button
                onClick={() => setShowFeedbackModal(true)}
                className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Değerlendir
              </button>
            )}

            <button
              onClick={() => setShowNotesModal(true)}
              className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Not Ekle
            </button>

            <button
              onClick={() => setShowPaymentModal(true)}
              className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <CurrencyDollarIcon className="h-5 w-5 mr-2" />
              Ödeme Yap
            </button>

            <Link
              to={`/messages/${appointment.therapist._id}`}
              className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ChatIcon className="h-5 w-5 mr-2" />
              Mesaj Gönder
            </Link>
          </div>
        </div>
      </div>

      {/* Modallar */}
      <CancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onSubmit={cancelAppointment}
        isLoading={isLoading.cancel}
      />

      <NotesModal
        isOpen={showNotesModal}
        onClose={() => setShowNotesModal(false)}
        initialNotes={appointment.notes}
        onSubmit={updateNotes}
        isLoading={isLoading.notes}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        appointment={appointment}
        onSubmit={processPayment}
        isLoading={isLoading.payment}
      />

      <ReminderModal
        isOpen={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        appointment={appointment}
        onSubmit={setReminder}
        isLoading={isLoading.reminder}
      />

      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        appointment={appointment}
        onSubmit={submitFeedback}
        isLoading={isLoading.feedback}
      />
    </div>
  );
};

export default AppointmentDetails;
