import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './DashboardHeroScene.css';

const PHRASE_KEYS = ['phrase1', 'phrase2', 'phrase3', 'phrase4', 'phrase5'];

const STUDENTS = [
  {
    className: 'dashboard-hero-student-1',
    hairStyle: 'short',
    hair: '#4a3223',
    skin: 'color-mix(in srgb, var(--primary-color) 16%, #f0cba0)',
    top: 'color-mix(in srgb, var(--primary-color) 55%, #e8b04b)',
    backpack: 'color-mix(in srgb, var(--primary-color) 45%, #9b6bc4)',
  },
  {
    className: 'dashboard-hero-student-2',
    hairStyle: 'long',
    hair: '#2e2019',
    skin: 'color-mix(in srgb, var(--primary-color) 14%, #d8a877)',
    top: 'color-mix(in srgb, var(--primary-color) 40%, #6c8fd6)',
    backpack: 'color-mix(in srgb, var(--primary-color) 30%, #e07a5f)',
  },
  {
    className: 'dashboard-hero-student-3',
    hairStyle: 'short',
    hair: '#1f1a16',
    skin: 'color-mix(in srgb, var(--primary-color) 12%, #c48a6a)',
    top: 'color-mix(in srgb, var(--primary-color) 50%, #5cb8a0)',
    backpack: 'color-mix(in srgb, var(--primary-color) 35%, #4a7ec8)',
  },
  {
    className: 'dashboard-hero-student-4',
    hairStyle: 'long',
    hair: '#7a4a2b',
    skin: 'color-mix(in srgb, var(--primary-color) 18%, #e8c4a0)',
    top: 'color-mix(in srgb, var(--primary-color) 45%, #d96b8a)',
    backpack: 'color-mix(in srgb, var(--primary-color) 40%, #6bbf7a)',
  },
  {
    className: 'dashboard-hero-student-5',
    hairStyle: 'short',
    hair: '#5c4a35',
    skin: 'color-mix(in srgb, var(--primary-color) 15%, #d4a882)',
    top: 'color-mix(in srgb, var(--primary-color) 60%, #7a6fd4)',
    backpack: 'color-mix(in srgb, var(--primary-color) 28%, #e8a040)',
  },
];

const Student = ({ className, hairStyle, hair, skin, top, backpack }) => (
  <svg
    className={`dashboard-hero-student ${className}`}
    viewBox="0 0 48 80"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g className="dashboard-hero-student-figure">
      {hairStyle === 'long' && (
        <path
          className="dashboard-hero-student-hair"
          d="M14 16 C14 8 18 4.5 24 4.5 C30 4.5 34 8 34 16 L35.5 33 C34.5 36 30.5 34.5 30.5 30 L30.5 21 C30.5 18.5 28 17 24 17 C20 17 17.5 18.5 17.5 21 L17.5 30 C17.5 34.5 13.5 36 12.5 33 Z"
          style={{ fill: hair }}
        />
      )}
      <circle cx="24" cy="18" r="7.5" style={{ fill: skin }} />
      {hairStyle === 'short' && (
        <path
          className="dashboard-hero-student-hair"
          d="M16.5 18 C16.5 10.5 19.5 7.5 24 7.5 C28.5 7.5 31.5 10.5 31.5 18 C31.5 15.5 30 13.5 28 13.5 L20 13.5 C18 13.5 16.5 15.5 16.5 18 Z"
          style={{ fill: hair }}
        />
      )}
      <rect className="dashboard-hero-backpack" x="12" y="27" width="9" height="16" rx="3" style={{ fill: backpack }} />
      <path
        className="dashboard-hero-student-body"
        d="M16 27 C18 25 22 24 24 24 C26 24 30 25 32 27 L34 47 C31 49 27 49.5 24 49.5 C21 49.5 17 49 14 47 Z"
        style={{ fill: top }}
      />
      <rect className="dashboard-hero-student-arm" x="30" y="28" width="5" height="15" rx="2.5" style={{ fill: top }} />
      <g className="dashboard-hero-student-leg-back">
        <rect x="25" y="48" width="6" height="20" rx="3" />
        <rect className="dashboard-hero-shoe" x="24" y="65" width="10" height="5" rx="2.5" />
      </g>
      <g className="dashboard-hero-student-leg-front">
        <rect x="17" y="48" width="6" height="20" rx="3" />
        <rect className="dashboard-hero-shoe" x="14" y="65" width="10" height="5" rx="2.5" />
      </g>
    </g>
  </svg>
);

