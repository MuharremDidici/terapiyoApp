import React from 'react';
import FilterBadge from './FilterBadge';
import { useFilter } from '../../hooks/useFilter';

const ActiveFilters = ({ type }) => {
  const { filters, filterOptions, updateFilters } = useFilter(type);

  if (!filterOptions || Object.keys(filters).length === 0) {
    return null;
  }

  const getFilterLabel = (key, value) => {
    const option = filterOptions[key];
    if (!option) return null;

    switch (option.type) {
      case 'select':
        const selectedOption = option.values.find(
          (opt) => opt.value === value
        );
        return selectedOption
          ? `${option.label}: ${selectedOption.label}`
          : null;

      case 'range':
        const min = filters[`${key}Min`];
        const max = filters[`${key}Max`];
        if (!min && !max) return null;
        return `${option.label}: ${min || '0'} - ${max || '∞'}`;

      case 'date':
        const start = filters[`${key}Start`];
        const end = filters[`${key}End`];
        if (!start && !end) return null;
        return `${option.label}: ${start || ''} - ${end || ''}`;

      case 'boolean':
        return value ? option.label : null;

      default:
        return null;
    }
  };

  const handleRemoveFilter = (key) => {
    const option = filterOptions[key];
    if (!option) return;

    switch (option.type) {
      case 'select':
      case 'boolean':
        updateFilters({ [key]: undefined });
        break;

      case 'range':
        updateFilters({
          [`${key}Min`]: undefined,
          [`${key}Max`]: undefined
        });
        break;

      case 'date':
        updateFilters({
          [`${key}Start`]: undefined,
          [`${key}End`]: undefined
        });
        break;
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(filters).map(([key, value]) => {
        const label = getFilterLabel(key, value);
        if (!label) return null;

        return (
          <FilterBadge
            key={key}
            label={label}
            onRemove={() => handleRemoveFilter(key)}
          />
        );
      })}
    </div>
  );
};

export default ActiveFilters;
