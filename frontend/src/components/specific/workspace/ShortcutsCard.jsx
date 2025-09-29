import React from 'react';
import { FaStar, FaClipboardList, FaCalendarCheck, FaChartBar, FaTasks } from 'react-icons/fa';
import './Workspace.css';

const ShortcutsCard = () => {
  return (
    <>
      <div className="workspace-card-header">
        <div className="header-left">
          <FaStar />
          <h3>Shortcuts</h3>
        </div>
      </div>
      <div className="shortcuts-container">
        <button className="shortcut-button">
          <FaClipboardList />
          <span>View Exams</span>
        </button>
        <button className="shortcut-button">
          <FaTasks />
          <span>View Assignments</span>
        </button>
        <button className="shortcut-button">
          <FaCalendarCheck />
          <span>View Plannings</span>
        </button>
        <button className="shortcut-button">
          <FaChartBar />
          <span>View Grades</span>
        </button>
      </div>
    </>
  );
};

export default ShortcutsCard;