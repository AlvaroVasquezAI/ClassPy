import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaArrowRight } from 'react-icons/fa';
import HomeHeroScene from '../components/specific/home/HomeHeroScene';
import './HomePage.css';

const HomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const fullTitle = 'ClassPy';
  const [displayedTitle, setDisplayedTitle] = useState('');
  const [isTitleTyping, setIsTitleTyping] = useState(true);

  useEffect(() => {
    setDisplayedTitle('');
    setIsTitleTyping(true);
  }, []);

  useEffect(() => {
    if (!isTitleTyping) return;
    if (displayedTitle === fullTitle) {
      setIsTitleTyping(false);
      return;
    }
    const typingTimeout = setTimeout(() => {
      setDisplayedTitle(fullTitle.slice(0, displayedTitle.length + 1));
    }, 150);
    return () => clearTimeout(typingTimeout);
  }, [displayedTitle, isTitleTyping, fullTitle]);

  return (
    <div className="homepage-container">
      <div className="homepage-atmosphere" aria-hidden="true" />

      <p className="homepage-kicker">{t('homePage.kicker')}</p>

      <HomeHeroScene>
        <div className="home-hero-stage">
          <h1 className={`homepage-title ${isTitleTyping ? 'typing' : ''}`}>
            {displayedTitle}
          </h1>

          <button
            type="button"
            className="homepage-start-btn"
            onClick={() => navigate('/dashboard')}
          >
            <span>{t('homePage.cta')}</span>
            <FaArrowRight aria-hidden="true" />
          </button>
        </div>
      </HomeHeroScene>
    </div>
  );
};

export default HomePage;
