import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import slugify from 'slugify';
import { FaArrowRight, FaLayerGroup, FaUserGraduate } from 'react-icons/fa';
import { useAppContext } from '../context/AppContext';
import { apiClient } from '../services/apiClient';
import DashboardDatetimeCard from '../components/specific/dashboard/DashboardDatetimeCard';
import DashboardScheduleCard from '../components/specific/dashboard/DashboardScheduleCard';
import './DashboardPage.css';

const DashboardPage = () => {
  const { t } = useTranslation();
  const { groups, subjects, isWorkspaceLoading } = useAppContext();
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    apiClient.getSchedule().then(setSchedule).catch(() => setSchedule([]));
  }, []);

  const subjectsMap = useMemo(
    () => subjects.reduce((acc, s) => ({ ...acc, [s.id]: s }), {}),
    [subjects]
  );

  const getGroupDisplayText = (group) => {
    const subjectName = subjectsMap[group.subjectId]?.name || '...';
    return `${group.grade}${group.name} - ${subjectName}`;
  };

  const generateGroupUrl = (group) => {
    const slug = slugify(getGroupDisplayText(group), { lower: true, strict: true });
    return `/workspace/${slug}_working`;
  };

  const sections = useMemo(() => {
    const bySubject = new Map();

    for (const group of groups) {
      const subject = subjectsMap[group.subjectId];
      const key = subject?.id ?? `unknown-${group.subjectId}`;
      if (!bySubject.has(key)) {
        bySubject.set(key, {
          subjectId: key,
          subjectName: subject?.name || t('dashboard.unknownSubject'),
          subjectColor: subject?.color || 'var(--primary-color)',
          groups: [],
        });
      }
      bySubject.get(key).groups.push(group);
    }

    return Array.from(bySubject.values())
      .map((section) => ({
        ...section,
        groups: [...section.groups].sort(
          (a, b) => a.grade - b.grade || a.name.localeCompare(b.name)
        ),
      }))
      .sort((a, b) => a.subjectName.localeCompare(b.subjectName));
  }, [groups, subjectsMap, t]);

  let tileIndex = 0;

  if (isWorkspaceLoading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">{t('dashboard.loading')}</div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-atmosphere" aria-hidden="true" />

      {sections.length === 0 ? (
        <div className="dashboard-empty">
          <FaLayerGroup className="dashboard-empty-icon" />
          <h2>{t('dashboard.emptyTitle')}</h2>
          <p>{t('dashboard.emptySubtitle')}</p>
          <Link to="/workspace" className="dashboard-empty-link">
            {t('dashboard.emptyCta')}
            <FaArrowRight />
          </Link>
        </div>
      ) : (
        <div className="dashboard-sections">
          {sections.map((section) => (
            <section key={section.subjectId} className="dashboard-section">
              <div className="dashboard-section-head">
                <span
                  className="dashboard-section-dot"
                  style={{ backgroundColor: section.subjectColor }}
                />
                <h2 className="dashboard-section-title">{section.subjectName}</h2>
                <span className="dashboard-section-count">
                  {section.groups.length}
                </span>
              </div>

              <div className="dashboard-grid">
                {section.groups.map((group) => {
                  const index = tileIndex++;
                  const studentCount = group.studentCount ?? 0;
                  return (
                    <Link
                      key={group.id}
                      to={generateGroupUrl(group)}
                      className="dashboard-tile"
                      style={{
                        '--tile-color': group.color,
                        '--tile-delay': `${0.06 + index * 0.05}s`,
                      }}
                    >
                      <span className="dashboard-tile-sheen" aria-hidden="true" />
                      <div className="dashboard-tile-top">
                        <span className="dashboard-tile-code">
                          {group.grade}
                          {group.name}
                        </span>
                        <FaArrowRight className="dashboard-tile-arrow" />
                      </div>
                      <p className="dashboard-tile-subject">{section.subjectName}</p>
                      <span className="dashboard-tile-hint">
                        <FaUserGraduate className="dashboard-tile-students-icon" />
                        {t('dashboard.studentCount', { count: studentCount })}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      <DashboardDatetimeCard schedule={schedule} />

      <DashboardScheduleCard schedule={schedule} />
    </div>
  );
};

export default DashboardPage;
