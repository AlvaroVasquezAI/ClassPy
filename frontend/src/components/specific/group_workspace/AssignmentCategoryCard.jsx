import React from 'react';
import './AssignmentCategoryCard.css';

const AssignmentCategoryCard = ({ categoryName, weight, assignmentCount, color }) => {
  return (
    <div className="gw-ac-card">
      <div className="gw-ac-header">
        <h3 className="gw-ac-title">{categoryName}</h3>
        <span className="gw-ac-weight" style={{ backgroundColor: color }}>{weight}%</span>
      </div>
      <div className="gw-ac-body">
        <p className="gw-ac-count">{assignmentCount}</p>
        <button className="gw-ac-button">See assignments</button>
      </div>
    </div>
  );
};

export default AssignmentCategoryCard;