import React, { useState, useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import Modal from '../../common/Modal';

const DeleteAssignmentModal = ({ isOpen, onClose, assignment, onConfirm }) => {
  const { t } = useTranslation();
  const [confirmationText, setConfirmationText] = useState('');

  useEffect(() => {
    if (isOpen) {
      setConfirmationText('');
    }
  }, [isOpen]);

  if (!isOpen || !assignment) {
    return null;
  }

  const isConfirmed = confirmationText === assignment.name;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={t('groupWorkspace.deleteModal.title', { assignmentName: assignment.name })}
    >
      <div className="modal-form">
        <p>{t('groupWorkspace.deleteModal.text1')}</p>
        
        <p>
          <Trans i18nKey="groupWorkspace.deleteModal.text2"
            values={{ assignmentName: assignment.name }}
            components={[<strong />]}
          />
        </p>

        <input
          type="text"
          className="form-input"
          value={confirmationText}
          onChange={(e) => setConfirmationText(e.target.value)}
          placeholder={assignment.name}
          autoFocus
        />

        <button
          className="primary-button danger-button"
          onClick={onConfirm}
          disabled={!isConfirmed}
        >
          {t('groupWorkspace.deleteModal.button')}
        </button>
      </div>
    </Modal>
  );
};

export default DeleteAssignmentModal;