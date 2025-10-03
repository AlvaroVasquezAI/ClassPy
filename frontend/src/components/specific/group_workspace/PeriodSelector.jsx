import React from 'react';
import { useTranslation } from 'react-i18next'; 

const PERIODS = [
  { id: 1, tKey: 'groupWorkspace.periods.p1' },
  { id: 2, tKey: 'groupWorkspace.periods.p2' },
  { id: 3, tKey: 'groupWorkspace.periods.p3' },
];

const PeriodSelector = ({ selectedPeriodId, setSelectedPeriodId }) => {
  const { t } = useTranslation(); 

  return (
    <div className="gw-period-selector">
      {PERIODS.map(period => (
        <button
          key={period.id}
          className={`gw-period-button ${selectedPeriodId === period.id ? 'active' : ''}`}
          onClick={() => setSelectedPeriodId(period.id)}
        >
          {t(period.tKey)}
        </button>
      ))}
    </div>
  );
};

export default PeriodSelector;