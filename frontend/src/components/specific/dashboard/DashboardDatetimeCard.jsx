import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FaChevronLeft,
  FaChevronRight,
  FaChalkboardTeacher,
  FaCoffee,
  FaLeaf,
  FaSmileBeam,
  FaUmbrellaBeach,
  FaSun,
} from 'react-icons/fa';
import { useAppContext } from '../../../context/AppContext';
import './DashboardDatetimeCard.css';

const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const pad2 = (n) => String(n).padStart(2, '0');

const FREE_ICONS = [FaCoffee, FaSmileBeam, FaLeaf];
const WEEKEND_ICONS = [FaUmbrellaBeach, FaSun];

const DashboardDatetimeCard = ({ schedule = [] }) => {
  const { t, i18n } = useTranslation();
  const { groups, subjects } = useAppContext();
  const [now, setNow] = useState(() => new Date());
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const locale = i18n.language?.startsWith('es') ? 'es-MX' : 'en-US';

  const weekdayLong = now.toLocaleDateString(locale, { weekday: 'long' });
  const monthLong = now.toLocaleDateString(locale, { month: 'long' });
  const dayNumber = now.getDate();
  const year = now.getFullYear();

  const hours = pad2(now.getHours());
  const minutes = pad2(now.getMinutes());
  const seconds = pad2(now.getSeconds());

  const subjectsMap = useMemo(
    () => subjects.reduce((acc, s) => ({ ...acc, [s.id]: s }), {}),
    [subjects]
  );

  const groupsMap = useMemo(
    () => groups.reduce((acc, g) => ({ ...acc, [g.id]: g }), {}),
    [groups]
  );

  const getGroupDisplayText = (group) => {
    if (!group) return '';
    const subjectName = subjectsMap[group.subjectId]?.name || '...';
    return `${group.grade}${group.name} - ${subjectName}`;
  };

  const status = useMemo(() => {
    const dayIndex = now.getDay();
    const isWeekend = dayIndex === 0 || dayIndex === 6;
    const freeKeys = ['free1', 'free2', 'free3', 'free4'];
    const weekendKeys = ['weekend1', 'weekend2', 'weekend3'];
    const messageIndex = Math.floor((now.getHours() * 60 + now.getMinutes()) / 20);

    if (isWeekend) {
      const key = weekendKeys[messageIndex % weekendKeys.length];
      return {
        type: 'weekend',
        message: t(`dashboard.status.${key}`),
        Icon: WEEKEND_ICONS[messageIndex % WEEKEND_ICONS.length],
      };
    }

    const currentDay = DAY_NAMES[dayIndex];
    const currentTime = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
    const activeEntry = schedule.find(
      (entry) =>
        entry.dayOfWeek === currentDay &&
        entry.startTime <= currentTime &&
        entry.endTime > currentTime
    );

    if (activeEntry) {
      const group = groupsMap[activeEntry.groupId];
      const groupLabel = getGroupDisplayText(group) || t('dashboard.status.unknownGroup');
      return {
        type: 'class',
        message: t('dashboard.status.inClass', { group: groupLabel }),
        Icon: FaChalkboardTeacher,
        color: group?.color,
      };
    }

    const key = freeKeys[messageIndex % freeKeys.length];
    return {
      type: 'free',
      message: t(`dashboard.status.${key}`),
      Icon: FREE_ICONS[messageIndex % FREE_ICONS.length],
    };
  }, [now, schedule, groupsMap, subjectsMap, t]);

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();
  const viewMonthLabel = viewDate.toLocaleDateString(locale, {
    month: 'long',
    year: 'numeric',
  });

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells = [];

    for (let i = firstDay - 1; i >= 0; i -= 1) {
      cells.push({
        key: `prev-${daysInPrevMonth - i}`,
        day: daysInPrevMonth - i,
        outside: true,
        isToday: false,
      });
    }

    const today = new Date();
    for (let day = 1; day <= daysInMonth; day += 1) {
      const isToday =
        day === today.getDate() &&
        viewMonth === today.getMonth() &&
        viewYear === today.getFullYear();
      cells.push({
        key: `cur-${day}`,
        day,
        outside: false,
        isToday,
      });
    }

    const remaining = 42 - cells.length;
    for (let day = 1; day <= remaining; day += 1) {
      cells.push({
        key: `next-${day}`,
        day,
        outside: true,
        isToday: false,
      });
    }

    return cells;
  }, [viewYear, viewMonth]);

  const goPrevMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goNextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToday = () => {
    const d = new Date();
    setViewDate(new Date(d.getFullYear(), d.getMonth(), 1));
  };

  const StatusIcon = status.Icon;

  return (
    <section className="dashboard-datetime" aria-label={t('dashboard.datetimeLabel')}>
      <div className="dashboard-datetime-glow" aria-hidden="true" />

      <div className="dashboard-datetime-time">
        <div className="dashboard-datetime-date-row">
          <div className="dashboard-datetime-date-main">
            <span className="dashboard-datetime-day">{dayNumber}</span>
            <div className="dashboard-datetime-month-year">
              <span className="dashboard-datetime-month">{monthLong}</span>
              <span className="dashboard-datetime-year">{year}</span>
            </div>
          </div>
          <p className="dashboard-datetime-weekday">{weekdayLong}</p>
        </div>

        <div className="dashboard-datetime-clock" aria-live="polite">
          <span className="dashboard-datetime-digit">{hours}</span>
          <span className="dashboard-datetime-colon">:</span>
          <span className="dashboard-datetime-digit">{minutes}</span>
          <span className="dashboard-datetime-colon">:</span>
          <span key={seconds} className="dashboard-datetime-digit dashboard-datetime-seconds">
            {seconds}
          </span>
        </div>

        <div
          key={`${status.type}-${status.message}`}
          className={`dashboard-datetime-status is-${status.type}`}
          style={status.color ? { '--status-accent': status.color } : undefined}
          role="status"
        >
          <span className="dashboard-datetime-status-icon">
            <StatusIcon />
          </span>
          <p className="dashboard-datetime-status-text">{status.message}</p>
        </div>
      </div>

      <div className="dashboard-datetime-calendar">
        <div className="dashboard-datetime-cal-header">
          <button
            type="button"
            className="dashboard-datetime-nav"
            onClick={goPrevMonth}
            aria-label={t('dashboard.prevMonth')}
          >
            <FaChevronLeft />
          </button>
          <button type="button" className="dashboard-datetime-month-btn" onClick={goToday}>
            {viewMonthLabel}
          </button>
          <button
            type="button"
            className="dashboard-datetime-nav"
            onClick={goNextMonth}
            aria-label={t('dashboard.nextMonth')}
          >
            <FaChevronRight />
          </button>
        </div>

        <div className="dashboard-datetime-weekdays">
          {WEEKDAY_KEYS.map((key) => (
            <span key={key} className="dashboard-datetime-weekday-cell">
              {t(`dashboard.weekdays.${key}`)}
            </span>
          ))}
        </div>

        <div className="dashboard-datetime-days" key={`${viewYear}-${viewMonth}`}>
          {calendarDays.map((cell) => (
            <span
              key={cell.key}
              className={[
                'dashboard-datetime-day-cell',
                cell.outside ? 'is-outside' : '',
                cell.isToday ? 'is-today' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {cell.day}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DashboardDatetimeCard;
