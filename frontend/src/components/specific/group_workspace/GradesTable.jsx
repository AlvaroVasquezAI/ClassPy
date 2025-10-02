import React, { useState } from 'react';
import { FaDownload, FaEdit, FaMousePointer } from 'react-icons/fa';
import './GradesTable.css';

const CATEGORIES = ['Notebook', 'Practices', 'Exam', 'Others'];

const GradesTable = ({ selectedTopic, students }) => {
  const [activeCategory, setActiveCategory] = useState('Notebook');

  const assignments = ['Assignment 1', 'Assignment 2', 'Assignment 3', 'Assignment 4'];

  return (
    <div className="gw-gt-container">
      <div className="gw-gt-header">
        <h3 className="gw-gt-title">Grades</h3>
        <div className="gw-gt-actions">
          <button className="gw-gt-action-btn"><FaDownload /></button>
          <button className="gw-gt-action-btn"><FaEdit /></button>
          <button className="gw-gt-action-btn"><FaMousePointer /></button>
        </div>
      </div>
      <div className="gw-gt-filters">
        {CATEGORIES.map(category => (
          <button
            key={category}
            className={`gw-gt-filter-btn ${activeCategory === category ? 'active' : ''}`}
            onClick={() => setActiveCategory(category)}
          >
            {category} ({selectedTopic ? selectedTopic[`${category.toLowerCase()}Weight`] : 0}%)
          </button>
        ))}
      </div>
      <div className="gw-gt-table-wrapper">
        <table className="gw-gt-table">
          <thead>
            <tr>
              <th>General Grade</th>
              <th>Student Name</th>
              {assignments.map(name => <th key={name}>{name}</th>)}
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student.id}>
                <td>0</td>
                <td>{student.lastName}, {student.firstName}</td>
                {assignments.map((_, index) => (
                  <td key={index}>-</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GradesTable;