import React, { createContext, useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; 
import { apiClient } from '../services/apiClient';

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
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};