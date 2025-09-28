import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../common/Modal';
import { useAppContext } from '../../context/AppContext';
import { apiClient } from '../../services/apiClient';
import { FaUserCircle } from 'react-icons/fa';
import './ProfileModal.css';

const API_HOST = window.location.hostname;
const API_BASE_URL = `http://${API_HOST}:8000`;

const ProfileModal = ({ isOpen, onClose }) => {
  const { teacherInfo, setTeacherInfo } = useAppContext();
  const { t } = useTranslation();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(teacherInfo);
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  useEffect(() => {
    setFormData(teacherInfo);
    setIsEditing(false);
    setNewProfilePic(null);
    setPreviewUrl(null);
  }, [isOpen, teacherInfo]);
  
  if (!teacherInfo) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProfilePic(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    const submissionData = new FormData();
    submissionData.append('first_name', formData.firstName);
    submissionData.append('last_name', formData.lastName);
    submissionData.append('email', formData.email);
    if (newProfilePic) {
      submissionData.append('profile_photo', newProfilePic);
    }

    try {
      const updatedTeacher = await apiClient.updateTeacher(submissionData);
      setTeacherInfo(updatedTeacher);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('profileModal.title')}>
      <div className="profile-modal-content">
        <div className="profile-pic-container">
          {previewUrl ? (
            <img src={previewUrl} alt="New Profile" className="profile-modal-image" />
          ) : (teacherInfo.profilePhotoUrl ? (
            <img src={`${API_BASE_URL}/${teacherInfo.profilePhotoUrl}`} alt="Profile" className="profile-modal-image"/>
          ) : (
            <FaUserCircle className="profile-modal-icon" />
          ))}
        </div>

        {isEditing ? (
          <div className="profile-details">
            <label htmlFor="changeProfilePic" className="profile-button secondary">
              {t('profileModal.changePhotoButton')}
            </label>
            <input type="file" id="changeProfilePic" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }}/>

            <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="profile-input"/>
            <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="profile-input"/>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="profile-input"/>

            <div className="profile-actions">
              <button onClick={() => setIsEditing(false)} className="profile-button secondary">{t('profileModal.cancelButton')}</button>
              <button onClick={handleSave} className="profile-button primary">{t('profileModal.saveButton')}</button>
            </div>
          </div>
        ) : (
          <div className="profile-details">
            <div className="profile-info-row">
              <strong>{t('profileModal.nameLabel')}:</strong>
              <span>{teacherInfo.firstName} {teacherInfo.lastName}</span>
            </div>
            <div className="profile-info-row">
              <strong>{t('profileModal.emailLabel')}:</strong>
              <span>{teacherInfo.email}</span>
            </div>
            <div className="profile-actions">
              <button onClick={() => setIsEditing(true)} className="profile-button primary">{t('profileModal.editButton')}</button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ProfileModal;