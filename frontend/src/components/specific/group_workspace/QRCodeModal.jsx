import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaDownload } from 'react-icons/fa';
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      contentClassName="modal-content--qr"
    >
      <div className="gw-qrm">
        <div className="gw-qrm-stage">
          <div className="gw-qrm-frame">
            <img src={qrCodeUrl} alt={imageAltText} className="gw-qrm-image" />
          </div>
        </div>

        <div className="gw-qrm-meta">
          <span className="gw-qrm-label">{t('groupWorkspace.qrCodeModal.idLabel')}</span>
          <p className="gw-qrm-textid">{student.qrCodeId}</p>
        </div>

        <a
          href={qrCodeUrl}
          download={`${student.qrCodeId}.png`}
          className="gw-qrm-download"
        >
          <FaDownload aria-hidden="true" />
          <span>{t('groupWorkspace.qrCodeModal.downloadButton')}</span>
        </a>
      </div>
    </Modal>
  );
};

export default QRCodeModal;
