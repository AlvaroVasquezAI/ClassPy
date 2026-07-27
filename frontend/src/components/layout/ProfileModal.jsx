import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../common/Modal';
import { useAppContext } from '../../context/AppContext';
import { apiClient } from '../../services/apiClient';
import { FaUserCircle, FaUser, FaEnvelope, FaCamera } from 'react-icons/fa';
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
    if (isOpen) {
      setFormData(teacherInfo);
      setIsEditing(false);
      setNewProfilePic(null);
      setPreviewUrl(null);
    }
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
      console.error('Failed to update profile', error);
    }
  };

  const fullName = `${teacherInfo.firstName} ${teacherInfo.lastName}`.trim();

  const modalFooter = isEditing ? (
    <div className="profile-actions">
      <button type="button" onClick={() => setIsEditing(false)} className="profile-button secondary">
        {t('profileModal.cancelButton')}
      </button>
      <button type="button" onClick={handleSave} className="profile-button primary">
        {t('profileModal.saveButton')}
      </button>
    </div>
  ) : (
    <div className="profile-actions">
      <button type="button" onClick={() => setIsEditing(true)} className="profile-button primary">
        {t('profileModal.editButton')}
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('profileModal.title')}
      footer={modalFooter}
      contentClassName="modal-content--profile"
    >
      <div className={`profile-modal${isEditing ? ' is-editing' : ''}`}>
        <div className="profile-hero">
          <div className="profile-avatar-wrap">
            {previewUrl ? (
              <img src={previewUrl} alt="" className="profile-modal-image" />
            ) : teacherInfo.profilePhotoUrl ? (
              <img
                src={`${API_BASE_URL}/${teacherInfo.profilePhotoUrl}`}
                alt=""
                className="profile-modal-image"
              />
            ) : (
              <FaUserCircle className="profile-modal-icon" aria-hidden="true" />
            )}
          </div>

          {!isEditing && (
            <div className="profile-hero-text">
              <h3 className="profile-display-name">{fullName}</h3>
              <p className="profile-display-email">{teacherInfo.email}</p>
            </div>
          )}

          {isEditing && (
            <label htmlFor="changeProfilePic" className="profile-photo-btn">
              <FaCamera aria-hidden="true" />
              <span>{t('profileModal.changePhotoButton')}</span>
            </label>
          )}
          <input
            type="file"
            id="changeProfilePic"
            accept="image/*"
            onChange={handleFileChange}
            className="profile-file-input"
          />
        </div>

        {isEditing ? (
          <div className="profile-edit-fields">
            <label className="profile-field">
              <span className="profile-field-label">{t('profileModal.firstNameLabel')}</span>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="profile-input"
              />
            </label>
            <label className="profile-field">
              <span className="profile-field-label">{t('profileModal.lastNameLabel')}</span>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="profile-input"
              />
            </label>
            <label className="profile-field">
              <span className="profile-field-label">{t('profileModal.emailLabel')}</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                className="profile-input is-readonly"
                readOnly
                disabled
                title={t('profileModal.emailReadOnly')}
              />
              <span className="profile-field-hint">{t('profileModal.emailReadOnly')}</span>
            </label>
          </div>
        ) : (
          <div className="profile-info-card">
            <div className="profile-info-row">
              <span className="profile-info-icon" aria-hidden="true">
                <FaUser />
              </span>
              <div className="profile-info-text">
                <span className="profile-info-label">{t('profileModal.nameLabel')}</span>
                <span className="profile-info-value">{fullName}</span>
              </div>
            </div>
            <div className="profile-info-row">
              <span className="profile-info-icon" aria-hidden="true">
                <FaEnvelope />
              </span>
              <div className="profile-info-text">
                <span className="profile-info-label">{t('profileModal.emailLabel')}</span>
                <span className="profile-info-value">{teacherInfo.email}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ProfileModal;
