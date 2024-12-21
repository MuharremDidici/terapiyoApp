import React from 'react';
import { useSearch } from '../../hooks/useSearch';
import TherapistCard from '../Therapist/TherapistCard';
import ContentCard from '../Content/ContentCard';
import Pagination from '../Common/Pagination';

const SearchResults = () => {
  const {
    searchParams,
    therapists,
    content,
    isLoading,
    errors,
    changePage,
    changeSort
  } = useSearch();

  // Sıralama seçenekleri
  const sortOptions = [
    { value: 'relevance', label: 'İlgililik' },
    { value: 'rating', label: 'Puan' },
    { value: 'price_asc', label: 'Fiyat (Artan)' },
    { value: 'price_desc', label: 'Fiyat (Azalan)' },
    { value: 'experience', label: 'Deneyim' }
  ];

  return (
    <div className="space-y-6">
      {/* Üst bar */}
      <div className="flex items-center justify-between">
        {/* Sonuç sayısı */}
        <div className="text-sm text-gray-500">
          {therapists?.pagination.total} sonuç bulundu
        </div>

        {/* Sıralama */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Sırala:</span>
          <select
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchParams.options.sort}
            onChange={(e) => changeSort(e.target.value)}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Yükleniyor */}
      {(isLoading.therapists || isLoading.content) && (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
        </div>
      )}

      {/* Hata */}
      {(errors.therapists || errors.content) && (
        <div className="p-4 text-red-500 bg-red-100 rounded-lg">
          Sonuçlar yüklenirken bir hata oluştu. Lütfen tekrar deneyin.
        </div>
      )}

      {/* Sonuç bulunamadı */}
      {!isLoading.therapists && !errors.therapists && therapists?.therapists.length === 0 && (
        <div className="py-12 text-center">
          <div className="text-lg font-medium text-gray-900">
            Sonuç bulunamadı
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Farklı arama terimleri veya filtreler deneyebilirsiniz.
          </div>
        </div>
      )}

      {/* Terapist sonuçları */}
      {therapists?.therapists.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {therapists.therapists.map((therapist) => (
            <TherapistCard key={therapist._id} therapist={therapist} />
          ))}
        </div>
      )}

      {/* İçerik sonuçları */}
      {content?.content.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-medium text-gray-900">
            İlgili İçerikler
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {content.content.map((item) => (
              <ContentCard key={item._id} content={item} />
            ))}
          </div>
        </div>
      )}

      {/* Sayfalama */}
      {therapists?.pagination && (
        <Pagination
          currentPage={therapists.pagination.page}
          totalPages={therapists.pagination.pages}
          onPageChange={changePage}
        />
      )}
    </div>
  );
};

export default SearchResults;
