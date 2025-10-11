import React, { useState } from 'react';
import Modal from '../../common/Modal';

const DeleteAssignmentModal = ({ isOpen, onClose, assignment, onConfirm }) => {
  const [confirmationText, setConfirmationText] = useState('');
  if (!assignment) return null;

  const isConfirmed = confirmationText === assignment.name;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Delete "${assignment.name}"?`}>
      <div className="modal-form">
        <p>This action cannot be undone. All grades associated with this assignment will be permanently deleted.</p>
        <p>Please type <strong>{assignment.name}</strong> to confirm.</p>
        <input
          type="text"
          className="form-input"
          value={confirmationText}
          onChange={(e) => setConfirmationText(e.target.value)}
        />
        <button
          className="primary-button danger-button"
          onClick={onConfirm}
          disabled={!isConfirmed}
        >
          Permanently Delete
        </button>
      </div>
    </Modal>
  );
};

export default DeleteAssignmentModal;