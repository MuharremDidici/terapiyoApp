import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import appointmentService from '../services/appointment.service';

export const useAppointment = (appointmentId) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Randevu detayları
  const {
    data: appointment,
    isLoading: isLoadingAppointment,
    error: appointmentError,
    refetch: refetchAppointment
  } = useQuery(
    ['appointment', appointmentId],
    () => appointmentService.getAppointmentDetails(appointmentId),
    {
      enabled: !!appointmentId
    }
  );

  // Randevu listesi
  const useAppointmentList = (filters = {}) => {
    return useQuery(
      ['appointments', filters],
      () => appointmentService.listAppointments(filters),
      {
        keepPreviousData: true
      }
    );
  };

  // Randevu oluştur
  const createAppointmentMutation = useMutation(
    (data) => appointmentService.createAppointment(data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('appointments');
        toast.success('Randevunuz başarıyla oluşturuldu');
        navigate(`/appointments/${data.appointmentId}`);
      },
      onError: () => {
        toast.error('Randevu oluşturulurken bir hata oluştu');
      }
    }
  );

  // Randevu güncelle
  const updateAppointmentMutation = useMutation(
    (data) => appointmentService.updateAppointment(appointmentId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['appointment', appointmentId]);
        toast.success('Randevu bilgileri güncellendi');
      },
      onError: () => {
        toast.error('Randevu güncellenirken bir hata oluştu');
      }
    }
  );

  // Randevu iptal et
  const cancelAppointmentMutation = useMutation(
    (reason) => appointmentService.cancelAppointment(appointmentId, reason),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['appointment', appointmentId]);
        queryClient.invalidateQueries('appointments');
        toast.success('Randevunuz iptal edildi');
        navigate('/appointments');
      },
      onError: () => {
        toast.error('Randevu iptal edilirken bir hata oluştu');
      }
    }
  );

  // Randevu notları güncelle
  const updateNotesMutation = useMutation(
    (notes) => appointmentService.updateAppointmentNotes(appointmentId, notes),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['appointment', appointmentId]);
        toast.success('Randevu notları güncellendi');
      },
      onError: () => {
        toast.error('Notlar güncellenirken bir hata oluştu');
      }
    }
  );

  // Ödeme yap
  const processPaymentMutation = useMutation(
    (paymentData) =>
      appointmentService.processPayment(appointmentId, paymentData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['appointment', appointmentId]);
        toast.success('Ödeme başarıyla tamamlandı');
      },
      onError: () => {
        toast.error('Ödeme işlemi başarısız oldu');
      }
    }
  );

  // Hatırlatıcı ayarla
  const setReminderMutation = useMutation(
    (reminderData) =>
      appointmentService.setReminder(appointmentId, reminderData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['appointment', appointmentId]);
        toast.success('Hatırlatıcı ayarlandı');
      },
      onError: () => {
        toast.error('Hatırlatıcı ayarlanamadı');
      }
    }
  );

  // Geri bildirim gönder
  const submitFeedbackMutation = useMutation(
    (feedback) => appointmentService.submitFeedback(appointmentId, feedback),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['appointment', appointmentId]);
        toast.success('Geri bildiriminiz için teşekkürler');
      },
      onError: () => {
        toast.error('Geri bildirim gönderilemedi');
      }
    }
  );

  return {
    // Veriler
    appointment,
    useAppointmentList,

    // Yükleniyor durumları
    isLoading: {
      appointment: isLoadingAppointment,
      create: createAppointmentMutation.isLoading,
      update: updateAppointmentMutation.isLoading,
      cancel: cancelAppointmentMutation.isLoading,
      notes: updateNotesMutation.isLoading,
      payment: processPaymentMutation.isLoading,
      reminder: setReminderMutation.isLoading,
      feedback: submitFeedbackMutation.isLoading
    },

    // Hatalar
    errors: {
      appointment: appointmentError
    },

    // Metodlar
    createAppointment: createAppointmentMutation.mutate,
    updateAppointment: updateAppointmentMutation.mutate,
    cancelAppointment: cancelAppointmentMutation.mutate,
    updateNotes: updateNotesMutation.mutate,
    processPayment: processPaymentMutation.mutate,
    setReminder: setReminderMutation.mutate,
    submitFeedback: submitFeedbackMutation.mutate,
    refetchAppointment
  };
};
