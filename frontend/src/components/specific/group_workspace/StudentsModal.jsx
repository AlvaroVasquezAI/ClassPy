import React, { useState, useEffect } from 'react';
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
      setError('First and last name are required.');
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
    if (window.confirm('Are you sure you want to permanently delete this student?')) {
      try {
        await apiClient.deleteStudent(studentId);
        onUpdate();
      } catch (err) {
        alert('Failed to delete student.');
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Manage Students for ${currentGroup.grade}${currentGroup.name}`}>
      <div className="gw-sm-container">
        <div className="gw-sm-list-section">
          <h4>
            <div className="gw-sm-header-left">
                <span>Students</span>
                <span className="gw-sm-student-count">{students.length}</span>
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
                    <button onClick={() => setStudentToEdit(student)} className="gw-sm-action-btn" title="Edit Student"><FaEdit /></button>
                    <button onClick={() => handleDeleteStudent(student.id)} className="gw-sm-action-btn danger" title="Delete Student"><FaTrash /></button>
                    <button onClick={() => toggleDetails(student.id)} className={`gw-sm-action-btn expand ${expandedStudentId === student.id ? 'active' : ''}`} title="View Details"><FaChevronDown /></button>
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
                      <div><strong>QR Code ID:</strong> <span>{student.qrCodeId || 'N/A'}</span></div>
                      <div><strong>Contact:</strong> <span>{student.contactNumber || 'N/A'}</span></div>
                      <div><strong>Status:</strong> <span className={getStatusClass(student.status)}>{student.status}</span></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="gw-sm-form-section">
          <h4>
            {studentToEdit ? <><FaEdit /> Edit Student</> : <><FaPlus /> Add New Student</>}
            {studentToEdit && <button onClick={handleCancelEdit} className="gw-sm-cancel-edit-btn" title="Cancel Edit"><FaTimes /></button>}
          </h4>
          <form onSubmit={handleSubmit} className="gw-sm-form">
            {error && <p className="form-error">{error}</p>}
            <div className="gw-sm-form-group">
              <label htmlFor="firstName">First Name</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="form-input" required />
            </div>
            <div className="gw-sm-form-group">
              <label htmlFor="lastName">Last Name</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="form-input" required />
            </div>
            <div className="gw-sm-form-group">
              <label htmlFor="contactNumber">Contact Number (Optional)</label>
              <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} className="form-input" />
            </div>
            <div className="gw-sm-form-group">
                <label htmlFor="status">Status</label>
                <select 
                    name="status" 
                    value={formData.status} 
                    onChange={handleInputChange} 
                    className="form-input"
                    disabled={!studentToEdit}
                >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="transferred">Transferred</option>
                </select>
            </div>
            <button type="submit" className="primary-button">{studentToEdit ? 'Save Changes' : 'Add Student'}</button>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export default StudentsModal;