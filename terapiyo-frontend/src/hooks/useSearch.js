import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import searchService from '../services/search.service';
import { useDebounce } from './useDebounce';

export const useSearch = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useState({
    query: '',
    filters: {},
    options: {
      page: 1,
      limit: 20,
      sort: 'relevance'
    }
  });

  // Debounce arama sorgusu
  const debouncedQuery = useDebounce(searchParams.query, 300);

  // Terapist arama
  const {
    data: therapists,
    isLoading: isLoadingTherapists,
    error: therapistsError
  } = useQuery(
    ['therapists', debouncedQuery, searchParams.filters, searchParams.options],
    () => searchService.searchTherapists(
      debouncedQuery,
      searchParams.filters,
      searchParams.options
    ),
    {
      enabled: !!debouncedQuery,
      keepPreviousData: true
    }
  );

  // İçerik arama
  const {
    data: content,
    isLoading: isLoadingContent,
    error: contentError
  } = useQuery(
    ['content', debouncedQuery, searchParams.filters, searchParams.options],
    () => searchService.searchContent(
      debouncedQuery,
      searchParams.filters,
      searchParams.options
    ),
    {
      enabled: !!debouncedQuery,
      keepPreviousData: true
    }
  );

  // Arama önerileri
  const {
    data: suggestions,
    isLoading: isLoadingSuggestions
  } = useQuery(
    ['suggestions', debouncedQuery],
    () => searchService.getSearchSuggestions(debouncedQuery),
    {
      enabled: !!debouncedQuery && debouncedQuery.length >= 2,
      staleTime: 5 * 60 * 1000 // 5 dakika
    }
  );

  // Popüler aramalar
  const {
    data: popularSearches,
    isLoading: isLoadingPopular
  } = useQuery(
    'popularSearches',
    () => searchService.getPopularSearches(),
    {
      staleTime: 30 * 60 * 1000 // 30 dakika
    }
  );

  // Arama geçmişi
  const {
    data: searchHistory,
    isLoading: isLoadingHistory
  } = useQuery(
    'searchHistory',
    () => searchService.getSearchHistory(),
    {
      staleTime: 5 * 60 * 1000 // 5 dakika
    }
  );

  // Arama geçmişini temizle
  const clearHistoryMutation = useMutation(
    () => searchService.clearSearchHistory(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('searchHistory');
      }
    }
  );

  // Arama parametrelerini güncelle
  const updateSearchParams = useCallback((newParams) => {
    setSearchParams(prev => ({
      ...prev,
      ...newParams
    }));
  }, []);

  // Sayfa değiştir
  const changePage = useCallback((page) => {
    setSearchParams(prev => ({
      ...prev,
      options: {
        ...prev.options,
        page
      }
    }));
  }, []);

  // Sıralama değiştir
  const changeSort = useCallback((sort) => {
    setSearchParams(prev => ({
      ...prev,
      options: {
        ...prev.options,
        sort
      }
    }));
  }, []);

  // Filtreleri güncelle
  const updateFilters = useCallback((filters) => {
    setSearchParams(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        ...filters
      },
      options: {
        ...prev.options,
        page: 1 // Filtre değişince sayfa 1'e dön
      }
    }));
  }, []);

  return {
    // Durum
    searchParams,
    therapists,
    content,
    suggestions,
    popularSearches,
    searchHistory,

    // Yükleniyor durumları
    isLoading: {
      therapists: isLoadingTherapists,
      content: isLoadingContent,
      suggestions: isLoadingSuggestions,
      popular: isLoadingPopular,
      history: isLoadingHistory,
      clearHistory: clearHistoryMutation.isLoading
    },

    // Hatalar
    errors: {
      therapists: therapistsError,
      content: contentError
    },

    // Metodlar
    updateSearchParams,
    changePage,
    changeSort,
    updateFilters,
    clearHistory: clearHistoryMutation.mutate
  };
};
