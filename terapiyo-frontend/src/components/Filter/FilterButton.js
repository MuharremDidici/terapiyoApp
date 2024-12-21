import React, { useState } from 'react';
import { FilterIcon } from '@heroicons/react/outline';
import FilterPanel from './FilterPanel';

const FilterButton = ({ type, className }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${className}`}
      >
        <FilterIcon className="h-4 w-4 mr-2" />
        Filtrele
      </button>

      <FilterPanel
        type={type}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};

export default FilterButton;
