import React, { useState, useRef, useEffect } from 'react';
import { useSearch } from '../../hooks/useSearch';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import { SearchIcon, XIcon } from '@heroicons/react/solid';

const SearchBar = () => {
  const {
    searchParams,
    suggestions,
    popularSearches,
    isLoading,
    updateSearchParams
  } = useSearch();

  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  // Dışarı tıklanınca önerileri kapat
  useOnClickOutside(searchRef, () => setShowSuggestions(false));

  // Arama sorgusunu güncelle
  const handleSearch = (query) => {
    updateSearchParams({ query });
  };

  // Öneri seç
  const handleSelectSuggestion = (suggestion) => {
    updateSearchParams({ query: suggestion });
    setShowSuggestions(false);
  };

  // Aramayı temizle
  const handleClear = () => {
    updateSearchParams({ query: '' });
    setShowSuggestions(false);
  };

  return (
    <div className="relative" ref={searchRef}>
      {/* Arama çubuğu */}
      <div className="relative">
        <input
          type="text"
          className="w-full px-4 py-2 pl-10 pr-10 text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Terapist veya konu ara..."
          value={searchParams.query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
        />

        {/* Arama ikonu */}
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
          <SearchIcon className="w-5 h-5 text-gray-400" />
        </div>

        {/* Temizle butonu */}
        {searchParams.query && (
          <button
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={handleClear}
          >
            <XIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Öneriler */}
      {showSuggestions && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg">
          {isLoading.suggestions ? (
            <div className="p-4 text-center text-gray-500">
              Öneriler yükleniyor...
            </div>
          ) : suggestions?.length > 0 ? (
            <div className="py-2">
              <div className="px-4 py-2 text-sm font-medium text-gray-500">
                Öneriler
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100"
                  onClick={() => handleSelectSuggestion(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          ) : searchParams.query ? (
            <div className="p-4 text-center text-gray-500">
              Öneri bulunamadı
            </div>
          ) : (
            <div className="py-2">
              <div className="px-4 py-2 text-sm font-medium text-gray-500">
                Popüler Aramalar
              </div>
              {popularSearches?.map((search, index) => (
                <button
                  key={index}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100"
                  onClick={() => handleSelectSuggestion(search)}
                >
                  {search}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
