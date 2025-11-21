import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaTrash, FaPlus, FaEdit, FaChevronDown, FaTimes, FaUserGraduate, FaChalkboardTeacher } from 'react-icons/fa';
import Modal from '../../common/Modal';
import { apiClient } from '../../../services/apiClient';
import DownloadMenu from './DownloadMenu';
import './StudentsModal.css';

const API_BASE_URL = `http://${window.location.hostname}:8000`;

const initialFormState = {
  firstName: '',
  lastName: '',
  contactNumber: '',
  status: 'active',
  classroomUserId: '',
};

const parseFullName = (fullName) => {
  if (!fullName || typeof fullName !== 'string') {
    return { firstName: '', lastName: '' };
  }
  const parts = fullName.trim().split(' ').filter(p => p);

  if (parts.length <= 1) {
    return { firstName: capitalizeName(parts[0] || ''), lastName: '' };
  }
  if (parts.length === 2) {
    return { firstName: capitalizeName(parts[0]), lastName: capitalizeName(parts[1]) };
  }
  const lastName = capitalizeName(parts.slice(-2).join(' '));
  const firstName = capitalizeName(parts.slice(0, -2).join(' '));
  return { firstName, lastName };
};

const StudentsModal = ({ isOpen, onClose, students, currentGroup, currentSubject, onUpdate, onShowQrCode }) => {
  const { t } = useTranslation();
  
  const [viewMode, setViewMode] = useState('list'); 

  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState('');
  const [studentToEdit, setStudentToEdit] = useState(null);
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  
  const [classroomRoster, setClassroomRoster] = useState([]);
  const [groupDetails, setGroupDetails] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setViewMode('list');
      setStudentToEdit(null);
      if (currentGroup) {
        apiClient.getGroupDetails(currentGroup.id).then(details => {
          setGroupDetails(details);
          if (details.classroomGroup) {
            apiClient.getClassroomRoster(details.classroomGroup.classroomCourseId)
              .then(setClassroomRoster)
              .catch(err => console.error("Failed to fetch roster", err));
          }
        });
      }
    }
  }, [isOpen, currentGroup]);

  useEffect(() => {
    if (studentToEdit) {
      setFormData({
        firstName: studentToEdit.firstName,
        lastName: studentToEdit.lastName,
        contactNumber: studentToEdit.contactNumber || '',
        status: studentToEdit.status,
        classroomUserId: studentToEdit.classroomUserId || '',
      });
    } else {
      setFormData(initialFormState);
    }
  }, [studentToEdit]);

  useEffect(() => {
    if (studentToEdit) return;
    if (formData.classroomUserId) {
      const selectedStudent = classroomRoster.find(s => s.userId === formData.classroomUserId);
      if (selectedStudent) {
        const { firstName, lastName } = parseFullName(selectedStudent.profile.name.fullName);
        setFormData(prev => ({ ...prev, firstName, lastName }));
      }
    }
  }, [formData.classroomUserId, studentToEdit, classroomRoster]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
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
      setViewMode('list'); 
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

  const handleEditClick = (student) => {
    setStudentToEdit(student);
    setViewMode('form');
  };

  const toggleDetails = (studentId) => {
    setExpandedStudentId(prevId => (prevId === studentId ? null : studentId));
  };

  const getStatusClass = (status) => {
    if (status === 'inactive') return 'status-inactive';
    if (status === 'transferred') return 'status-transferred';
    return '';
  };

  const linkedClassroomUserIds = new Set(students.map(s => s.classroomUserId));
  const modalTitle = t('groupWorkspace.studentsModal.title', { groupName: `${currentGroup.grade}${currentGroup.name}` });

  const isFormDisabled = !studentToEdit && !formData.classroomUserId;

  const modalFooter = viewMode === 'form' ? (
    <div className="profile-actions">
      <button className="profile-button secondary" onClick={() => setViewMode('list')}>
        {t('profileModal.cancelButton')}
      </button>
      <button className="profile-button primary" onClick={handleSubmit} disabled={isFormDisabled}>
        {studentToEdit ? t('groupWorkspace.studentsModal.form.saveButton') : t('groupWorkspace.studentsModal.form.addButton')}
      </button>
    </div>
  ) : null;

  const capitalizeName = (name) => {
    if (!name || typeof name !== 'string') return '';
    return name
      .trim()
      .split(' ')
      .filter(word => word.length > 0)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const handleInputBlur = (e) => {
    const { name, value } = e.target;
    if (name === 'firstName' || name === 'lastName') {
        setFormData(prev => ({ ...prev, [name]: capitalizeName(value) }));
    }
};

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} footer={modalFooter}>
      {viewMode === 'list' ? (
        <div className="gw-sm-list-section">
          <h4>
            <div className="gw-sm-header-left">
              <span className="gw-sm-student-count">{students.length}</span>
            </div>
            <div className="gw-sm-header-actions">
              <DownloadMenu students={students} currentGroup={currentGroup} currentSubject={currentSubject} />
              <button 
                className="gw-sm-action-btn add" 
                onClick={() => {
                  setStudentToEdit(null); 
                  setViewMode('form');
                }}
                title={t('groupWorkspace.studentsModal.form.addTitle')}
              >
                <FaPlus />
              </button>
            </div>
          </h4>
          <div className="gw-sm-list">
            {students.map(student => (
              <div key={student.id} className="gw-sm-student-wrapper">
                <div className="gw-sm-student-item">
                  <div className={`gw-sm-student-name ${getStatusClass(student.status)}`}>
                    <FaUserGraduate />
                    <span>{student.lastName} <strong>{student.firstName}</strong></span>
                  </div>
                  <div className="gw-sm-student-actions">
                    <button onClick={() => handleEditClick(student)} className="gw-sm-action-btn" title={t('groupWorkspace.studentsModal.tooltips.edit')}><FaEdit /></button>
                    <button onClick={() => handleDeleteStudent(student.id)} className="gw-sm-action-btn danger" title={t('groupWorkspace.studentsModal.tooltips.delete')}><FaTrash /></button>
                    <button onClick={() => toggleDetails(student.id)} className={`gw-sm-action-btn expand ${expandedStudentId === student.id ? 'active' : ''}`} title={t('groupWorkspace.studentsModal.tooltips.details')}><FaChevronDown /></button>
                  </div>
                </div>
                {expandedStudentId === student.id && (
                   <div className="gw-sm-student-details">
                     <div className="gw-sm-qr-preview">
                       <img src={`${API_BASE_URL}/api/qr-code/${student.qrCodeId}.png`} alt="QR Code Preview" onClick={() => onShowQrCode(student)} />
                     </div>
                     <div className="gw-sm-details-text">
                       <div><strong>{t('groupWorkspace.studentsModal.details.qrId')}:</strong> <span>{student.qrCodeId || 'N/A'}</span></div>
                       <div><strong>{t('groupWorkspace.studentsModal.details.contact')}:</strong> <span>{student.contactNumber || 'N/A'}</span></div>
                       <div><strong>{t('groupWorkspace.studentsModal.details.status')}:</strong> <span className={getStatusClass(student.status)}>{t(`groupWorkspace.studentsModal.status.${student.status}`)}</span></div>
                       {student.classroomUserId && (
                         <div><strong>{t('groupWorkspace.studentsModal.details.classroomId')}:</strong> <span>{student.classroomUserId}</span></div>
                       )}
                     </div>
                   </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="gw-sm-form-section">
          <h4>
            {studentToEdit ? <><FaEdit /> {t('groupWorkspace.studentsModal.form.editTitle')}</> : <><FaPlus /> {t('groupWorkspace.studentsModal.form.addTitle')}</>}
          </h4>
          <form onSubmit={handleSubmit} className="gw-sm-form">
            {error && <p className="form-error">{error}</p>}
            
            {groupDetails?.classroomGroup && (
              <div className="gw-sm-form-group">
                <label htmlFor="firstName">{t('groupWorkspace.studentsModal.form.classroomStudent')}</label>
                <select 
                  id="classroomUserId"
                  name="classroomUserId" 
                  value={formData.classroomUserId} 
                  onChange={handleInputChange} 
                  className="form-input"
                >
                  <option value="">{t('groupWorkspace.studentsModal.form.selectClassroomStudent')}</option>
                  {classroomRoster.map(rosterStudent => (
                    <option 
                        key={rosterStudent.userId} 
                        value={rosterStudent.userId} 
                        disabled={linkedClassroomUserIds.has(rosterStudent.userId) && rosterStudent.userId !== studentToEdit?.classroomUserId}
                    >
                      {rosterStudent.profile.name.fullName}
                      {linkedClassroomUserIds.has(rosterStudent.userId) && rosterStudent.userId !== studentToEdit?.classroomUserId ? ' (Already linked)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="gw-sm-form-group">
              <label htmlFor="firstName">{t('groupWorkspace.studentsModal.form.firstNameLabel')}</label>
              <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} onBlur={handleInputBlur} className="form-input" required disabled={isFormDisabled} />
            </div>
            <div className="gw-sm-form-group">
              <label htmlFor="lastName">{t('groupWorkspace.studentsModal.form.lastNameLabel')}</label>
              <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} onBlur={handleInputBlur} className="form-input" required disabled={isFormDisabled} />
            </div>
            <div className="gw-sm-form-group">
              <label htmlFor="contactNumber">{t('groupWorkspace.studentsModal.form.contactLabel')}</label>
              <input type="tel" id="contactNumber" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} className="form-input" disabled={isFormDisabled} />
            </div>

            {studentToEdit && (
              <div className="gw-sm-form-group">
                  <label htmlFor="status">{t('groupWorkspace.studentsModal.form.statusLabel')}</label>
                  <select id="status" name="status" value={formData.status} onChange={handleInputChange} className="form-input">
                      <option value="active">{t('groupWorkspace.studentsModal.status.active')}</option>
                      <option value="inactive">{t('groupWorkspace.studentsModal.status.inactive')}</option>
                      <option value="transferred">{t('groupWorkspace.studentsModal.status.transferred')}</option>
                  </select>
              </div>
            )}
          </form>
        </div>
      )}
    </Modal>
  );
};

export default StudentsModal;