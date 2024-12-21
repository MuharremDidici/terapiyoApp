import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTherapist } from '../../hooks/useTherapist';
import TherapistHeader from './TherapistHeader';
import TherapistAbout from './TherapistAbout';
import TherapistReviews from './TherapistReviews';
import TherapistAvailability from './TherapistAvailability';
import TherapistSessionTypes from './TherapistSessionTypes';
import AppointmentModal from '../Appointment/AppointmentModal';
import MessageModal from '../Message/MessageModal';
import ReviewModal from '../Review/ReviewModal';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';

const TherapistProfile = () => {
  const { therapistId } = useParams();
  const {
    therapist,
    reviews,
    availability,
    sessionTypes,
    isLoading,
    errors,
    pagination,
    toggleFavorite,
    sendMessage,
    createReview,
    createAppointment
  } = useTherapist(therapistId);

  // Modal durumları
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Yükleniyor
  if (isLoading.therapist) {
    return <LoadingSpinner />;
  }

  // Hata
  if (errors.therapist) {
    return (
      <ErrorMessage
        title="Terapist bilgileri yüklenemedi"
        message="Lütfen sayfayı yenileyip tekrar deneyin"
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Terapist başlık */}
      <TherapistHeader
        therapist={therapist}
        onFavorite={toggleFavorite}
        onMessage={() => setShowMessageModal(true)}
        onAppointment={() => setShowAppointmentModal(true)}
      />

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Hakkında */}
          <TherapistAbout therapist={therapist} />

          {/* Değerlendirmeler */}
          <div className="mt-8">
            <TherapistReviews
              reviews={reviews}
              isLoading={isLoading.reviews}
              error={errors.reviews}
              pagination={pagination}
              onReview={() => setShowReviewModal(true)}
            />
          </div>
        </div>

        <div>
          {/* Müsaitlik */}
          <TherapistAvailability
            availability={availability}
            isLoading={isLoading.availability}
            error={errors.availability}
          />

          {/* Seans tipleri */}
          <div className="mt-8">
            <TherapistSessionTypes
              sessionTypes={sessionTypes}
              isLoading={isLoading.sessionTypes}
              error={errors.sessionTypes}
            />
          </div>
        </div>
      </div>

      {/* Randevu modal */}
      <AppointmentModal
        isOpen={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
        therapist={therapist}
        availability={availability}
        sessionTypes={sessionTypes}
        onSubmit={createAppointment}
        isLoading={isLoading.appointment}
      />

      {/* Mesaj modal */}
      <MessageModal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        therapist={therapist}
        onSubmit={sendMessage}
        isLoading={isLoading.message}
      />

      {/* Değerlendirme modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        therapist={therapist}
        onSubmit={createReview}
        isLoading={isLoading.review}
      />
    </div>
  );
};

export default TherapistProfile;
