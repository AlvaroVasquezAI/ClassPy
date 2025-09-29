import React, { useState, useEffect } from 'react';
import { FaPlus, FaPencilAlt, FaTrash, FaLayerGroup } from 'react-icons/fa';
import Modal from '../../common/Modal';
import { apiClient } from '../../../services/apiClient';
import './Workspace.css';

const SubjectsCard = ({ subjects, groups, onUpdate }) => {
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

  return (
    <>
      <div className="workspace-card-header">
        <div className="header-left">
          <FaLayerGroup />
          <h3>Subjects</h3>
        </div>
        <div className="header-actions">
          <button className={`action-button ${isEditMode ? 'active' : ''}`} title="Edit Subject" onClick={() => toggleMode('edit')}><FaPencilAlt /></button>
          <button className={`action-button ${isDeleteMode ? 'active danger-button' : ''}`} title="Delete Subject" onClick={() => toggleMode('delete')}><FaTrash /></button>
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

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Subject">
        <div className="modal-form">
          {formError && <p className="form-error">{formError}</p>}
          <input
            type="text"
            className="form-input"
            placeholder="Subject Name (e.g., Biology)"
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value.toUpperCase())}
          />
          <div className="modal-step" style={{marginTop: '1rem'}}>
            <label>Select Subject Color</label>
            <div className="color-picker-wrapper">
              <input type="color" value={newSubjectColor} onChange={(e) => setNewSubjectColor(e.target.value)} className="color-input"/>
            </div>
          </div>

          {newSubjectName && (
            <div className="preview-chip-container">
              <label>Preview</label>
              <div className="item-chip" style={{ backgroundColor: newSubjectColor }}>
                <span>{newSubjectName}</span>
              </div>
            </div>
          )}
          <button className="primary-button" onClick={handleCreateSubject}>Create Subject</button>
        </div>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Subject">
        <div className="modal-form">
          {formError && <p className="form-error">{formError}</p>}
          <div className="modal-step">
            <label>Subject Name</label>
            <input type="text" className="form-input" value={editSubjectName} onChange={(e) => setEditSubjectName(e.target.value.toUpperCase())} />
          </div>
          <div className="modal-step">
            <label>Subject Color</label>
            <div className="color-picker-wrapper">
              <input type="color" value={editSubjectColor} onChange={(e) => setEditSubjectColor(e.target.value)} className="color-input" />
            </div>
          </div>

          {editSubjectName && (
            <div className="preview-chip-container">
              <label>Preview</label>
              <div className="item-chip" style={{ backgroundColor: editSubjectColor }}>
                <span>{editSubjectName}</span>
              </div>
            </div>
          )}
          <button className="primary-button" onClick={handleUpdateSubject}>Save Changes</button>
        </div>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Subject">
        <div className="modal-form">
          <p className="delete-modal-text">
            This will permanently delete the <strong>{subjectToDelete?.name}</strong> subject and ALL of its associated groups, students, and grades. This action cannot be undone.
          </p>
          <p>Please type the subject name to confirm.</p>
          <input type="text" className="form-input" value={deleteConfirmationText} onChange={(e) => setDeleteConfirmationText(e.target.value)} placeholder={subjectToDelete?.name} />
          <button className="primary-button danger-button" onClick={handleConfirmDelete} disabled={deleteConfirmationText !== subjectToDelete?.name}>
            Delete this subject
          </button>
        </div>
      </Modal>

      <Modal isOpen={isViewGroupsModalOpen} onClose={() => setIsViewGroupsModalOpen(false)} title={`Groups in ${subjectToView?.name}`}>
        <div className="view-groups-modal-body">
          {groups.filter(g => g.subjectId === subjectToView?.id).map(group => (
            <div key={group.id} className="item-chip" style={{ backgroundColor: group.color }}>
              {group.grade}{group.name} - {subjectToView?.name}
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
};

export default SubjectsCard;