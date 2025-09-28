import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import { BsCheckCircleFill, BsXCircleFill, BsFillSunFill, BsFillMoonStarsFill } from 'react-icons/bs';
import { useAppContext } from '../context/AppContext';
import { apiClient } from '../services/apiClient';
import './InitialSetupPage.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const InitialSetupPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { setTeacherInfo, theme, toggleTheme } = useAppContext();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  const [validation, setValidation] = useState({
    firstName: null,
    lastName: null,
    email: null,
  });

  const [profilePic, setProfilePic] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    const isFirstNameValid = validation.firstName === true;
    const isLastNameValid = validation.lastName === true;
    const isEmailValid = validation.email === true;
    setIsFormValid(isFirstNameValid && isLastNameValid && isEmailValid);
  }, [validation]);

  const validateField = (name, value) => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        return value.trim().length > 0;
      case 'email':
        return EMAIL_REGEX.test(value);
      default:
        return false;
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const isValid = validateField(name, value);
    setValidation(prev => ({ ...prev, [name]: isValid }));
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validation[name] !== null) {
      const isValid = validateField(name, value);
      setValidation(prev => ({ ...prev, [name]: isValid }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      setError("Please correct the errors before submitting.");
      return;
    }
    setError('');
    setIsLoading(true);

    const submissionData = new FormData();
    submissionData.append('first_name', formData.firstName);
    submissionData.append('last_name', formData.lastName);
    submissionData.append('email', formData.email);
    if (profilePic) {
      submissionData.append('profile_photo', profilePic);
    }

    try {
      const newTeacher = await apiClient.createTeacher(submissionData);
      setTeacherInfo(newTeacher);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLanguageChange = () => {
    const newLang = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="setup-page-container">
      <div className="setup-card">
        <div className="settings-toggles">
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={i18n.language === 'es'}
              onChange={handleLanguageChange}
            />
            <span className="slider">
              <span className="toggle-icon left">EN</span>
              <span className="toggle-icon right">ES</span>
            </span>
          </label>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={theme === 'dark'}
              onChange={toggleTheme}
            />
            <span className="slider">
               <BsFillSunFill className="toggle-icon left"/>
               <BsFillMoonStarsFill className="toggle-icon right"/>
            </span>
          </label>
        </div>

        <h1 className="setup-title">{t('setupPage.title')}</h1>
        <p className="setup-subtitle">{t('setupPage.subtitle')}</p>

        <form onSubmit={handleSubmit} className="setup-form">
          {error && <p className="error-message">{error}</p>}

          <div className="profile-pic-uploader">
            {previewUrl ? (
              <img src={previewUrl} alt="Profile Preview" className="profile-preview" />
            ) : (
              <FaUserCircle className="profile-placeholder-icon" />
            )}
            <input type="file" id="profilePic" accept="image/png, image/jpeg" onChange={handleFileChange} style={{ display: 'none' }} disabled={isLoading}/>
            <label htmlFor="profilePic" className={`upload-button ${isLoading ? 'disabled' : ''}`}>
              {previewUrl ? t('setupPage.changeButton') : t('setupPage.uploadButton')}
            </label>
          </div>

          <div className="input-group">
            <div className="input-wrapper">
              <input type="text" name="firstName" placeholder={t('setupPage.firstNamePlaceholder')} value={formData.firstName} onChange={handleInputChange} onBlur={handleBlur} required className="form-input" disabled={isLoading}/>
              {validation.firstName === true && <BsCheckCircleFill className="validation-icon valid-icon" />}
              {validation.firstName === false && <BsXCircleFill className="validation-icon invalid-icon" />}
            </div>
            <div className="input-wrapper">
              <input type="text" name="lastName" placeholder={t('setupPage.lastNamePlaceholder')} value={formData.lastName} onChange={handleInputChange} onBlur={handleBlur} required className="form-input" disabled={isLoading}/>
              {validation.lastName === true && <BsCheckCircleFill className="validation-icon valid-icon" />}
              {validation.lastName === false && <BsXCircleFill className="validation-icon invalid-icon" />}
            </div>
          </div>
          
          <div className="input-wrapper">
            <input type="email" name="email" placeholder={t('setupPage.emailPlaceholder')} value={formData.email} onChange={handleInputChange} onBlur={handleBlur} required className="form-input full-width" disabled={isLoading}/>
            {validation.email === true && <BsCheckCircleFill className="validation-icon valid-icon" />}
            {validation.email === false && <BsXCircleFill className="validation-icon invalid-icon" />}
          </div>

          <button type="submit" className="create-profile-button" disabled={!isFormValid || isLoading}>
            {isLoading ? 'Creating...' : t('setupPage.createButton')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InitialSetupPage;