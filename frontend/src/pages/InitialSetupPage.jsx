import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaUserCircle, FaGoogle } from 'react-icons/fa';
import { BsFillSunFill, BsFillMoonStarsFill } from 'react-icons/bs';
import { useAppContext } from '../context/AppContext';
import './InitialSetupPage.css';

const PENDING_SETUP_KEY = 'classpy_pending_setup';
const API_HOST = window.location.hostname;
const API_BASE_URL = `http://${API_HOST}:8000`;

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const InitialSetupPage = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useAppContext();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (profilePic) {
        const photoDataUrl = await readFileAsDataUrl(profilePic);
        sessionStorage.setItem(
          PENDING_SETUP_KEY,
          JSON.stringify({
            photoDataUrl,
            photoName: profilePic.name || 'profile.jpg',
          })
        );
      } else {
        sessionStorage.removeItem(PENDING_SETUP_KEY);
      }

      window.location.href = `${API_BASE_URL}/api/auth/google/login`;
    } catch (err) {
      setError(err.message || t('setupPage.errorGeneric'));
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

          <p className="setup-optional-hint">{t('setupPage.optionalHint')}</p>

          <button type="submit" className="create-profile-button" disabled={isLoading}>
            <FaGoogle className="google-button-icon" />
            {isLoading ? t('setupPage.connectingButton') : t('setupPage.createButton')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InitialSetupPage;
