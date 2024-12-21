import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import filterService from '../services/filter.service';

export const useFilter = (type) => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({});

  // Filtre seçeneklerini getir
  const { data: filterOptions, isLoading: isLoadingOptions } = useQuery(
    ['filterOptions', type],
    () => filterService.getFilterOptions(type)
  );

  // Kayıtlı filtreleri getir
  const { data: savedFilters, isLoading: isLoadingSaved } = useQuery(
    ['savedFilters', type],
    () => filterService.getSavedFilters(type)
  );

  // Filtreleme mutasyonu
  const { mutate: applyFilters, isLoading: isFiltering } = useMutation(
    (filters) => {
      switch (type) {
        case 'therapists':
          return filterService.filterTherapists(filters);
        case 'appointments':
          return filterService.filterAppointments(filters);
        case 'payments':
          return filterService.filterPayments(filters);
        case 'messages':
          return filterService.filterMessages(filters);
        case 'notifications':
          return filterService.filterNotifications(filters);
        default:
          throw new Error('Geçersiz filtre tipi');
      }
    },
    {
      onSuccess: (data) => {
        queryClient.setQueryData(['filteredResults', type], data);
      }
    }
  );

  // Filtre kaydetme mutasyonu
  const { mutate: saveFilter, isLoading: isSaving } = useMutation(
    ({ name, filters }) => filterService.saveFilter(name, type, filters),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['savedFilters', type]);
      }
    }
  );

  // Filtre silme mutasyonu
  const { mutate: deleteFilter, isLoading: isDeleting } = useMutation(
    (filterId) => filterService.deleteFilter(filterId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['savedFilters', type]);
      }
    }
  );

  // Filtre güncelleme
  const updateFilters = useCallback((newFilters) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      ...newFilters
    }));
  }, []);

  // Filtreleri temizle
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Kayıtlı filtreyi uygula
  const applySavedFilter = useCallback((savedFilter) => {
    setFilters(savedFilter.filters);
    applyFilters(savedFilter.filters);
  }, [applyFilters]);

  return {
    // State
    filters,
    filterOptions,
    savedFilters,

    // Mutations
    applyFilters,
    saveFilter,
    deleteFilter,

    // Actions
    updateFilters,
    clearFilters,
    applySavedFilter,

    // Loading states
    isLoading: {
      options: isLoadingOptions,
      saved: isLoadingSaved,
      filtering: isFiltering,
      saving: isSaving,
      deleting: isDeleting
    }
  };
};
