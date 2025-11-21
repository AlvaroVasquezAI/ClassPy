import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import slugify from 'slugify';
import { FaPlus, FaPencilAlt, FaTrash, FaLayerGroup } from 'react-icons/fa';
import Modal from '../../common/Modal';
import { apiClient } from '../../../services/apiClient';
import './Workspace.css';

const SubjectsCard = ({ subjects, groups, onUpdate }) => {
  const { t } = useTranslation()
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewGroupsModalOpen, setIsViewGroupsModalOpen] = useState(false);

  const [subjectToEdit, setSubjectToEdit] = useState(null);
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [subjectToView, setSubjectToView] = useState(null);

  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectColor, setNewSubjectColor] = useState('#749280');
  const [editSubjectName, setEditSubjectName] = useState('');
  const [editSubjectColor, setEditSubjectColor] = useState('');
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [formError, setFormError] = useState('');

  const getGroupDisplayText = (group) => {
    if (!group) return '';
    const subjectName = subjects.find(s => s.id === group.subjectId)?.name || '...';
    return `${group.grade}${group.name} - ${subjectName}`;
  };

  const generateGroupUrl = (group) => {
    const slug = slugify(getGroupDisplayText(group), { lower: true, strict: true });
    return `/workspace/${slug}_working`;
  };

  useEffect(() => {
    if (!isCreateModalOpen) {
      setNewSubjectName('');
      setNewSubjectColor('#749280');
      setFormError('');
    }
  }, [isCreateModalOpen]);

  useEffect(() => {
    if (!isEditModalOpen) {
      setSubjectToEdit(null);
      setFormError('');
    }
  }, [isEditModalOpen]);

  useEffect(() => {
    if (!isDeleteModalOpen) {
      setSubjectToDelete(null);
      setDeleteConfirmationText(''); 
    }
  }, [isDeleteModalOpen]);
  
  useEffect(() => {
    if (!isViewGroupsModalOpen) {
      setSubjectToView(null);
    }
  }, [isViewGroupsModalOpen]);

  const handleCreateSubject = async () => {
    if (!newSubjectName.trim()) return;
    setFormError('');
    try {
      await apiClient.createSubject({ name: newSubjectName, color: newSubjectColor });
      setIsCreateModalOpen(false);
      onUpdate();
    } catch (err) {
      setFormError(err.message || "Failed to create subject.");
    }
  };
  
  const handleUpdateSubject = async () => {
    if (!subjectToEdit || !editSubjectName.trim()) return;
    setFormError('');
    try {
      await apiClient.updateSubject(subjectToEdit.id, { name: editSubjectName, color: editSubjectColor });
      setIsEditModalOpen(false);
      onUpdate();
    } catch (err) {
      setFormError(err.message || "Failed to update subject.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!subjectToDelete) return;
    try {
      await apiClient.deleteSubject(subjectToDelete.id);
      setIsDeleteModalOpen(false);
      onUpdate();
    } catch (error) {
      console.error("Failed to delete subject", error);
    }
  };

  const openEditModal = (subject) => {
    setSubjectToEdit(subject);
    setEditSubjectName(subject.name);
    setEditSubjectColor(subject.color);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (subject) => {
    setSubjectToDelete(subject);
    setDeleteConfirmationText('');
    setIsDeleteModalOpen(true);
  };

  const openViewGroupsModal = (subject) => {
    setSubjectToView(subject);
    setIsViewGroupsModalOpen(true);
  };

  const handleChipClick = (subject) => {
    if (isEditMode) {
      openEditModal(subject);
    } else if (isDeleteMode) {
      openDeleteModal(subject);
    } else {
      openViewGroupsModal(subject);
    }
  };

  const handleKeyDown = (event, subject) => {
    if (event.key === 'Enter' || event.key === ' ') {
      handleChipClick(subject);
    }
  };
  
  const toggleMode = (mode) => {
    const turnOffAllModes = () => {
      setIsEditMode(false);
      setIsDeleteMode(false);
    };

    if (mode === 'edit') {
      const wasOn = isEditMode;
      turnOffAllModes();
      setIsEditMode(!wasOn);
    } else if (mode === 'delete') {
      const wasOn = isDeleteMode;
      turnOffAllModes();
      setIsDeleteMode(!wasOn);
    }
  };

  const normalizeSubjectName = (name) => {
  if (!name || typeof name !== 'string') return '';
  return name
    .normalize("NFD") 
    .replace(/[\u0300-\u036f]/g, "") 
    .toUpperCase(); 
};

  return (
    <>
      <div className="workspace-card-header">
        <div className="header-left">
          <FaLayerGroup />
          <h3>{t('workspace.subjects.title')}</h3>
        </div>
        <div className="header-actions">
          <button className={`action-button ${isEditMode ? 'active' : ''}`} title={t('workspace.subjects.editTitle')} onClick={() => toggleMode('edit')}><FaPencilAlt /></button>
          <button className={`action-button ${isDeleteMode ? 'active danger-button' : ''}`} title={t('workspace.subjects.deleteTitle')} onClick={() => toggleMode('delete')}><FaTrash /></button>
          <button className="add-button" onClick={() => setIsCreateModalOpen(true)}><FaPlus /></button>
        </div>
      </div>

      <div className={`items-container ${isDeleteMode ? 'deleting' : ''} ${isEditMode ? 'editing' : ''}`}>
        {subjects.map(subject => {
          const subjectGroups = groups.filter(g => g.subjectId === subject.id);
          return (
            <div
              key={subject.id}
              className="item-chip"
              style={{ backgroundColor: subject.color, cursor: 'pointer' }}
              onClick={() => handleChipClick(subject)}
              onKeyDown={(e) => handleKeyDown(e, subject)}
              role="button"
              tabIndex="0"
            >
              <span>{subject.name}</span>
              {subjectGroups.length > 0 && (
                <div className="sub-group-container">
                  {subjectGroups.map(g => (
                    <div key={g.id} className="sub-group-chip" style={{ backgroundColor: g.color }}>
                      {g.grade}{g.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Modal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        title={t('workspace.subjects.createModal.title')}
        footer={
          <button className="primary-button" onClick={handleCreateSubject}>
            {t('workspace.subjects.createModal.createButton')}
          </button>
        }
      >
        <div className="modal-form">
          {formError && <p className="form-error">{formError}</p>}
          <input
            type="text"
            className="form-input"
            placeholder={t('workspace.subjects.createModal.placeholder')}
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(normalizeSubjectName(e.target.value))}
          />
          <div className="modal-step" style={{marginTop: '1rem'}}>
            <label>{t('workspace.subjects.createModal.colorLabel')}</label>
            <div className="color-picker-wrapper">
              <input type="color" value={newSubjectColor} onChange={(e) => setNewSubjectColor(e.target.value)} className="color-input"/>
            </div>
          </div>

          {newSubjectName && (
            <div className="preview-chip-container">
              <label>{t('workspace.common.preview')}</label>
              <div className="item-chip" style={{ backgroundColor: newSubjectColor }}>
                <span>{newSubjectName}</span>
              </div>
            </div>
          )}
        </div>
      </Modal>

      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        title={t('workspace.subjects.editModal.title')}
        footer={
          <button className="primary-button" onClick={handleUpdateSubject}>
            {t('workspace.common.saveChanges')}
          </button>
        }
      >
        <div className="modal-form">
          {formError && <p className="form-error">{formError}</p>}
          <div className="modal-step">
            <label>{t('workspace.subjects.editModal.nameLabel')}</label>
            <input type="text" className="form-input" value={editSubjectName} onChange={(e) => setEditSubjectName(normalizeSubjectName(e.target.value))} />
          </div>
          <div className="modal-step">
            <label>{t('workspace.subjects.editModal.colorLabel')}</label>
            <div className="color-picker-wrapper">
              <input type="color" value={editSubjectColor} onChange={(e) => setEditSubjectColor(e.target.value)} className="color-input" />
            </div>
          </div>

          {editSubjectName && (
            <div className="preview-chip-container">
              <label>{t('workspace.common.preview')}</label>
              <div className="item-chip" style={{ backgroundColor: editSubjectColor }}>
                <span>{editSubjectName}</span>
              </div>
            </div>
          )}
        </div>
      </Modal>

      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        title={t('workspace.subjects.deleteModal.title')}
        footer={
          <button 
            className="primary-button danger-button" 
            onClick={handleConfirmDelete} 
            disabled={deleteConfirmationText !== subjectToDelete?.name}
          >
            {t('workspace.subjects.deleteModal.deleteButton')}
          </button>
        }
      >
        <div className="modal-form">
          <p className="delete-modal-text" dangerouslySetInnerHTML={{ __html: t('workspace.subjects.deleteModal.confirmationText', { name: subjectToDelete?.name }) }} />
          <p>{t('workspace.common.typeToConfirm')}</p>
          <input 
            type="text" 
            className="form-input" 
            value={deleteConfirmationText} 
            onChange={(e) => setDeleteConfirmationText(e.target.value)} 
            placeholder={subjectToDelete?.name} 
          />
        </div>
      </Modal>

      <Modal isOpen={isViewGroupsModalOpen} onClose={() => setIsViewGroupsModalOpen(false)} title={t('workspace.subjects.viewGroupsModal.title', { subjectName: subjectToView?.name })}>
        <div className="view-groups-modal-body">
          {groups.filter(g => g.subjectId === subjectToView?.id).map(group => (
            <Link
              key={group.id}
              to={generateGroupUrl(group)}
              className="item-chip"
              style={{ backgroundColor: group.color, textDecoration: 'none' }}
              onClick={() => setIsViewGroupsModalOpen(false)}
            >
              {getGroupDisplayText(group)}
            </Link>
          ))}
        </div>
      </Modal>
    </>
  );
};

export default SubjectsCard;