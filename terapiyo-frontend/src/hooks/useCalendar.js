import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import calendarService from '../services/calendar.service';

export const useCalendar = () => {
  const queryClient = useQueryClient();

  // Etkinlikler
  const useEvents = (start, end, options = {}) => {
    return useQuery(
      ['events', { start, end, ...options }],
      () => calendarService.getEvents(start, end, options),
      {
        keepPreviousData: true
      }
    );
  };

  // Etkinlik detayları
  const useEvent = (eventId) => {
    return useQuery(
      ['event', eventId],
      () => calendarService.getEvent(eventId),
      {
        enabled: !!eventId
      }
    );
  };

  // Müsait zamanlar
  const useAvailableSlots = (therapistId, date) => {
    return useQuery(
      ['slots', { therapistId, date }],
      () => calendarService.getAvailableSlots(therapistId, date),
      {
        enabled: !!therapistId && !!date
      }
    );
  };

  // Takvim ayarları
  const useSettings = () => {
    return useQuery('calendarSettings', () => calendarService.getSettings());
  };

  // Etkinlik oluştur
  const createEventMutation = useMutation(
    (eventData) => calendarService.createEvent(eventData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('events');
        toast.success('Etkinlik başarıyla oluşturuldu');
      },
      onError: () => {
        toast.error('Etkinlik oluşturulamadı');
      }
    }
  );

  // Etkinlik güncelle
  const updateEventMutation = useMutation(
    ({ eventId, eventData }) => calendarService.updateEvent(eventId, eventData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('events');
        toast.success('Etkinlik başarıyla güncellendi');
      },
      onError: () => {
        toast.error('Etkinlik güncellenemedi');
      }
    }
  );

  // Etkinlik sil
  const deleteEventMutation = useMutation(
    (eventId) => calendarService.deleteEvent(eventId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('events');
        toast.success('Etkinlik başarıyla silindi');
      },
      onError: () => {
        toast.error('Etkinlik silinemedi');
      }
    }
  );

  // Google Calendar senkronizasyonu
  const syncGoogleCalendarMutation = useMutation(
    () => calendarService.syncGoogleCalendar(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('events');
        toast.success('Google Calendar ile senkronizasyon başarılı');
      },
      onError: () => {
        toast.error('Google Calendar ile senkronizasyon başarısız');
      }
    }
  );

  // iCalendar dosyası indir
  const exportICalendarMutation = useMutation(
    (eventId) => calendarService.exportICalendar(eventId),
    {
      onSuccess: (data, eventId) => {
        // Dosyayı indir
        const blob = new Blob([data], { type: 'text/calendar' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `event-${eventId}.ics`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      onError: () => {
        toast.error('iCalendar dosyası indirilemedi');
      }
    }
  );

  // Çakışan randevuları kontrol et
  const checkConflictsMutation = useMutation(
    (eventData) => calendarService.checkConflicts(eventData)
  );

  // Takvim ayarlarını güncelle
  const updateSettingsMutation = useMutation(
    (settings) => calendarService.updateSettings(settings),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('calendarSettings');
        toast.success('Takvim ayarları güncellendi');
      },
      onError: () => {
        toast.error('Takvim ayarları güncellenemedi');
      }
    }
  );

  return {
    // Sorgular
    useEvents,
    useEvent,
    useAvailableSlots,
    useSettings,

    // Yükleniyor durumları
    isLoading: {
      create: createEventMutation.isLoading,
      update: updateEventMutation.isLoading,
      delete: deleteEventMutation.isLoading,
      sync: syncGoogleCalendarMutation.isLoading,
      export: exportICalendarMutation.isLoading,
      checkConflicts: checkConflictsMutation.isLoading,
      updateSettings: updateSettingsMutation.isLoading
    },

    // Metodlar
    createEvent: createEventMutation.mutate,
    updateEvent: updateEventMutation.mutate,
    deleteEvent: deleteEventMutation.mutate,
    syncGoogleCalendar: syncGoogleCalendarMutation.mutate,
    exportICalendar: exportICalendarMutation.mutate,
    checkConflicts: checkConflictsMutation.mutate,
    updateSettings: updateSettingsMutation.mutate
  };
};