/** Man teacher: short hair, blazer + pants, book + pointer */
const TeacherMan = ({ label }) => (
  <svg
    className="dashboard-hero-teacher dashboard-hero-teacher-man"
    viewBox="0 0 90 94"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label={label}
  >
    <g className="dashboard-hero-figure">
      {/* Short hair */}
      <ellipse className="dashboard-hero-hair-short" cx="40" cy="14" rx="10.5" ry="7" />
      <circle className="dashboard-hero-head" cx="40" cy="20" r="10" />

      <g className="dashboard-hero-glasses">
        <circle cx="35.5" cy="20" r="3.2" fill="none" strokeWidth="1.4" />
        <circle cx="44.5" cy="20" r="3.2" fill="none" strokeWidth="1.4" />
        <path d="M38.7 20 H41.3" strokeWidth="1.3" fill="none" />
      </g>

      <path
        className="dashboard-hero-blazer"
        d="M28 32 C30 30 36 29 40 29 C44 29 50 30 52 32 L56 60 C52 62 45 63 40 63 C35 63 28 62 24 60 Z"
      />
      <path className="dashboard-hero-collar" d="M36 31 L40 39 L44 31" fill="none" strokeWidth="1.6" />

      <g className="dashboard-hero-arm-teach">
        <rect x="50" y="34" width="6.5" height="20" rx="3.2" />
        <rect className="dashboard-hero-pointer" x="54" y="20" width="2.2" height="18" rx="1.1" />
        <circle className="dashboard-hero-pointer-tip" cx="55.1" cy="19" r="2" />
      </g>

      <g className="dashboard-hero-arm-book">
        <rect x="27" y="34" width="6.5" height="18" rx="3.2" />
        <g className="dashboard-hero-open-book">
          <path d="M18 50 L30 47 L30 60 L18 62 Z" />
          <path d="M30 47 L42 50 L42 62 L30 60 Z" />
          <path className="dashboard-hero-book-spine" d="M30 47 V60" fill="none" strokeWidth="1.2" />
          <path
            className="dashboard-hero-book-lines"
            d="M21 52 H27 M21 55 H27 M33 52 H39 M33 55 H39"
            fill="none"
            strokeWidth="0.9"
          />
        </g>
      </g>

      <g className="dashboard-hero-leg-back">
        <rect x="42" y="62" width="8" height="28" rx="4" />
        <rect className="dashboard-hero-shoe" x="40" y="86" width="14" height="6" rx="3" />
      </g>
      <g className="dashboard-hero-leg-front">
        <rect x="30" y="62" width="8" height="28" rx="4" />
        <rect className="dashboard-hero-shoe" x="26" y="86" width="14" height="6" rx="3" />
      </g>
    </g>
  </svg>
);

/** Woman teacher: long hair, dress, book + pointer */
const TeacherWoman = ({ label }) => (
  <svg
    className="dashboard-hero-teacher dashboard-hero-teacher-woman"
    viewBox="0 0 90 94"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label={label}
  >
    <g className="dashboard-hero-figure">
      {/* Long hair behind head */}
      <path
        className="dashboard-hero-hair-long"
        d="M26 18 C26 8 32 4 40 4 C48 4 54 8 54 18 L56 48 C54 52 48 50 48 44 L48 28 C48 24 45 22 40 22 C35 22 32 24 32 28 L32 44 C32 50 26 52 24 48 Z"
      />
      <circle className="dashboard-hero-head" cx="40" cy="20" r="10" />
      {/* Front strands framing face */}
      <path
        className="dashboard-hero-hair-long"
        d="M30 14 C31 22 30 28 29 34 M50 14 C49 22 50 28 51 34"
        fill="none"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      <g className="dashboard-hero-glasses">
        <circle cx="35.5" cy="20" r="3.2" fill="none" strokeWidth="1.4" />
        <circle cx="44.5" cy="20" r="3.2" fill="none" strokeWidth="1.4" />
        <path d="M38.7 20 H41.3" strokeWidth="1.3" fill="none" />
      </g>

      {/* Dress torso + flared skirt */}
      <path
        className="dashboard-hero-dress"
        d="M29 32 C31 30 36 29 40 29 C44 29 49 30 51 32 L54 52 L60 86 C55 88 45 89 40 89 C35 89 25 88 20 86 L26 52 Z"
      />
      <path className="dashboard-hero-collar" d="M36 31 L40 39 L44 31" fill="none" strokeWidth="1.6" />

      <g className="dashboard-hero-arm-teach">
        <rect className="dashboard-hero-dress-arm" x="50" y="34" width="6.5" height="20" rx="3.2" />
        <rect className="dashboard-hero-pointer" x="54" y="20" width="2.2" height="18" rx="1.1" />
        <circle className="dashboard-hero-pointer-tip" cx="55.1" cy="19" r="2" />
      </g>

      <g className="dashboard-hero-arm-book">
        <rect className="dashboard-hero-dress-arm" x="27" y="34" width="6.5" height="18" rx="3.2" />
        <g className="dashboard-hero-open-book">
          <path d="M18 50 L30 47 L30 60 L18 62 Z" />
          <path d="M30 47 L42 50 L42 62 L30 60 Z" />
          <path className="dashboard-hero-book-spine" d="M30 47 V60" fill="none" strokeWidth="1.2" />
          <path
            className="dashboard-hero-book-lines"
            d="M21 52 H27 M21 55 H27 M33 52 H39 M33 55 H39"
            fill="none"
            strokeWidth="0.9"
          />
        </g>
      </g>

      {/* Legs peeking under dress */}
      <g className="dashboard-hero-leg-back">
        <rect x="42" y="78" width="7" height="12" rx="3.5" />
        <rect className="dashboard-hero-shoe" x="40" y="86" width="13" height="6" rx="3" />
      </g>
      <g className="dashboard-hero-leg-front">
        <rect x="31" y="78" width="7" height="12" rx="3.5" />
        <rect className="dashboard-hero-shoe" x="27" y="86" width="13" height="6" rx="3" />
      </g>
    </g>
  </svg>
);

