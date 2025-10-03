import React, { useState, useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import Modal from '../../common/Modal';
import { apiClient } from '../../../services/apiClient';
import './TopicsCard.css';

const TopicsCard = ({ topics, selectedTopicId, setSelectedTopicId, periodId, subjectId, onTopicUpdate }) => {
  const { t } = useTranslation(); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [topicToEdit, setTopicToEdit] = useState(null);
  const [topicToDelete, setTopicToDelete] = useState(null);
  const [formError, setFormError] = useState('');

  const initialFormData = {
    name: '',
    notebookWeight: 25,
    practiceWeight: 25,
    examWeight: 25,
    otherWeight: 25,
  };
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (topicToEdit) {
      setFormData({
        name: topicToEdit.name,
        notebookWeight: topicToEdit.notebookWeight,
        practiceWeight: topicToEdit.practiceWeight,
        examWeight: topicToEdit.examWeight,
        otherWeight: topicToEdit.otherWeight,
      });
    } else {
      setFormData(initialFormData);
    }
  }, [topicToEdit]);
  
  const handleOpenCreateModal = () => {
    setTopicToEdit(null);
    setFormData(initialFormData);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (topic) => {
    setTopicToEdit(topic);
    setFormError('');
    setIsModalOpen(true);
  };
  
  const handleOpenDeleteModal = (topic) => {
    setTopicToDelete(topic);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
    setTopicToEdit(null);
    setTopicToDelete(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) || value }));
  };

  const handleSubmit = async () => {
    setFormError('');
    const totalWeight = formData.notebookWeight + formData.practiceWeight + formData.examWeight + formData.otherWeight;
    if (Math.round(totalWeight) !== 100) {
      setFormError('The sum of all weights must be exactly 100.');
      return;
    }

    try {
      if (topicToEdit) {
        await apiClient.updateTopic(topicToEdit.id, formData);
      } else {
        const submissionData = { ...formData, periodId, subjectId };
        await apiClient.createTopic(submissionData);
      }
      onTopicUpdate(); 
      handleCloseModals();
    } catch (err) {
      setFormError(err.message || 'An unexpected error occurred.');
    }
  };
  
  const handleDelete = async () => {
    if (!topicToDelete) return;
    try {
        await apiClient.deleteTopic(topicToDelete.id);
        onTopicUpdate();
        handleCloseModals();
    } catch (err) {
        setFormError(err.message);
    }
  };

  return (
    <>
      <div className="gw-tc-header">
        <h3>{t('groupWorkspace.topicsCard.title')}</h3>
        <div className="gw-tc-actions">
          <button className="gw-tc-action-btn" onClick={() => selectedTopicId && handleOpenEditModal(topics.find(t => t.id === selectedTopicId))} disabled={!selectedTopicId}><FaEdit /></button>
          <button className="gw-tc-action-btn" onClick={() => selectedTopicId && handleOpenDeleteModal(topics.find(t => t.id === selectedTopicId))} disabled={!selectedTopicId}><FaTrash /></button>
          <button className="gw-tc-action-btn add" onClick={handleOpenCreateModal}><FaPlus /></button>
        </div>
      </div>
      <div className="gw-tc-list">
        {topics.map(topic => (
          <button
            key={topic.id}
            className={`gw-tc-chip ${topic.id === selectedTopicId ? 'active' : ''}`}
            onClick={() => setSelectedTopicId(topic.id)}
          >
            {topic.name}
          </button>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModals} title={topicToEdit ? t('groupWorkspace.topicsCard.editModalTitle') : t('groupWorkspace.topicsCard.createModalTitle')}>
        <div className="gw-tc-modal-form">
          {formError && <p className="form-error">{formError}</p>}
          <label>{t('groupWorkspace.topicsCard.form.nameLabel')}</label>
          <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="form-input" />
          
          <label>{t('groupWorkspace.topicsCard.form.weightsLabel')}</label>
          <div className="gw-tc-form-grid">
            <span>{t('groupWorkspace.topicsCard.form.notebook')}</span><input type="number" name="notebookWeight" value={formData.notebookWeight} onChange={handleInputChange} className="form-input" />
            <span>{t('groupWorkspace.topicsCard.form.practices')}</span><input type="number" name="practiceWeight" value={formData.practiceWeight} onChange={handleInputChange} className="form-input" />
            <span>{t('groupWorkspace.topicsCard.form.exam')}</span><input type="number" name="examWeight" value={formData.examWeight} onChange={handleInputChange} className="form-input" />
            <span>{t('groupWorkspace.topicsCard.form.others')}</span><input type="number" name="otherWeight" value={formData.otherWeight} onChange={handleInputChange} className="form-input" />
          </div>
          <button className="primary-button" onClick={handleSubmit}>
            {topicToEdit ? t('groupWorkspace.topicsCard.saveButton') : t('groupWorkspace.topicsCard.createButton')}
          </button>
        </div>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={handleCloseModals} title={t('groupWorkspace.topicsCard.deleteModalTitle')}>
        <div className="modal-form">
            <p>
              <Trans i18nKey="groupWorkspace.topicsCard.deleteConfirmation" values={{ name: topicToDelete?.name }}>
                Are you sure you want to permanently delete the topic "<strong>{{name}}</strong>"? All related assignments and grades will also be deleted.
              </Trans>
            </p>
            <button className="primary-button danger-button" onClick={handleDelete}>{t('groupWorkspace.topicsCard.deleteButton')}</button>
        </div>
      </Modal>
    </>
  );
};

export default TopicsCard;