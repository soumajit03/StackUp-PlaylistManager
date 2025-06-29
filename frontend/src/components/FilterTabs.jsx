import React from 'react';

const FilterTabs = ({
  activeFilter,
  onFilterChange,
  counts = { all: 0, unwatched: 0, watched: 0, practice: 0, saved: 0 }
}) => {
  const tabs = [
    { key: 'all', label: 'All Videos', count: counts.all },
    { key: 'unwatched', label: 'Unwatched', count: counts.unwatched },
    { key: 'watched', label: 'Watched', count: counts.watched },
    { key: 'practice', label: 'Practice', count: counts.practice },
    { key: 'saved', label: 'Saved', count: counts.saved },
  ];

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onFilterChange(tab.key)}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeFilter === tab.key
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
            <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
              activeFilter === tab.key
                ? 'bg-red-100 text-red-600'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default FilterTabs;