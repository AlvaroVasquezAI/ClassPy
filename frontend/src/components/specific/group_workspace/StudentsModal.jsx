import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; 
import { FaTrash, FaPlus, FaEdit, FaChevronDown, FaTimes, FaUserGraduate } from 'react-icons/fa';
import Modal from '../../common/Modal';
import { apiClient } from '../../../services/apiClient';
import DownloadMenu from './DownloadMenu';
import './StudentsModal.css';

const initialFormState = {
  firstName: '',
  lastName: '',
  contactNumber: '',
  status: 'active',
};

const StudentsModal = ({ isOpen, onClose, students, currentGroup, currentSubject, onUpdate, onShowQrCode }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState('');
  const [studentToEdit, setStudentToEdit] = useState(null);
  const [expandedStudentId, setExpandedStudentId] = useState(null);

  useEffect(() => {
    if (studentToEdit) {
      setFormData({
        firstName: studentToEdit.firstName,
        lastName: studentToEdit.lastName,
        contactNumber: studentToEdit.contactNumber || '',
        status: studentToEdit.status,
      });
    } else {
      setFormData(initialFormState);
    }
  }, [studentToEdit, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCancelEdit = () => {
    setStudentToEdit(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.firstName || !formData.lastName) {
      setError(t('groupWorkspace.studentsModal.errors.nameRequired'));
      return;
    }
    try {
      if (studentToEdit) {
        await apiClient.updateStudent(studentToEdit.id, formData);
      } else {
        const newStudentData = { ...formData, groupId: currentGroup.id };
        await apiClient.createStudent(newStudentData);
      }
      onUpdate();
      setStudentToEdit(null);
      setFormData(initialFormState);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm(t('groupWorkspace.studentsModal.alerts.confirmDelete'))) {
      try {
        await apiClient.deleteStudent(studentId);
        onUpdate();
      } catch (err) {
        alert(t('groupWorkspace.studentsModal.alerts.deleteFailed'));
      }
    }
  };

  const toggleDetails = (studentId) => {
    setExpandedStudentId(prevId => (prevId === studentId ? null : studentId));
  };

  const getStatusClass = (status) => {
    if (status === 'inactive') return 'status-inactive';
    if (status === 'transferred') return 'status-transferred';
    return '';
  };

  const modalTitle = t('groupWorkspace.studentsModal.title', { groupName: `${currentGroup.grade}${currentGroup.name}` });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      <div className="gw-sm-container">
        <div className="gw-sm-list-section">
          <h4>
            <div className="gw-sm-header-left">
                <span className="gw-sm-student-count">{students.length}</span>
                <span>{t('groupWorkspace.studentsModal.listTitle')}</span>
            </div>
            <DownloadMenu students={students} currentGroup={currentGroup} currentSubject={currentSubject} />
          </h4>
          <div className="gw-sm-list">
            {students.map(student => (
              <div key={student.id} className="gw-sm-student-wrapper">
                <div className="gw-sm-student-item">
                  <div className={`gw-sm-student-name ${getStatusClass(student.status)}`}>
                    <FaUserGraduate />
                    <span>
                      {student.lastName} <strong>{student.firstName}</strong>
                    </span>
                  </div>
                  <div className="gw-sm-student-actions">
                    <button onClick={() => setStudentToEdit(student)} className="gw-sm-action-btn" title={t('groupWorkspace.studentsModal.tooltips.edit')}><FaEdit /></button>
                    <button onClick={() => handleDeleteStudent(student.id)} className="gw-sm-action-btn danger" title={t('groupWorkspace.studentsModal.tooltips.delete')}><FaTrash /></button>
                    <button onClick={() => toggleDetails(student.id)} className={`gw-sm-action-btn expand ${expandedStudentId === student.id ? 'active' : ''}`} title={t('groupWorkspace.studentsModal.tooltips.details')}><FaChevronDown /></button>
                  </div>
                </div>
                {expandedStudentId === student.id && (
                  <div className="gw-sm-student-details">
                    <div className="gw-sm-qr-preview">
                      <img 
                        src={`${window.location.protocol}//${window.location.hostname}:8000/api/qr-code/${student.qrCodeId}.png`}
                        alt="QR Code Preview"
                        onClick={() => onShowQrCode(student)}
                      />
                    </div>
                    <div className="gw-sm-details-text">
                      <div><strong>{t('groupWorkspace.studentsModal.details.qrId')}:</strong> <span>{student.qrCodeId || 'N/A'}</span></div>
                      <div><strong>{t('groupWorkspace.studentsModal.details.contact')}:</strong> <span>{student.contactNumber || 'N/A'}</span></div>
                      <div><strong>{t('groupWorkspace.studentsModal.details.status')}:</strong> <span className={getStatusClass(student.status)}>{t(`groupWorkspace.studentsModal.status.${student.status}`)}</span></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="gw-sm-form-section">
          <h4>
            {studentToEdit ? <><FaEdit /> {t('groupWorkspace.studentsModal.form.editTitle')}</> : <><FaPlus /> {t('groupWorkspace.studentsModal.form.addTitle')}</>}
            {studentToEdit && <button onClick={handleCancelEdit} className="gw-sm-cancel-edit-btn" title={t('groupWorkspace.studentsModal.tooltips.cancelEdit')}><FaTimes /></button>}
          </h4>
          <form onSubmit={handleSubmit} className="gw-sm-form">
            {error && <p className="form-error">{error}</p>}
            <div className="gw-sm-form-group">
              <label htmlFor="firstName">{t('groupWorkspace.studentsModal.form.firstNameLabel')}</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="form-input" required />
            </div>
            <div className="gw-sm-form-group">
              <label htmlFor="lastName">{t('groupWorkspace.studentsModal.form.lastNameLabel')}</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="form-input" required />
            </div>
            <div className="gw-sm-form-group">
              <label htmlFor="contactNumber">{t('groupWorkspace.studentsModal.form.contactLabel')}</label>
              <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} className="form-input" />
            </div>
            <div className="gw-sm-form-group">
                <label htmlFor="status">{t('groupWorkspace.studentsModal.form.statusLabel')}</label>
                <select 
                    name="status" 
                    value={formData.status} 
                    onChange={handleInputChange} 
                    className="form-input"
                    disabled={!studentToEdit}
                >
                    <option value="active">{t('groupWorkspace.studentsModal.status.active')}</option>
                    <option value="inactive">{t('groupWorkspace.studentsModal.status.inactive')}</option>
                    <option value="transferred">{t('groupWorkspace.studentsModal.status.transferred')}</option>
                </select>
            </div>
            <button type="submit" className="primary-button">{studentToEdit ? t('groupWorkspace.studentsModal.form.saveButton') : t('groupWorkspace.studentsModal.form.addButton')}</button>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export default StudentsModal;