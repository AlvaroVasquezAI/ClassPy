import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next'; 
import { apiClient } from '../services/apiClient';

const PENDING_SETUP_KEY = 'classpy_pending_setup';

const AppContext = createContext();

const getInitialTheme = () => {
  const savedTheme = window.localStorage.getItem('theme');
  return savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'light';
};

const THEME_COLORS = {
  light: '#f6f6f7',
  dark: '#1c1c1e',
};

export const AppProvider = ({ children }) => {
  const { i18n } = useTranslation(); 
  const [theme, setTheme] = useState(getInitialTheme);
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const pendingPhotoApplied = useRef(false);

  const [subjects, setSubjects] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isWorkspaceLoading, setIsWorkspaceLoading] = useState(true);

  const handleLanguageChange = () => {
    const newLang = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(newLang);
  };
  
  useEffect(() => {
    window.localStorage.setItem('theme', theme);
    document.documentElement.className = theme;
    let themeColorMetaTag = document.querySelector('meta[name="theme-color"]');
    if (!themeColorMetaTag) {
      themeColorMetaTag = document.createElement('meta');
      themeColorMetaTag.name = 'theme-color';
      document.head.appendChild(themeColorMetaTag);
    }
    themeColorMetaTag.content = THEME_COLORS[theme];
  }, [theme]);

  useEffect(() => {
    const checkTeacherStatus = async () => {
      try {
        const teacherData = await apiClient.getTeacher();
        setTeacherInfo(teacherData);
      } catch (error) {
        console.error("Could not verify teacher status:", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkTeacherStatus();
  }, []);

  const fetchWorkspaceData = async () => {
    setIsWorkspaceLoading(true);
    try {
      let [subjectsData, groupsData] = await Promise.all([
        apiClient.getSubjects(),
        apiClient.getGroups(),
      ]);

      // If Classroom is connected but workspace is empty, bootstrap from course titles.
      if (
        teacherInfo?.isGoogleConnected &&
        subjectsData.length === 0 &&
        groupsData.length === 0
      ) {
        try {
          await apiClient.syncWorkspaceFromClassroom();
          [subjectsData, groupsData] = await Promise.all([
            apiClient.getSubjects(),
            apiClient.getGroups(),
          ]);
        } catch (syncError) {
          console.error('Classroom workspace sync skipped/failed:', syncError);
        }
      }

      setSubjects(subjectsData);
      setGroups(groupsData);
    } catch (error) {
      console.error("Failed to fetch workspace data:", error);
    } finally {
      setIsWorkspaceLoading(false);
    }
  };

  useEffect(() => {
    if (teacherInfo) {
      fetchWorkspaceData();
    }
  }, [teacherInfo]);

  // After Google signup, apply an optional photo saved before the OAuth redirect.
  useEffect(() => {
    const applyPendingPhoto = async () => {
      if (!teacherInfo || pendingPhotoApplied.current) return;

      const raw = sessionStorage.getItem(PENDING_SETUP_KEY);
      if (!raw) return;

      pendingPhotoApplied.current = true;

      try {
        const { photoDataUrl, photoName } = JSON.parse(raw);
        if (!photoDataUrl) {
          sessionStorage.removeItem(PENDING_SETUP_KEY);
          return;
        }

        const blob = await (await fetch(photoDataUrl)).blob();
        const submissionData = new FormData();
        submissionData.append('first_name', teacherInfo.firstName);
        submissionData.append('last_name', teacherInfo.lastName);
        submissionData.append('email', teacherInfo.email);
        submissionData.append('profile_photo', blob, photoName || 'profile.jpg');

        const updatedTeacher = await apiClient.updateTeacher(submissionData);
        sessionStorage.removeItem(PENDING_SETUP_KEY);
        setTeacherInfo(updatedTeacher);
      } catch (error) {
        console.error('Failed to apply pending profile photo:', error);
        pendingPhotoApplied.current = false;
      }
    };

    applyPendingPhoto();
  }, [teacherInfo]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const value = {
    theme,
    toggleTheme,
    teacherInfo,
    setTeacherInfo,
    isLoading, 
    language: i18n.language, 
    changeLanguage: handleLanguageChange,

    subjects,
    groups,
    isWorkspaceLoading,
    refreshWorkspaceData: fetchWorkspaceData, 
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};