const DashboardHeroScene = () => {
  const { t } = useTranslation();
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % PHRASE_KEYS.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="dashboard-hero" aria-hidden="true">
      <div className="dashboard-hero-sky">
        <span className="dashboard-hero-cloud dashboard-hero-cloud-a" />
        <span className="dashboard-hero-cloud dashboard-hero-cloud-b" />
        <span className="dashboard-hero-cloud dashboard-hero-cloud-c" />
      </div>

      <div className="dashboard-hero-floaters">
        <span className="dashboard-hero-book dashboard-hero-book-a" />
        <span className="dashboard-hero-book dashboard-hero-book-b" />
        <span className="dashboard-hero-book dashboard-hero-book-c" />
        <span className="dashboard-hero-book dashboard-hero-book-d" />
        <span className="dashboard-hero-book dashboard-hero-book-e" />
        <span className="dashboard-hero-pencil" />
      </div>

      <div className="dashboard-hero-ground">
        <span className="dashboard-hero-path" />
      </div>

      <div className="dashboard-hero-props">
        {/* Chalkboard */}
        <div className="dashboard-hero-board">
          <span className="dashboard-hero-board-chalkline dashboard-hero-board-chalkline-1" />
          <span className="dashboard-hero-board-chalkline dashboard-hero-board-chalkline-2" />
          <span className="dashboard-hero-board-chalkline dashboard-hero-board-chalkline-3" />
          <span className="dashboard-hero-board-leg dashboard-hero-board-leg-l" />
          <span className="dashboard-hero-board-leg dashboard-hero-board-leg-r" />
        </div>

        {/* Desk with a stack of books */}
        <div className="dashboard-hero-desk">
          <span className="dashboard-hero-desk-stack dashboard-hero-desk-stack-bottom" />
          <span className="dashboard-hero-desk-stack dashboard-hero-desk-stack-mid" />
          <span className="dashboard-hero-desk-stack dashboard-hero-desk-stack-top" />
          <span className="dashboard-hero-desk-top" />
          <span className="dashboard-hero-desk-leg dashboard-hero-desk-leg-l" />
          <span className="dashboard-hero-desk-leg dashboard-hero-desk-leg-r" />
        </div>
      </div>

      <div className="dashboard-hero-procession">
        <span className="dashboard-hero-shadow dashboard-hero-shadow-man" />
        <span className="dashboard-hero-shadow dashboard-hero-shadow-woman" />
        <span className="dashboard-hero-shadow dashboard-hero-shadow-s1" />
        <span className="dashboard-hero-shadow dashboard-hero-shadow-s2" />
        <span className="dashboard-hero-shadow dashboard-hero-shadow-s3" />
        <span className="dashboard-hero-shadow dashboard-hero-shadow-s4" />
        <span className="dashboard-hero-shadow dashboard-hero-shadow-s5" />

        {/* Students follow behind (rendered first so teachers sit on top) */}
        {STUDENTS.map((student) => (
          <Student key={student.className} {...student} />
        ))}

        <TeacherWoman label={t('dashboard.heroLabelWoman')} />
        <TeacherMan label={t('dashboard.heroLabelMan')} />
      </div>

      <p key={phraseIndex} className="dashboard-hero-caption">
        {t(`dashboard.heroPhrases.${PHRASE_KEYS[phraseIndex]}`)}
      </p>
    </div>
  );
};

export default DashboardHeroScene;
