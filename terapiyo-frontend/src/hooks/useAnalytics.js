import { useQuery, useMutation, useQueryClient } from 'react-query';
import analyticsService from '../services/analytics.service';

export const useAnalytics = () => {
  const queryClient = useQueryClient();

  // Platform genel bakış raporu
  const usePlatformOverview = (period) => {
    return useQuery(
      ['platformOverview', period],
      () => analyticsService.getPlatformOverview(period)
    );
  };

  // Terapist performans raporu
  const useTherapistPerformance = (therapistId, period) => {
    return useQuery(
      ['therapistPerformance', therapistId, period],
      () => analyticsService.getTherapistPerformance(therapistId, period)
    );
  };

  // Finansal rapor
  const useFinancialReport = (period) => {
    return useQuery(
      ['financialReport', period],
      () => analyticsService.getFinancialReport(period)
    );
  };

  // Metrik ekleme
  const addMetric = useMutation(
    (metricData) => analyticsService.addMetric(metricData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('metrics');
      }
    }
  );

  // Olay kaydetme
  const logEvent = useMutation(
    (eventData) => analyticsService.logEvent(eventData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('events');
      }
    }
  );

  return {
    // Raporlar
    usePlatformOverview,
    useTherapistPerformance,
    useFinancialReport,

    // Metrik ve olay işlemleri
    addMetric,
    logEvent
  };
};
