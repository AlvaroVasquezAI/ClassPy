import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom';
import slugify from 'slugify';
import { FaPlus, FaCalendarAlt, FaTrash, FaUsers, FaPencilAlt } from 'react-icons/fa';
import Modal from '../../common/Modal';
import { apiClient } from '../../../services/apiClient';
import './Workspace.css';

const GRADES = ['1', '2', '3'];
const GROUP_LETTERS = ['A', 'B', 'C', 'D', 'E'];

const GroupsCard = ({ groups, subjects, onUpdate }) => {
  const { t } = useTranslation();

  const [isSchedulingMode, setIsSchedulingMode] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [groupToDelete, setGroupToDelete] = useState(null);
  const [groupToEdit, setGroupToEdit] = useState(null);

  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedGroupLetter, setSelectedGroupLetter] = useState('');
  const [selectedColor, setSelectedColor] = useState('#749280');
  const [isColorConfirmed, setIsColorConfirmed] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [newColorForEdit, setNewColorForEdit] = useState('');
  const [formError, setFormError] = useState('');

  const subjectsMap = useMemo(() => subjects.reduce((acc, s) => ({ ...acc, [s.id]: s.name }), {}), [subjects]);
  const existingColors = useMemo(() => new Set(groups.map(g => g.color)), [groups]);

  const [classroomCourses, setClassroomCourses] = useState([]);
  const [selectedClassroomCourseId, setSelectedClassroomCourseId] = useState('');

  useEffect(() => {
    const fetchClassroomCourses = async () => {
      try {
        const courses = await apiClient.getClassroomCourses();
        setClassroomCourses(courses);
      } catch (error) {
        console.error("Failed to fetch classroom courses", error);
      }
    };
    fetchClassroomCourses();
  }, []);

  useEffect(() => {
    if (!isCreateModalOpen) {
      setSelectedSubjectId('');
      setSelectedGrade('');
      setSelectedGroupLetter('');
      setSelectedColor('#749280');
      setIsColorConfirmed(false);
      setFormError('');
      setSelectedClassroomCourseId('');
    }
  }, [isCreateModalOpen]);

  useEffect(() => {
    if (!isDeleteModalOpen) {
      setGroupToDelete(null);
      setDeleteConfirmationText('');
    }
  }, [isDeleteModalOpen]);

  useEffect(() => {
    if (!isEditModalOpen) {
      setGroupToEdit(null);
      setNewColorForEdit('');
      setFormError('');
    }
  }, [isEditModalOpen]);

  const isGradeStepEnabled = !!selectedSubjectId;
  const isGroupLetterStepEnabled = isGradeStepEnabled && !!selectedGrade;
  const isColorStepEnabled = isGroupLetterStepEnabled && !!selectedGroupLetter;

  const existingGroupLetters = useMemo(() => {
    if (!isGroupLetterStepEnabled) return [];
    return groups
      .filter(g => g.subjectId === parseInt(selectedSubjectId) && g.grade === parseInt(selectedGrade))
      .map(g => g.name);
  }, [groups, selectedSubjectId, selectedGrade, isGroupLetterStepEnabled]);

  const isColorDuplicate = existingColors.has(selectedColor);
  const isCreateButtonEnabled = isColorStepEnabled && isColorConfirmed && !isColorDuplicate && !formError;

  const getGroupDisplayText = (group) => {
    if (!group) return '';
    const subjectName = subjectsMap[group.subjectId] || '...';
    return `${group.grade}${group.name} - ${subjectName}`;
  };

  const generateGroupUrl = (group) => {
    const slug = slugify(getGroupDisplayText(group), { lower: true, strict: true });
    return `/workspace/${slug}_working`;
  };

  const handleCreateGroup = async () => {
    setFormError('');
    try {
      await apiClient.createGroup({
        name: selectedGroupLetter,
        grade: parseInt(selectedGrade),
        subjectId: parseInt(selectedSubjectId),
        classroomCourseId: selectedClassroomCourseId || null,
        color: selectedColor
      });
      setIsCreateModalOpen(false);
      onUpdate();
    } catch (err) {
      setFormError(err.message || "Failed to create group. It may already exist.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!groupToDelete) return;
    try {
      await apiClient.deleteGroup(groupToDelete.id);
      setIsDeleteModalOpen(false);
      onUpdate();
    } catch (err) {
      console.error("Failed to delete group", err);
    }
  };
  
  const handleUpdateGroup = async () => {
    if (!groupToEdit) return;
    setFormError('');
    try {
      await apiClient.updateGroup(groupToEdit.id, { color: newColorForEdit });
      setIsEditModalOpen(false);
      onUpdate();
    } catch (err) {
      setFormError(err.message || "Failed to update color.");
    }
  };

  const openDeleteModal = (group) => {
    setGroupToDelete(group);
    setIsDeleteModalOpen(true);
  };
  
  const openEditModal = (group) => {
    setGroupToEdit(group);
    setNewColorForEdit(group.color);
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleChipClick = (group) => {
    if (isEditMode) openEditModal(group);
    else if (isDeleteMode) openDeleteModal(group);
  };

  const toggleMode = (mode) => {
    const wasOn = { edit: isEditMode, delete: isDeleteMode, schedule: isSchedulingMode };
    setIsEditMode(false);
    setIsDeleteMode(false);
    setIsSchedulingMode(false);

    if (mode === 'edit' && !wasOn.edit) setIsEditMode(true);
    if (mode === 'delete' && !wasOn.delete) setIsDeleteMode(true);
    if (mode === 'schedule' && !wasOn.schedule) setIsSchedulingMode(true);
  };

  const handleDragStart = (e, group) => {
    e.dataTransfer.setData("groupId", group.id);
  };

  const previewText = useMemo(() => {
    if (!isColorStepEnabled) return '...';
    const subjectName = subjectsMap[selectedSubjectId] || '...';
    return `${selectedGrade}${selectedGroupLetter} - ${subjectName}`;
  }, [selectedSubjectId, selectedGrade, selectedGroupLetter, subjectsMap, isColorStepEnabled]);

  return (
    <>
      <div className="workspace-card-header">
        <div className="header-left">
          <FaUsers />
          <h3>{t('workspace.groups.title')}</h3>
        </div>
        <div className="header-actions">
          <button className={`action-button ${isEditMode ? 'active' : ''}`} title={t('workspace.groups.editTitle')} onClick={() => toggleMode('edit')}>
            <FaPencilAlt />
          </button>
          <button className={`action-button ${isDeleteMode ? 'active danger-button' : ''}`} title={t('workspace.groups.deleteTitle')} onClick={() => toggleMode('delete')}>
            <FaTrash />
          </button>
          <button className={`action-button ${isSchedulingMode ? 'active' : ''}`} title={t('workspace.groups.scheduleTitle')} onClick={() => toggleMode('schedule')}>
            <FaCalendarAlt />
          </button>
          <button className="add-button" onClick={() => setIsCreateModalOpen(true)}>
            <FaPlus />
          </button>
        </div>
      </div>

      <div className={`items-container ${isDeleteMode ? 'deleting' : ''} ${isEditMode ? 'editing' : ''}`}>
        {groups.map(group => {
          const displayText = getGroupDisplayText(group);
          if (isEditMode || isDeleteMode) {
            return (
              <button key={group.id} className="item-chip" style={{ backgroundColor: group.color }} onClick={() => handleChipClick(group)}>
                {displayText}
              </button>
            );
          }
          if (isSchedulingMode) {
            return (
              <div key={group.id} className="item-chip draggable" style={{ backgroundColor: group.color }} draggable="true" onDragStart={(e) => handleDragStart(e, group)}>
                {displayText}
              </div>
            );
          }
          return (
            <Link to={generateGroupUrl(group)} key={group.id} className="item-chip" style={{ backgroundColor: group.color, textDecoration: 'none' }}>
              {displayText}
            </Link>
          );
        })}
      </div>

      <Modal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        title={t('workspace.groups.createModal.title')}
        footer={
          <button className="primary-button" onClick={handleCreateGroup} disabled={!isCreateButtonEnabled}>
            {t('workspace.groups.createModal.createButton')}
          </button>
        }
      >
        <div className="modal-form">
          {formError && <p className="form-error">{formError}</p>}
          <div className="modal-step">
            <label>{t('workspace.groups.createModal.step1Label')}</label>
            <select className="form-input" value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)}>
              <option value="">{t('workspace.groups.createModal.step1Placeholder')}</option>
              {subjects.map(subject => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
            </select>
          </div>
          <div className="modal-step" style={{ opacity: isGradeStepEnabled ? 1 : 0.5 }}>
            <label>{t('workspace.groups.createModal.step2Label')}</label>
            <div className="label-group">
              {GRADES.map(grade => (
                <button key={grade} disabled={!isGradeStepEnabled} className={`label-button ${selectedGrade === grade ? 'selected' : ''}`} onClick={() => setSelectedGrade(grade)}>{grade}</button>
              ))}
            </div>
          </div>
          <div className="modal-step" style={{ opacity: isGroupLetterStepEnabled ? 1 : 0.5 }}>
            <label>{t('workspace.groups.createModal.step3Label')}</label>
            <div className="label-group">
              {GROUP_LETTERS.map(letter => (
                <button key={letter} disabled={!isGroupLetterStepEnabled || existingGroupLetters.includes(letter)} className={`label-button ${selectedGroupLetter === letter ? 'selected' : ''}`} onClick={() => setSelectedGroupLetter(letter)}>{letter}</button>
              ))}
            </div>
          </div>
          <div className="modal-step" style={{ opacity: isColorStepEnabled ? 1 : 0.5 }}>
            <label>{t('workspace.groups.createModal.step4Label')}</label>
            <select
              className="form-input"
              value={selectedClassroomCourseId}
              onChange={(e) => setSelectedClassroomCourseId(e.target.value)}
              disabled={!isColorStepEnabled}
            >
              <option value=""></option>
              {classroomCourses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
          <div className="modal-step" style={{ opacity: isColorStepEnabled ? 1 : 0.5 }}>
            <label>{t('workspace.groups.createModal.step5Label')}</label>
            <div className="color-picker-wrapper">
              <input type="color" value={selectedColor} disabled={!isColorStepEnabled} onChange={(e) => setSelectedColor(e.target.value)} className="color-input"/>
              {isColorDuplicate && <span className="form-error">{t('workspace.groups.createModal.colorInUseError')}</span>}
            </div>
          </div>
          {isColorStepEnabled && (
            <div className="preview-chip-container">
              <label>{t('workspace.common.preview')}</label>
              <div className="item-chip" style={{ backgroundColor: selectedColor }}>{previewText}</div>
              <div>
                <input type="checkbox" id="colorConfirm" checked={isColorConfirmed} onChange={(e) => setIsColorConfirmed(e.target.checked)} />
                <label htmlFor="colorConfirm" style={{ marginLeft: '8px' }}>{t('workspace.groups.createModal.confirmColor')}</label>
              </div>
            </div>
          )}
        </div>
      </Modal>

      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        title={t('workspace.groups.deleteModal.title')}
        footer={
          <button
            className="primary-button danger-button"
            onClick={handleConfirmDelete}
            disabled={deleteConfirmationText !== getGroupDisplayText(groupToDelete)}
          >
            {t('workspace.groups.deleteModal.deleteButton')}
          </button>
        }
      >
        <div className="modal-form">
          <p className="delete-modal-text" dangerouslySetInnerHTML={{ __html: t('workspace.groups.deleteModal.confirmationText', { name: getGroupDisplayText(groupToDelete) }) }} />
          <p>{t('workspace.common.typeFullToConfirm')}</p>
          <input
            type="text"
            className="form-input"
            value={deleteConfirmationText}
            onChange={(e) => setDeleteConfirmationText(e.target.value)}
            placeholder={getGroupDisplayText(groupToDelete)}
          />
        </div>
      </Modal>

      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        title={t('workspace.groups.editModal.title', { name: getGroupDisplayText(groupToEdit) })}
        footer={
          <button className="primary-button" onClick={handleUpdateGroup}>
            {t('workspace.common.saveChanges')}
          </button>
        }
      >
        <div className="modal-form">
          {formError && <p className="form-error">{formError}</p>}
          <div className="modal-step">
            <label>{t('workspace.groups.editModal.colorLabel')}</label>
            <div className="color-picker-wrapper">
              <input type="color" value={newColorForEdit} onChange={(e) => setNewColorForEdit(e.target.value)} className="color-input"/>
            </div>
          </div>
          <div className="preview-chip-container">
            <label>{t('workspace.common.preview')}</label>
            <div className="item-chip" style={{ backgroundColor: newColorForEdit }}>
              {getGroupDisplayText(groupToEdit)}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default GroupsCard;