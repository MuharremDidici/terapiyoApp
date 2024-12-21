import React from 'react';
import { XIcon } from '@heroicons/react/solid';

const FilterBadge = ({ label, onRemove }) => {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none"
        >
          <XIcon className="h-3 w-3" />
        </button>
      )}
    </span>
  );
};

export default FilterBadge;
