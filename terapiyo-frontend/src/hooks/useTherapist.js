import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import therapistService from '../services/therapist.service';

export const useTherapist = (therapistId) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Terapist detayları
  const {
    data: therapist,
    isLoading: isLoadingTherapist,
    error: therapistError
  } = useQuery(
    ['therapist', therapistId],
    () => therapistService.getTherapistDetails(therapistId),
    {
      enabled: !!therapistId
    }
  );

  // Terapist değerlendirmeleri
  const {
    data: reviews,
    isLoading: isLoadingReviews,
    error: reviewsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useQuery(
    ['therapist-reviews', therapistId],
    () => therapistService.getTherapistReviews(therapistId),
    {
      enabled: !!therapistId
    }
  );

  // Terapist müsaitlik durumu
  const {
    data: availability,
    isLoading: isLoadingAvailability,
    error: availabilityError,
    refetch: refetchAvailability
  } = useQuery(
    ['therapist-availability', therapistId],
    () => therapistService.getTherapistAvailability(
      therapistId,
      new Date(),
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 gün
    ),
    {
      enabled: !!therapistId
    }
  );

  // Terapist seans tipleri
  const {
    data: sessionTypes,
    isLoading: isLoadingSessionTypes,
    error: sessionTypesError
  } = useQuery(
    ['therapist-session-types', therapistId],
    () => therapistService.getTherapistSessionTypes(therapistId),
    {
      enabled: !!therapistId
    }
  );

  // Favori ekleme/çıkarma
  const toggleFavoriteMutation = useMutation(
    () => therapistService.toggleFavorite(therapistId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['therapist', therapistId]);
        toast.success('Favoriler güncellendi');
      },
      onError: () => {
        toast.error('Favori işlemi başarısız oldu');
      }
    }
  );

  // Mesaj gönderme
  const sendMessageMutation = useMutation(
    (message) => therapistService.sendMessage(therapistId, message),
    {
      onSuccess: () => {
        toast.success('Mesajınız gönderildi');
      },
      onError: () => {
        toast.error('Mesaj gönderilemedi');
      }
    }
  );

  // Değerlendirme yapma
  const createReviewMutation = useMutation(
    (review) => therapistService.createReview(therapistId, review),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['therapist-reviews', therapistId]);
        toast.success('Değerlendirmeniz kaydedildi');
      },
      onError: () => {
        toast.error('Değerlendirme kaydedilemedi');
      }
    }
  );

  // Randevu oluşturma
  const createAppointmentMutation = useMutation(
    (appointment) => therapistService.createAppointment(therapistId, appointment),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['therapist-availability', therapistId]);
        toast.success('Randevunuz oluşturuldu');
        navigate(`/appointments/${data.appointmentId}`);
      },
      onError: () => {
        toast.error('Randevu oluşturulamadı');
      }
    }
  );

  return {
    // Veriler
    therapist,
    reviews,
    availability,
    sessionTypes,

    // Yükleniyor durumları
    isLoading: {
      therapist: isLoadingTherapist,
      reviews: isLoadingReviews,
      availability: isLoadingAvailability,
      sessionTypes: isLoadingSessionTypes,
      favorite: toggleFavoriteMutation.isLoading,
      message: sendMessageMutation.isLoading,
      review: createReviewMutation.isLoading,
      appointment: createAppointmentMutation.isLoading
    },

    // Hatalar
    errors: {
      therapist: therapistError,
      reviews: reviewsError,
      availability: availabilityError,
      sessionTypes: sessionTypesError
    },

    // Sayfalama
    pagination: {
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage
    },

    // Metodlar
    toggleFavorite: toggleFavoriteMutation.mutate,
    sendMessage: sendMessageMutation.mutate,
    createReview: createReviewMutation.mutate,
    createAppointment: createAppointmentMutation.mutate,
    refetchAvailability
  };
};
