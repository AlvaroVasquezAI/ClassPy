import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { useTranslation } from 'react-i18next';
import { BsBriefcaseFill, BsQrCodeScan } from 'react-icons/bs';
import { FaUserCircle, FaChalkboardTeacher } from 'react-icons/fa';
import { RxDashboard } from 'react-icons/rx';
import { PiStudentBold } from 'react-icons/pi';
import { MdLanguage, MdDarkMode, MdLightMode } from "react-icons/md";
import { FiMenu } from "react-icons/fi"; 
import ProfileModal from './ProfileModal';
import SettingsMenu from './SettingsMenu'; 

import './PageLayout.css';

const API_HOST = window.location.hostname;
const API_BASE_URL = `http://${API_HOST}:8000`;

export const PageLayout = () => {
  const { theme, toggleTheme, teacherInfo, language, changeLanguage } = useAppContext();
  const { t } = useTranslation();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false); 

  return (
    <div className={`app-container ${theme}`}>
      <nav className="top-navbar">
        <div className="nav-logo">
          {teacherInfo ? (
            <button className="profile-button-nav" onClick={() => setIsProfileModalOpen(true)}>
              {teacherInfo.profilePhotoUrl ? (
                <img src={`${API_BASE_URL}/${teacherInfo.profilePhotoUrl}`} alt="Profile" className="profile-image-nav"/>
              ) : ( <FaUserCircle /> )}
            </button>
          ) : ( <div className="nav-logo-placeholder">ClassPy</div> )}
        </div>

        <div className="nav-links">
            <NavLink to="/dashboard" className="nav-link-item" title={t('navbar.dashboard')}><RxDashboard className="nav-link-icon" /><span className="nav-link-text">{t('navbar.dashboard')}</span></NavLink>
            <NavLink to="/workspace" className="nav-link-item" title={t('navbar.workspace')}><BsBriefcaseFill className="nav-link-icon" /><span className="nav-link-text">{t('navbar.workspace')}</span></NavLink>
            <NavLink to="/classroom" className="nav-link-item" title={t('navbar.classroom')}><FaChalkboardTeacher className="nav-link-icon" /><span className="nav-link-text">{t('navbar.classroom')}</span></NavLink>
            <NavLink to="/students" className="nav-link-item" title={t('navbar.students')}><PiStudentBold className="nav-link-icon" /><span className="nav-link-text">{t('navbar.students')}</span></NavLink>
            <NavLink to="/attendance" className="nav-link-item" title={t('navbar.attendance')}><BsQrCodeScan className="nav-link-icon" /><span className="nav-link-text">{t('navbar.attendance')}</span></NavLink>
        </div>

        <div className="nav-actions">
           <div className="desktop-actions">
             <button onClick={changeLanguage} className="action-button" title="Change Language">
              <MdLanguage />
            </button>
            <button onClick={toggleTheme} className="action-button" title="Toggle Theme">
              {theme === 'light' ? <MdDarkMode /> : <MdLightMode />}
            </button>
           </div>
           
           <div className="mobile-actions">
            <button onClick={() => setIsSettingsMenuOpen(prev => !prev)} className="action-button" title="Settings">
              <FiMenu />
            </button>
           </div>
        </div>
      </nav>

      <main className="content-area">
        <Outlet />
      </main>
      
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
      <SettingsMenu isOpen={isSettingsMenuOpen} onClose={() => setIsSettingsMenuOpen(false)} />
    </div>
  );
};