import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { useTranslation } from 'react-i18next';
import { MdLanguage, MdDarkMode, MdLightMode } from "react-icons/md";
import './SettingsMenu.css';

const SettingsMenu = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  const { theme, toggleTheme, language, changeLanguage } = useAppContext();

  const handleContentClick = (e) => e.stopPropagation();
  
  return (
    <div className="settings-backdrop" onClick={onClose}>
      <div className="settings-menu-content" onClick={handleContentClick}>
        <button onClick={toggleTheme} className="settings-menu-item">
          {theme === 'light' ? <MdDarkMode /> : <MdLightMode />}
          <span>{theme === 'light' ? t('navbar.dark_mode') : t('navbar.light_mode')}</span>
        </button>

        <button onClick={changeLanguage} className="settings-menu-item">
          <MdLanguage />
          <span>{language === 'en' ? t('navbar.es') : t('navbar.en')}</span>
        </button>
      </div>
    </div>
  );
};

export default SettingsMenu;