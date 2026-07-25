import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import slugify from 'slugify';
import { MdOutlineSchedule, MdFreeBreakfast } from 'react-icons/md';
import { FaCoffee, FaRegCalendarCheck } from 'react-icons/fa';
import { useAppContext } from '../../../context/AppContext';
import './DashboardScheduleCard.css';

const WEEK_DAYS = [
  { key: 'monday', name: 'Monday', short: 'mon' },
  { key: 'tuesday', name: 'Tuesday', short: 'tue' },
  { key: 'wednesday', name: 'Wednesday', short: 'wed' },
  { key: 'thursday', name: 'Thursday', short: 'thu' },
  { key: 'friday', name: 'Friday', short: 'fri' },
];

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TIME_SLOTS = [
  { start: '07:00', end: '07:50', kind: 'period' },
  { start: '07:50', end: '08:40', kind: 'period' },
  { start: '08:40', end: '09:30', kind: 'period' },
  { start: '09:30', end: '10:20', kind: 'period' },
  { start: '10:20', end: '10:50', kind: 'recess' },
  { start: '10:50', end: '11:40', kind: 'period' },
  { start: '11:40', end: '12:30', kind: 'period' },
  { start: '12:30', end: '13:20', kind: 'period' },
];

const toMinutes = (time) => {
  const [h, m] = String(time).split(':').map(Number);
  return h * 60 + m;
};

const DashboardScheduleCard = ({ schedule = [] }) => {
  const { t } = useTranslation();
  const { groups, subjects } = useAppContext();
  const [now, setNow] = useState(() => new Date());

  const todayName = DAY_NAMES[now.getDay()];
  const isTodayWeekday = WEEK_DAYS.some((d) => d.name === todayName);
  const [selectedDay, setSelectedDay] = useState(
    isTodayWeekday ? todayName : WEEK_DAYS[0].name
  );

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const subjectsMap = useMemo(
    () => subjects.reduce((acc, s) => ({ ...acc, [s.id]: s }), {}),
    [subjects]
  );

  const groupsMap = useMemo(
    () => groups.reduce((acc, g) => ({ ...acc, [g.id]: g }), {}),
    [groups]
  );

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const entries = useMemo(() => {
    const daySchedule = schedule.filter((entry) => entry.dayOfWeek === selectedDay);

    return TIME_SLOTS.map((slot) => {
      const startMinutes = toMinutes(slot.start);
      const endMinutes = toMinutes(slot.end);
      const isLive =
        selectedDay === todayName &&
        currentMinutes >= startMinutes &&
        currentMinutes < endMinutes;
      const isPast = selectedDay === todayName && currentMinutes >= endMinutes;

      if (slot.kind === 'recess') {
        return {
          id: `recess-${slot.start}`,
          type: 'recess',
          startTime: slot.start,
          endTime: slot.end,
          startMinutes,
          isLive,
          isPast,
          color: '#c4a35a',
        };
      }

      const scheduled = daySchedule.find((entry) => entry.startTime === slot.start);
      if (scheduled) {
        const group = groupsMap[scheduled.groupId];
        const subject = group ? subjectsMap[group.subjectId] : null;
        return {
          id: scheduled.id,
          type: 'class',
          startTime: slot.start,
          endTime: slot.end,
          startMinutes,
          isLive,
          isPast,
          group,
          subjectName: subject?.name || t('dashboard.unknownSubject'),
          color: group?.color || 'var(--primary-color)',
        };
      }

      return {
        id: `free-${slot.start}`,
        type: 'free',
        startTime: slot.start,
        endTime: slot.end,
        startMinutes,
        isLive,
        isPast,
        color: '#8e8e93',
      };
    });
  }, [schedule, selectedDay, groupsMap, subjectsMap, todayName, currentMinutes, t]);

  const generateGroupUrl = (entry) => {
    if (!entry.group) return null;
    const slug = slugify(
      `${entry.group.grade}${entry.group.name} - ${entry.subjectName}`,
      { lower: true, strict: true }
    );
    return `/workspace/${slug}_working`;
  };

  const renderItemContent = (entry) => (
    <>
      <div className="dashboard-schedule-time">
        <span className="dashboard-schedule-start">{entry.startTime}</span>
        <span className="dashboard-schedule-end">{entry.endTime}</span>
      </div>

      <span className="dashboard-schedule-track" aria-hidden="true">
        <span className="dashboard-schedule-dot" />
      </span>

      <div className="dashboard-schedule-info">
        {entry.type === 'class' && (
          <>
            <span className="dashboard-schedule-group">
              {entry.group ? `${entry.group.grade}${entry.group.name}` : '—'}
            </span>
            <span className="dashboard-schedule-subject">{entry.subjectName}</span>
          </>
        )}

        {entry.type === 'recess' && (
          <>
            <span className="dashboard-schedule-badge is-recess">
              <MdFreeBreakfast />
              {t('dashboard.schedule.recess')}
            </span>
            <span className="dashboard-schedule-subject">
              {t('dashboard.schedule.recessHint')}
            </span>
          </>
        )}

        {entry.type === 'free' && (
          <>
            <span className="dashboard-schedule-badge is-free">
              <FaCoffee />
              {t('dashboard.schedule.free')}
            </span>
            <span className="dashboard-schedule-subject">
              {t('dashboard.schedule.freeHint')}
            </span>
          </>
        )}
      </div>

      {entry.isLive && (
        <span className="dashboard-schedule-live">
          <span className="dashboard-schedule-live-pulse" />
          {t('dashboard.schedule.now')}
        </span>
      )}
    </>
  );

  return (
    <section className="dashboard-schedule" aria-label={t('dashboard.schedule.title')}>
      <header className="dashboard-schedule-head">
        <div className="dashboard-schedule-title">
          <MdOutlineSchedule className="dashboard-schedule-title-icon" />
          <h2>{t('dashboard.schedule.title')}</h2>
        </div>

        <div className="dashboard-schedule-tabs" role="tablist">
          {WEEK_DAYS.map((day) => {
            const isActive = selectedDay === day.name;
            const isToday = todayName === day.name;
            return (
              <button
                key={day.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={[
                  'dashboard-schedule-tab',
                  isActive ? 'is-active' : '',
                  isToday ? 'is-today' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setSelectedDay(day.name)}
              >
                {t(`dashboard.schedule.days.${day.short}`)}
              </button>
            );
          })}
        </div>
      </header>

      {entries.length === 0 ? (
        <div className="dashboard-schedule-empty">
          <FaRegCalendarCheck className="dashboard-schedule-empty-icon" />
          <p>{t('dashboard.schedule.empty')}</p>
        </div>
      ) : (
        <ol className="dashboard-schedule-list" key={selectedDay}>
          {entries.map((entry, index) => {
            const url = entry.type === 'class' ? generateGroupUrl(entry) : null;
            const className = [
              'dashboard-schedule-item',
              `is-${entry.type}`,
              entry.isLive ? 'is-live' : '',
              entry.isPast ? 'is-past' : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <li
                key={entry.id}
                className="dashboard-schedule-row"
                style={{
                  '--row-color': entry.color,
                  '--row-delay': `${index * 0.04}s`,
                }}
              >
                {url ? (
                  <Link to={url} className={className}>
                    {renderItemContent(entry)}
                  </Link>
                ) : (
                  <div className={className}>{renderItemContent(entry)}</div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
};

export default DashboardScheduleCard;
