import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next'; 
import { FaDownload, FaEdit, FaMousePointer } from 'react-icons/fa';
import './GradesTable.css';

const GradesTable = ({ selectedTopic, students }) => {
  const { t } = useTranslation();

  const filterCategories = useMemo(() => [
    { key: 'General', tKey: 'groupWorkspace.categories.general' },
    { key: 'Notebook', tKey: 'groupWorkspace.categories.notebook', weightKey: 'notebookWeight', assignmentsKey: 'notebookAssignments' },
    { key: 'Practices', tKey: 'groupWorkspace.categories.practices', weightKey: 'practiceWeight', assignmentsKey: 'practiceAssignments' },
    { key: 'Exam', tKey: 'groupWorkspace.categories.exam', weightKey: 'examWeight', assignmentsKey: 'examAssignments' },
    { key: 'Others', tKey: 'groupWorkspace.categories.others', weightKey: 'otherWeight', assignmentsKey: 'otherAssignments' },
  ], [t]);

  const [activeCategory, setActiveCategory] = useState('General');

  const assignments = useMemo(() => {
    if (!selectedTopic || activeCategory === 'General') {
      return [];
    }
    const categoryInfo = filterCategories.find(c => c.key === activeCategory);
    return selectedTopic[categoryInfo.assignmentsKey] || [];
  }, [selectedTopic, activeCategory, filterCategories]);

  const getFinalTopicGrade = (student) => 0;
  const getCategoryGrade = (student, categoryKey) => 0;
  const getAssignmentGrade = (student, assignmentId) => '-';

  return (
    <div className="gw-gt-container">
      <div className="gw-gt-header">
        {/* Use translation */}
        <h3 className="gw-gt-title">{t('groupWorkspace.gradesTable.title')}</h3>
        <div className="gw-gt-actions">
          <button className="gw-gt-action-btn"><FaDownload /></button>
          <button className="gw-gt-action-btn"><FaEdit /></button>
          <button className="gw-gt-action-btn"><FaMousePointer /></button>
        </div>
      </div>
      
      <div className="gw-gt-filters">
        {filterCategories.map(category => {
          const weight = selectedTopic && category.weightKey ? selectedTopic[category.weightKey] : null;
          return (
            <button
              key={category.key}
              className={`gw-gt-filter-btn ${activeCategory === category.key ? 'active' : ''}`}
              onClick={() => setActiveCategory(category.key)}
            >
              {t(category.tKey)} {weight !== null ? `(${weight}%)` : ''}
            </button>
          );
        })}
      </div>
      
      <div className="gw-gt-table-wrapper">
        <table className="gw-gt-table">
          <thead>
            {activeCategory === 'General' ? (
              <tr>
                <th>{t('groupWorkspace.gradesTable.generalGrade')}</th>
                <th>{t('groupWorkspace.gradesTable.studentName')}</th>
                {filterCategories.slice(1).map(cat => <th key={cat.key}>{t(cat.tKey)}</th>)}
              </tr>
            ) : (
              <tr>
                <th>{t('groupWorkspace.gradesTable.categoryGrade')}</th>
                <th>{t('groupWorkspace.gradesTable.studentName')}</th>
                {assignments.map(asg => <th key={asg.id}>{asg.name}</th>)}
              </tr>
            )}
          </thead>
          
          <tbody>
            {activeCategory === 'General' ? (
              students.map(student => {
                const finalGrade = getFinalTopicGrade(student);
                return (
                  <tr key={student.id}>
                    <td>{finalGrade.toFixed(2)}</td>
                    <td>{student.lastName} <strong>{student.firstName}</strong></td>
                    {filterCategories.slice(1).map(cat => {
                      const categoryGrade = getCategoryGrade(student, cat.key);
                      const weight = selectedTopic ? selectedTopic[cat.weightKey] : 0;
                      const weightedValue = (categoryGrade * weight) / 10;
                      return (
                        <td key={cat.key}>
                          {categoryGrade.toFixed(1)} ({weightedValue.toFixed(1)}%)
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            ) : (
              assignments.length > 0 ? (
                students.map(student => (
                  <tr key={student.id}>
                    <td>{getCategoryGrade(student, activeCategory).toFixed(2)}</td>
                    <td>{student.lastName} <strong>{student.firstName}</strong></td>
                    {assignments.map(asg => (
                      <td key={asg.id}>{getAssignmentGrade(student, asg.id)}</td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" style={{ textAlign: 'center', padding: '2rem' }}>
                    {t('groupWorkspace.gradesTable.noAssignments')}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GradesTable;