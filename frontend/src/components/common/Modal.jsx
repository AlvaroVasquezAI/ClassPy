import React from 'react';
import { IoClose } from 'react-icons/io5';
import './Modal.css';

const Modal = ({ isOpen, onClose, title, children, footer, contentClassName = '' }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className={`modal-content${contentClassName ? ` ${contentClassName}` : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button onClick={onClose} className="modal-close-button" type="button" aria-label="Close">
            <IoClose />
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
