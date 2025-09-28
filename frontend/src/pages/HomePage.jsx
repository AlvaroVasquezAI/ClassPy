import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from 'react-i18next';
import './HomePage.css'; 

const HomePage = () => {
  const { teacherInfo } = useAppContext();
  const { t, i18n } = useTranslation(); 

  const fullMessage = teacherInfo ? t('homePage.welcome', { name: teacherInfo.firstName }) : '';

  const fullTitle = "ClassPy";
  
  const [displayedTitle, setDisplayedTitle] = useState('');
  const [isTitleTyping, setIsTitleTyping] = useState(true);
  const [displayedMessage, setDisplayedMessage] = useState('');
  const [isMessageTyping, setIsMessageTyping] = useState(false);

  useEffect(() => {
    setDisplayedTitle('');
    setIsTitleTyping(true);
    setDisplayedMessage('');
    setIsMessageTyping(false);
  }, [fullMessage]);

  useEffect(() => {
    if (!isTitleTyping) return;
    if (displayedTitle === fullTitle) {
      setIsTitleTyping(false);
      setIsMessageTyping(true);
      return;
    }
    const typingTimeout = setTimeout(() => {
      setDisplayedTitle(fullTitle.slice(0, displayedTitle.length + 1));
    }, 150);
    return () => clearTimeout(typingTimeout);
  }, [displayedTitle, isTitleTyping, fullTitle]);

  useEffect(() => {
    if (!isMessageTyping || !fullMessage) return;
    if (displayedMessage === fullMessage) {
      setIsMessageTyping(false);
      return;
    }
    const messageTimeout = setTimeout(() => {
      setDisplayedMessage(fullMessage.slice(0, displayedMessage.length + 1));
    }, 75);
    return () => clearTimeout(messageTimeout);
  }, [displayedMessage, isMessageTyping, fullMessage]);

  return (
    <div className="homepage-container">
      <div className="welcome-content">
        <h1 className={`homepage-title ${isTitleTyping ? 'typing' : ''}`}>
          {displayedTitle}
        </h1>
        <p className={`welcome-message ${isMessageTyping ? 'typing' : ''}`}>
          {displayedMessage}
        </p>
      </div>
    </div>
  );
};

export default HomePage;