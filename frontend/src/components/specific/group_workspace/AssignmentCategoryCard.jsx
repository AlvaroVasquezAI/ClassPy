import React from 'react';
import './AssignmentCategoryCard.css';

const AssignmentCategoryCard = ({ categoryName, weight, assignmentCount, color, onView, onCreate }) => {
  return (
    <div className="gw-ac-card">
      <div className="gw-ac-header">
        <h3 className="gw-ac-title">{categoryName}</h3>
        <span className="gw-ac-weight" style={{ backgroundColor: color }}>{weight}%</span>
      </div>
      <div className="gw-ac-body">
        <p className="gw-ac-count">{assignmentCount}</p>
      </div>
      <div className="gw-ac-footer">
        <button className="gw-ac-button view" onClick={onView}>See assignments</button>
        <button className="gw-ac-button create" onClick={onCreate}>+ Create</button>
      </div>
    </div>
  );
};

export default AssignmentCategoryCard;