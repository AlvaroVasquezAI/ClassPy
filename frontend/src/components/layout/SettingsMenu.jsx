import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { MdLanguage, MdDarkMode, MdLightMode } from "react-icons/md";
import './SettingsMenu.css';

const SettingsMenu = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const { theme, toggleTheme, language, changeLanguage } = useAppContext();

  const handleContentClick = (e) => e.stopPropagation();
  
  return (
    <div className="settings-backdrop" onClick={onClose}>
      <div className="settings-menu-content" onClick={handleContentClick}>
        <button onClick={toggleTheme} className="settings-menu-item">
          {theme === 'light' ? <MdDarkMode /> : <MdLightMode />}
          <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
        </button>

        <button onClick={changeLanguage} className="settings-menu-item">
          <MdLanguage />
          <span>{language === 'en' ? 'Español' : 'English'}</span>
        </button>
      </div>
    </div>
  );
};

export default SettingsMenu;