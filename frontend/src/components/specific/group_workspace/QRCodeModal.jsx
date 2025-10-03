import React from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../../common/Modal';
import './QRCodeModal.css';

const API_HOST = window.location.hostname;
const API_BASE_URL = `http://${API_HOST}:8000`;

const QRCodeModal = ({ isOpen, onClose, student }) => {
  const { t } = useTranslation(); 

  if (!isOpen || !student) return null;

  const qrCodeUrl = `${API_BASE_URL}/api/qr-code/${student.qrCodeId}.png`;
  const studentName = `${student.firstName} ${student.lastName}`;

  const modalTitle = t('groupWorkspace.qrCodeModal.title', { studentName });
  const imageAltText = t('groupWorkspace.qrCodeModal.alt', { studentName });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      <div className="gw-qrm-container">
        <img src={qrCodeUrl} alt={imageAltText} className="gw-qrm-image" />
        <p className="gw-qrm-textid">{student.qrCodeId}</p>
        <a href={qrCodeUrl} download={`${student.qrCodeId}.png`} className="primary-button">
          {t('groupWorkspace.qrCodeModal.downloadButton')}
        </a>
      </div>
    </Modal>
  );
};

export default QRCodeModal;