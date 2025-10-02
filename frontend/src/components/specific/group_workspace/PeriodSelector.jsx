import React from 'react';

const PERIODS = [
  { id: 1, name: 'Period 1' },
  { id: 2, name: 'Period 2' },
  { id: 3, name: 'Period 3' },
];

const PeriodSelector = ({ selectedPeriodId, setSelectedPeriodId }) => {
  return (
    <div className="gw-period-selector">
      {PERIODS.map(period => (
        <button
          key={period.id}
          className={`gw-period-button ${selectedPeriodId === period.id ? 'active' : ''}`}
          onClick={() => setSelectedPeriodId(period.id)}
        >
          {period.name}
        </button>
      ))}
    </div>
  );
};

export default PeriodSelector;