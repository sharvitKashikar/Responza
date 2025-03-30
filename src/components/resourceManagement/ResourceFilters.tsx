import React from 'react';
import { ResourceFilters as ResourceFiltersType, AmbulanceStatus } from '../../types/resource.types';

interface ResourceFiltersProps {
  onFilterChange: (filters: ResourceFiltersType) => void;
  currentFilters: ResourceFiltersType;
}

export const ResourceFilters: React.FC<ResourceFiltersProps> = ({
  onFilterChange,
  currentFilters,
}) => {
  const handleStatusChange = (status: AmbulanceStatus | '') => {
    onFilterChange({
      ...currentFilters,
      status: status || undefined,
    });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...currentFilters,
      searchQuery: event.target.value,
    });
  };

  return (
    <div className="resource-filters">
      <div className="filter-group">
        <label htmlFor="status">Status:</label>
        <select
          id="status"
          value={currentFilters.status || ''}
          onChange={(e) => handleStatusChange(e.target.value as AmbulanceStatus | '')}
        >
          <option value="">All</option>
          <option value="available">Available</option>
          <option value="assigned">Assigned</option>
          <option value="maintenance">Maintenance</option>
          <option value="offline">Offline</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="search">Search:</label>
        <input
          type="text"
          id="search"
          placeholder="Search by name or ID..."
          value={currentFilters.searchQuery || ''}
          onChange={handleSearchChange}
        />
      </div>
    </div>
  );
};
