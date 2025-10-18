import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FaDownload, FaEdit, FaMousePointer } from 'react-icons/fa';
import './GradesTable.css';

const formatGrade = (num) => {
  if (num % 1 === 0) {
    return num.toFixed(0); 
  }
  return num.toFixed(2); 
};

const GradesTable = ({ selectedTopic, students, gradeData, isLoading }) => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('General');

  const filterCategories = useMemo(() => [
    { key: 'General', tKey: 'groupWorkspace.categories.general' },
    { key: 'Notebook', tKey: 'groupWorkspace.categories.notebook', weightKey: 'notebookWeight' },
    { key: 'Practices', tKey: 'groupWorkspace.categories.practices', weightKey: 'practiceWeight' },
    { key: 'Exam', tKey: 'groupWorkspace.categories.exam', weightKey: 'examWeight' },
    { key: 'Others', tKey: 'groupWorkspace.categories.others', weightKey: 'otherWeight' },
  ], [t]);

  const assignmentsForCategory = useMemo(() => {
    if (!gradeData?.assignments || activeCategory === 'General') return [];
    return gradeData.assignments.filter(asg => asg.category === activeCategory);
  }, [gradeData, activeCategory]);

  const getAssignmentGrade = (studentId, assignmentId) => {
    const grade = gradeData?.grades?.[studentId]?.[assignmentId];
    if (grade === null || grade === undefined) return '—';
    return formatGrade(parseFloat(grade)); 
  };
  
  const summaryData = useMemo(() => {
    if (!selectedTopic || !gradeData || !students || students.length === 0) {
      return [];
    }
    const assignmentsByCategory = {
      Notebook: (gradeData.assignments || []).filter(a => a.category === 'Notebook'),
      Practices: (gradeData.assignments || []).filter(a => a.category === 'Practices'),
      Exam: (gradeData.assignments || []).filter(a => a.category === 'Exam'),
      Others: (gradeData.assignments || []).filter(a => a.category === 'Others'),
    };
    return students.map(student => {
      const studentGrades = gradeData.grades[student.id] || {};
      let finalGrade = 0;
      const categorySummaries = {};
      filterCategories.slice(1).forEach(cat => {
        const assignments = assignmentsByCategory[cat.key];
        const gradesForCategory = assignments
          .map(asg => studentGrades[asg.id])
          .filter(grade => grade !== null && grade !== undefined);
        let average = 0;
        if (gradesForCategory.length > 0) {
          const sum = gradesForCategory.reduce((acc, grade) => acc + parseFloat(grade), 0);
          average = sum / gradesForCategory.length;
        }
        const weight = selectedTopic[cat.weightKey] || 0;
        const weightedValue = (average * weight) / 100.0;
        finalGrade += weightedValue;
        categorySummaries[cat.key] = { average, weightedValue };
      });
      return {
        studentId: student.id,
        studentName: `${student.lastName} ${student.firstName}`,
        finalGrade,
        categorySummaries,
      };
    });
  }, [students, gradeData, selectedTopic, filterCategories]);

  return (
    <div className="gw-gt-container">
      <div className="gw-gt-header">
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
            <button key={category.key} className={`gw-gt-filter-btn ${activeCategory === category.key ? 'active' : ''}`} onClick={() => setActiveCategory(category.key)}>
              {t(category.tKey)} {weight !== null ? `(${weight}%)` : ''}
            </button>
          );
        })}
      </div>

      <div className="gw-gt-table-wrapper">
        {isLoading ? ( <p style={{ textAlign: 'center', padding: '2rem' }}>Loading Grades...</p> ) : (
          <table className="gw-gt-table">
            <thead>
              {activeCategory === 'General' ? (
                <tr>
                  <th className="align-center">{t('groupWorkspace.gradesTable.generalGrade')}</th>
                  <th className="align-left">{t('groupWorkspace.gradesTable.studentName')}</th>
                  {filterCategories.slice(1).map(cat => <th key={cat.key} className="align-center">{t(cat.tKey)}</th>)}
                </tr>
              ) : (
                <tr>
                  <th className="align-center">{t('groupWorkspace.gradesTable.categoryGrade')}</th>
                  <th className="align-left">{t('groupWorkspace.gradesTable.studentName')}</th>
                  {assignmentsForCategory.map(asg => <th key={asg.id} className="align-center">{asg.name}</th>)}
                </tr>
              )}
            </thead>
            <tbody>
              {activeCategory === 'General' ? (
                summaryData.length > 0 ? (
                  summaryData.map(data => (
                    <tr key={data.studentId}>
                      <td className="align-center"><strong>{formatGrade(data.finalGrade)}</strong></td>
                      <td className="align-left">{data.studentName}</td>
                      {filterCategories.slice(1).map(cat => (
                        <td key={cat.key} className="align-center">
                          {formatGrade(data.categorySummaries[cat.key].average)}
                          <span className="weighted-percentage">({formatGrade(data.categorySummaries[cat.key].weightedValue)}%)</span>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : ( <tr><td colSpan={filterCategories.length + 1} className="empty-cell">{t('groupWorkspace.gradesTable.noGrades')}</td></tr> )
              ) : (
                assignmentsForCategory.length > 0 ? (
                  summaryData.map(data => (
                    <tr key={data.studentId}>
                      <td className="align-center"><strong>{formatGrade(data.categorySummaries[activeCategory]?.average)}</strong></td>
                      <td className="align-left">{data.studentName}</td>
                      {assignmentsForCategory.map(asg => (
                        <td key={asg.id} className="align-center">{getAssignmentGrade(data.studentId, asg.id)}</td>
                      ))}
                    </tr>
                  ))
                ) : ( <tr><td colSpan="2" className="empty-cell">{t('groupWorkspace.gradesTable.noAssignments')}</td></tr> )
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default GradesTable;