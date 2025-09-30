import React from 'react';
import { useTranslation } from 'react-i18next'; 
import { FaStar, FaClipboardList, FaCalendarCheck, FaChartBar, FaTasks } from 'react-icons/fa';
import './Workspace.css';

const ShortcutsCard = () => {
  const { t } = useTranslation(); 

  return (
    <>
      <div className="workspace-card-header">
        <div className="header-left">
          <FaStar />
          <h3>{t('workspace.shortcuts.title')}</h3>
        </div>
      </div>
      <div className="shortcuts-container">
        <button className="shortcut-button">
          <FaClipboardList />
          <span>{t('workspace.shortcuts.viewExams')}</span>
        </button>
        <button className="shortcut-button">
          <FaTasks />
          <span>{t('workspace.shortcuts.viewAssignments')}</span>
        </button>
        <button className="shortcut-button">
          <FaCalendarCheck />
          <span>{t('workspace.shortcuts.viewPlannings')}</span>
        </button>
        <button className="shortcut-button">
          <FaChartBar />
          <span>{t('workspace.shortcuts.viewGrades')}</span>
        </button>
      </div>
    </>
  );
};

export default ShortcutsCard;