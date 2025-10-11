import React from 'react';
import Modal from '../../common/Modal';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import './ViewAssignmentsModal.css';

const ViewAssignmentsModal = ({ isOpen, onClose, category, assignments = [], onEdit, onDelete }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${category} Assignments`}>
      <div className="vam-container">
        {assignments.length > 0 ? (
          <ul className="vam-list">
            {assignments.map(asg => (
              <li key={asg.id} className="vam-list-item">
                <span>{asg.name}</span>
                <div className="vam-actions">
                  {asg.classroomAsgId && <span className="vam-linked-badge">Linked</span>}
                  <button onClick={() => onEdit(asg)} className="vam-action-btn edit" title="Edit"><FaPencilAlt /></button>
                  <button onClick={() => onDelete(asg)} className="vam-action-btn delete" title="Delete"><FaTrash /></button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="vam-empty-message">No assignments have been created for this category yet.</p>
        )}
      </div>
    </Modal>
  );
};

export default ViewAssignmentsModal;