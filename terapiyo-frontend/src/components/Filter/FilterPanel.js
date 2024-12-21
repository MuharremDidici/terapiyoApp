import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import {
  FilterIcon,
  SaveIcon,
  TrashIcon,
  XIcon
} from '@heroicons/react/outline';
import { useFilter } from '../../hooks/useFilter';
import LoadingSpinner from '../Common/LoadingSpinner';

const FilterPanel = ({ type, onClose, isOpen }) => {
  const {
    filters,
    filterOptions,
    savedFilters,
    applyFilters,
    saveFilter,
    deleteFilter,
    updateFilters,
    clearFilters,
    applySavedFilter,
    isLoading
  } = useFilter(type);

  const [saveName, setSaveName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const handleApplyFilters = () => {
    applyFilters(filters);
    onClose();
  };

  const handleSaveFilter = () => {
    if (saveName) {
      saveFilter(
        { name: saveName, filters },
        {
          onSuccess: () => {
            setShowSaveDialog(false);
            setSaveName('');
          }
        }
      );
    }
  };

  const handleDeleteFilter = (filterId) => {
    if (window.confirm('Bu filtreyi silmek istediğinizden emin misiniz?')) {
      deleteFilter(filterId);
    }
  };

  if (!filterOptions) {
    return null;
  }

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-10 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded-lg max-w-2xl w-full mx-4">
          {/* Panel başlığı */}
          <div className="flex items-center justify-between p-4 border-b">
            <Dialog.Title className="text-lg font-medium text-gray-900">
              Filtreler
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Filtre seçenekleri */}
              <div className="space-y-4">
                {Object.entries(filterOptions).map(([key, options]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700">
                      {options.label}
                    </label>
                    {options.type === 'select' && (
                      <select
                        value={filters[key] || ''}
                        onChange={(e) =>
                          updateFilters({ [key]: e.target.value })
                        }
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="">Seçiniz</option>
                        {options.values.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                    {options.type === 'range' && (
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          value={filters[`${key}Min`] || ''}
                          onChange={(e) =>
                            updateFilters({
                              [`${key}Min`]: e.target.value
                            })
                          }
                          placeholder="Min"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                        <input
                          type="number"
                          value={filters[`${key}Max`] || ''}
                          onChange={(e) =>
                            updateFilters({
                              [`${key}Max`]: e.target.value
                            })
                          }
                          placeholder="Max"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                    )}
                    {options.type === 'date' && (
                      <div className="flex space-x-2">
                        <input
                          type="date"
                          value={filters[`${key}Start`] || ''}
                          onChange={(e) =>
                            updateFilters({
                              [`${key}Start`]: e.target.value
                            })
                          }
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                        <input
                          type="date"
                          value={filters[`${key}End`] || ''}
                          onChange={(e) =>
                            updateFilters({
                              [`${key}End`]: e.target.value
                            })
                          }
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                    )}
                    {options.type === 'boolean' && (
                      <div className="mt-1">
                        <input
                          type="checkbox"
                          checked={filters[key] || false}
                          onChange={(e) =>
                            updateFilters({ [key]: e.target.checked })
                          }
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-600">
                          {options.label}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Kayıtlı filtreler */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Kayıtlı Filtreler
                </h3>
                {isLoading.saved ? (
                  <LoadingSpinner />
                ) : (
                  <div className="space-y-2">
                    {savedFilters?.map((filter) => (
                      <div
                        key={filter.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                      >
                        <button
                          onClick={() => applySavedFilter(filter)}
                          className="text-sm text-gray-900 hover:text-blue-600"
                        >
                          {filter.name}
                        </button>
                        <button
                          onClick={() => handleDeleteFilter(filter.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Butonlar */}
            <div className="mt-6 flex justify-between">
              <div>
                <button
                  onClick={() => setShowSaveDialog(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <SaveIcon className="h-4 w-4 mr-2" />
                  Filtreyi Kaydet
                </button>
                <button
                  onClick={clearFilters}
                  className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Temizle
                </button>
              </div>
              <button
                onClick={handleApplyFilters}
                disabled={isLoading.filtering}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isLoading.filtering ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <FilterIcon className="h-4 w-4 mr-2" />
                    Uygula
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Kaydetme modalı */}
      <Dialog
        open={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        className="fixed inset-0 z-20 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-lg max-w-md w-full mx-4 p-4">
            <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
              Filtreyi Kaydet
            </Dialog.Title>

            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="Filtre adı"
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />

            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                İptal
              </button>
              <button
                onClick={handleSaveFilter}
                disabled={!saveName || isLoading.saving}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isLoading.saving ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  'Kaydet'
                )}
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </Dialog>
  );
};

export default FilterPanel;
