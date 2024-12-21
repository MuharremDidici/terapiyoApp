import React from 'react';
import { useSearch } from '../../hooks/useSearch';

const SearchFilters = () => {
  const { searchParams, updateFilters } = useSearch();

  // Uzmanlık alanı filtresi
  const handleSpecialtyChange = (specialty) => {
    const specialties = searchParams.filters.specialties || [];
    const updated = specialties.includes(specialty)
      ? specialties.filter(s => s !== specialty)
      : [...specialties, specialty];

    updateFilters({ specialties: updated });
  };

  // Cinsiyet filtresi
  const handleGenderChange = (gender) => {
    updateFilters({ gender });
  };

  // Fiyat aralığı filtresi
  const handlePriceChange = (range) => {
    updateFilters({ priceRange: range });
  };

  // Deneyim filtresi
  const handleExperienceChange = (range) => {
    updateFilters({ experience: range });
  };

  // Puan filtresi
  const handleRatingChange = (rating) => {
    updateFilters({ rating });
  };

  return (
    <div className="space-y-6">
      {/* Uzmanlık Alanları */}
      <div>
        <h3 className="text-lg font-medium text-gray-900">Uzmanlık Alanları</h3>
        <div className="mt-4 space-y-2">
          {specialties.map((specialty) => (
            <label
              key={specialty.value}
              className="flex items-center"
            >
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                checked={searchParams.filters.specialties?.includes(specialty.value)}
                onChange={() => handleSpecialtyChange(specialty.value)}
              />
              <span className="ml-2 text-gray-700">{specialty.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Cinsiyet */}
      <div>
        <h3 className="text-lg font-medium text-gray-900">Cinsiyet</h3>
        <div className="mt-4 space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              checked={searchParams.filters.gender === 'female'}
              onChange={() => handleGenderChange('female')}
            />
            <span className="ml-2 text-gray-700">Kadın</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              checked={searchParams.filters.gender === 'male'}
              onChange={() => handleGenderChange('male')}
            />
            <span className="ml-2 text-gray-700">Erkek</span>
          </label>
        </div>
      </div>

      {/* Fiyat Aralığı */}
      <div>
        <h3 className="text-lg font-medium text-gray-900">Fiyat Aralığı</h3>
        <div className="mt-4">
          <div className="flex items-center space-x-4">
            <input
              type="number"
              className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Min"
              value={searchParams.filters.priceRange?.min || ''}
              onChange={(e) => handlePriceChange({
                ...searchParams.filters.priceRange,
                min: parseInt(e.target.value)
              })}
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Max"
              value={searchParams.filters.priceRange?.max || ''}
              onChange={(e) => handlePriceChange({
                ...searchParams.filters.priceRange,
                max: parseInt(e.target.value)
              })}
            />
          </div>
        </div>
      </div>

      {/* Deneyim */}
      <div>
        <h3 className="text-lg font-medium text-gray-900">Deneyim</h3>
        <div className="mt-4">
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchParams.filters.experience?.min || ''}
            onChange={(e) => handleExperienceChange({
              min: parseInt(e.target.value),
              max: 30
            })}
          >
            <option value="">Tümü</option>
            <option value="0">0-2 yıl</option>
            <option value="2">2-5 yıl</option>
            <option value="5">5-10 yıl</option>
            <option value="10">10+ yıl</option>
          </select>
        </div>
      </div>

      {/* Puan */}
      <div>
        <h3 className="text-lg font-medium text-gray-900">Minimum Puan</h3>
        <div className="mt-4">
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                className={`w-8 h-8 rounded-full focus:outline-none ${
                  searchParams.filters.rating >= rating
                    ? 'bg-yellow-400 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
                onClick={() => handleRatingChange(rating)}
              >
                {rating}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Uzmanlık alanları listesi
const specialties = [
  { value: 'anxiety', label: 'Anksiyete' },
  { value: 'depression', label: 'Depresyon' },
  { value: 'relationships', label: 'İlişkiler' },
  { value: 'trauma', label: 'Travma' },
  { value: 'stress', label: 'Stres' },
  { value: 'addiction', label: 'Bağımlılık' },
  { value: 'family', label: 'Aile' },
  { value: 'personality', label: 'Kişilik' }
];

export default SearchFilters;
