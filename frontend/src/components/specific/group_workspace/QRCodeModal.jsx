import React from 'react';
import Modal from '../../common/Modal';
import './QRCodeModal.css';

const API_HOST = window.location.hostname;
const API_BASE_URL = `http://${API_HOST}:8000`;

const QRCodeModal = ({ isOpen, onClose, student }) => {
  if (!isOpen || !student) return null;

  const qrCodeUrl = `${API_BASE_URL}/api/qr-code/${student.qrCodeId}.png`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`QR Code for ${student.firstName} ${student.lastName}`}>
      <div className="gw-qrm-container">
        <img src={qrCodeUrl} alt={`QR Code for ${student.firstName}`} className="gw-qrm-image" />
        <p className="gw-qrm-textid">{student.qrCodeId}</p>
        <a href={qrCodeUrl} download={`${student.qrCodeId}.png`} className="primary-button">
          Download PNG
        </a>
      </div>
    </Modal>
  );
};

export default QRCodeModal;