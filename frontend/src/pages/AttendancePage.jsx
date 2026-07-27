import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import { BsQrCodeScan } from 'react-icons/bs';
import { FaRegUserCircle, FaLock, FaLockOpen, FaUsers } from 'react-icons/fa';
import { apiClient } from '../services/apiClient';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import './AttendancePage.css';

const API_BASE_URL = `http://${window.location.hostname}:8000`;

const PERIODS = [
  { id: 1, name: '1' },
  { id: 2, name: '2' },
  { id: 3, name: '3' },
];

const AttendancePage = () => {
  const { t, i18n } = useTranslation();
  const { groups, subjects } = useAppContext();

  const greetings = useMemo(() => {
    const messages = t('attendancePage.greetings', { returnObjects: true });
    return Array.isArray(messages) ? messages : ['Hello!'];
  }, [t, i18n.language]);

  const [selectedPeriodId, setSelectedPeriodId] = useState(PERIODS[0].id);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [qrInputValue, setQrInputValue] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [lastScannedRecord, setLastScannedRecord] = useState(null);
  const [scanError, setScanError] = useState('');
  const [loading, setLoading] = useState(true);

  const [isFlipped, setIsFlipped] = useState(false);
  const [isFocusPaused, setIsFocusPaused] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState('all');

  const [schedule, setSchedule] = useState([]);
  const [isStrictMode, setIsStrictMode] = useState(false);
  const [lateThreshold, setLateThreshold] = useState(5);

  const [greetingIndex, setGreetingIndex] = useState(0);
  const [displayedGreeting, setDisplayedGreeting] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const qrInputRef = useRef(null);
  const scanTimerRef = useRef(null);
  const typingTimerRef = useRef(null);
  const greetingLoopTimerRef = useRef(null);
  const swapDataTimerRef = useRef(null);

  const filteredAttendance = useMemo(() => {
    if (selectedGroupId === 'all') {
      return attendanceRecords;
    }
    return attendanceRecords.filter(record => record.student?.group?.id === parseInt(selectedGroupId));
  }, [attendanceRecords, selectedGroupId]);

  const getGroupDisplayText = (group) => {
    if (!group) return '';
    const subjectName = subjects.find(s => s.id === group.subjectId)?.name || '...';
    return `${group.grade}${group.name} - ${subjectName}`;
  };

  useEffect(() => {
    apiClient.getSchedule().then(setSchedule).catch(console.error);
  }, []);

  const determineActiveGroup = useCallback(() => {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = days[now.getDay()];

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;

    const activeEntry = schedule.find(entry =>
      entry.dayOfWeek === currentDay &&
      entry.startTime <= currentTime &&
      entry.endTime > currentTime
    );

    if (activeEntry) {
      setSelectedGroupId(activeEntry.groupId);
    } else {
      setSelectedGroupId('all');
    }
  }, [schedule]);

  useEffect(() => {
    if (!isStrictMode) return;

    determineActiveGroup();
    const interval = setInterval(determineActiveGroup, 60000);

    return () => clearInterval(interval);
  }, [isStrictMode, determineActiveGroup]);

  useEffect(() => {
    setDisplayedGreeting('');
    setGreetingIndex(0);
  }, [i18n.language]);

  useEffect(() => {
    if (isFlipped) {
      setIsTyping(false);
      return;
    }
    if (!greetings.length) return;

    setIsTyping(true);
    const fullGreeting = greetings[greetingIndex % greetings.length];
    if (displayedGreeting.length < fullGreeting.length) {
      typingTimerRef.current = setTimeout(() => {
        setDisplayedGreeting(fullGreeting.slice(0, displayedGreeting.length + 1));
      }, 90);
    } else {
      greetingLoopTimerRef.current = setTimeout(() => {
        setDisplayedGreeting('');
        setGreetingIndex((prevIndex) => (prevIndex + 1) % greetings.length);
      }, 2200);
    }
    return () => {
      clearTimeout(typingTimerRef.current);
      clearTimeout(greetingLoopTimerRef.current);
    };
  }, [displayedGreeting, greetingIndex, isFlipped, greetings]);

  const fetchAttendance = useCallback(async (date) => {
    setLoading(true);
    try {
      const records = await apiClient.getAttendanceByDate(date);
      setAttendanceRecords(records);
    } catch (error) {
      setScanError('Could not fetch attendance records.');
      setAttendanceRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendance(selectedDate);
  }, [selectedDate, fetchAttendance]);

  useEffect(() => {
    const focusInterval = setInterval(() => {
      if (!isFocusPaused && qrInputRef.current) {
        qrInputRef.current.focus();
      }
    }, 1000);
    return () => {
      clearInterval(focusInterval);
      clearTimeout(scanTimerRef.current);
      clearTimeout(swapDataTimerRef.current);
    };
  }, [isFocusPaused]);

  const handleScanSubmit = async (e) => {
    e.preventDefault();
    if (!qrInputValue.trim()) return;

    clearTimeout(scanTimerRef.current);
    clearTimeout(swapDataTimerRef.current);
    setScanError('');

    try {
      const newRecord = await apiClient.createAttendanceRecord({
        studentQrId: qrInputValue,
        periodId: selectedPeriodId,
        strictMode: isStrictMode,
        lateThreshold: parseInt(lateThreshold),
      });

      if (isFlipped) {
        setIsFlipped(false);
        swapDataTimerRef.current = setTimeout(() => {
          setLastScannedRecord(newRecord);
          setIsFlipped(true);
        }, 300);
      } else {
        setLastScannedRecord(newRecord);
        setIsFlipped(true);
      }

      const today = new Date().toDateString();
      if (selectedDate.toDateString() === today) {
        fetchAttendance(new Date());
      }

      scanTimerRef.current = setTimeout(() => {
        setIsFlipped(false);
        swapDataTimerRef.current = setTimeout(() => {
          setLastScannedRecord(null);
          setDisplayedGreeting('');
          setGreetingIndex(0);
        }, 600);
      }, 10000);
    } catch (error) {
      setScanError(error.message);
      setIsFlipped(false);
      setLastScannedRecord(null);
      setTimeout(() => setScanError(''), 5000);
    }

    setQrInputValue('');
  };

  const isWeekday = (date) => {
    const day = date.getDay();
    return day !== 0 && day !== 6;
  };

  const selectedGroup = groups.find(g => g.id === parseInt(selectedGroupId, 10));

  return (
    <div className="attendance-page">
      <div className="attendance-atmosphere" aria-hidden="true" />

      <header className="attendance-header-card">
        <div className="attendance-header-brand">
          <BsQrCodeScan className="attendance-brand-icon" aria-hidden="true" />
          <h1 title={t('attendancePage.subtitle')}>{t('navbar.attendance')}</h1>
        </div>

        <div className="attendance-header-controls">
          <div className="attendance-period-block">
            <span className="attendance-control-label" id="period-label">
              {t('attendancePage.table.period')}
            </span>
            <div className="attendance-period-pills" role="group" aria-labelledby="period-label">
              {PERIODS.map(p => (
                <button
                  key={p.id}
                  type="button"
                  className={`attendance-period-pill${selectedPeriodId === p.id ? ' is-active' : ''}`}
                  onClick={() => setSelectedPeriodId(p.id)}
                  onFocus={() => setIsFocusPaused(true)}
                  onBlur={() => setIsFocusPaused(false)}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            className={`attendance-strict-toggle${isStrictMode ? ' is-active' : ''}`}
            onClick={() => setIsStrictMode(!isStrictMode)}
            title={t('attendancePage.strictModeTooltip')}
          >
            {isStrictMode ? <FaLock aria-hidden="true" /> : <FaLockOpen aria-hidden="true" />}
            <span>{t('attendancePage.strictMode')}</span>
          </button>

          {isStrictMode && (
            <div className="attendance-threshold">
              <label htmlFor="late-threshold">{t('attendancePage.lateThreshold')}</label>
              <input
                id="late-threshold"
                type="number"
                value={lateThreshold}
                onChange={(e) => setLateThreshold(e.target.value)}
                className="attendance-threshold-input"
                min="0"
                onFocus={() => setIsFocusPaused(true)}
                onBlur={() => setIsFocusPaused(false)}
              />
            </div>
          )}
        </div>
      </header>

      <section className="attendance-groups-card">
        <div className="attendance-groups-head">
          <FaUsers aria-hidden="true" />
          <h2>{t('attendancePage.filtersTitle')}</h2>
        </div>
        <div className="attendance-group-pills">
          <button
            type="button"
            className={`attendance-group-pill${selectedGroupId === 'all' ? ' is-active' : ''}`}
            onClick={() => setSelectedGroupId('all')}
          >
            {t('attendancePage.allGroups')}
          </button>
          {groups.map(group => (
            <button
              key={group.id}
              type="button"
              className={`attendance-group-pill${String(selectedGroupId) === String(group.id) ? ' is-active' : ''}`}
              style={{ '--pill-color': group.color || 'var(--primary-color)' }}
              onClick={() => setSelectedGroupId(group.id)}
            >
              {getGroupDisplayText(group)}
            </button>
          ))}
        </div>
      </section>

      <div className="attendance-scan-grid">
        <div className="attendance-calendar-card">
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            filterDate={isWeekday}
            inline
          />
        </div>

        <div className="attendance-ready-card">
          <div className="attendance-ready-icon-wrap">
            <BsQrCodeScan className="attendance-ready-icon" aria-hidden="true" />
          </div>
          <p className="attendance-ready-title">{t('attendancePage.readyTitle')}</p>
          <p className="attendance-ready-subtitle">{t('attendancePage.readySubtitle')}</p>
        </div>

        <div className={`attendance-scan-card${isFlipped ? ' is-flipped' : ''}`}>
          <div className="attendance-flip-inner">
            <div className="attendance-flip-front">
              <div className="attendance-scan-placeholder">
                <FaRegUserCircle className="attendance-placeholder-icon" aria-hidden="true" />
                <div className="attendance-scanline" aria-hidden="true" />
              </div>
              <h3 className="attendance-greeting">
                {displayedGreeting}
                {isTyping && <span className="attendance-typing-cursor" />}
              </h3>
            </div>
            <div className="attendance-flip-back">
              {lastScannedRecord && (
                <React.Fragment key={lastScannedRecord.id}>
                  <div className="attendance-scan-details">
                    <img
                      src={`${API_BASE_URL}/api/qr-code/${lastScannedRecord.student.qrCodeId}.png`}
                      alt="Student QR Code"
                      className="attendance-student-qr"
                    />
                    <p className="attendance-student-id">{lastScannedRecord.student.qrCodeId}</p>
                  </div>
                  <h2 className="attendance-student-name">
                    {`${lastScannedRecord.student.firstName} ${lastScannedRecord.student.lastName}`}
                  </h2>
                </React.Fragment>
              )}
            </div>
          </div>
        </div>

        {scanError && (
          <div className="attendance-scan-error" role="alert">
            {(() => {
              const [key, param] = scanError.split('||');
              return t(key, { groupName: param || '' });
            })()}
          </div>
        )}
      </div>

      <form onSubmit={handleScanSubmit}>
        <input
          ref={qrInputRef}
          type="text"
          className="attendance-qr-input"
          value={qrInputValue}
          onChange={(e) => setQrInputValue(e.target.value)}
          autoFocus
          aria-label="QR scanner input"
        />
      </form>

      <section className="attendance-records-card">
        <div className="attendance-records-head">
          <div className="attendance-records-title-block">
            <h2>
              {t('attendancePage.recordsFor')}{' '}
              {selectedDate.toLocaleDateString(i18n.language)}
            </h2>
            <div className="attendance-active-tags">
              <span className="attendance-filter-tag">
                {t('attendancePage.table.period')}:{' '}
                <strong>{PERIODS.find(p => p.id === selectedPeriodId)?.name}</strong>
              </span>
              <span className="attendance-filter-tag">
                {t('attendancePage.table.group')}:{' '}
                <strong>
                  {selectedGroupId === 'all'
                    ? t('attendancePage.allGroups')
                    : getGroupDisplayText(selectedGroup)}
                </strong>
              </span>
            </div>
          </div>
          <div className="attendance-record-stat">
            <span className="attendance-record-count">{filteredAttendance.length}</span>
            <span className="attendance-record-label">{t('attendancePage.totalRecords')}</span>
          </div>
        </div>

        <div className="attendance-table-wrap">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>{t('attendancePage.table.time')}</th>
                <th>{t('attendancePage.table.lastName')}</th>
                <th>{t('attendancePage.table.firstName')}</th>
                <th>{t('attendancePage.table.group')}</th>
                <th>{t('attendancePage.table.subject')}</th>
                <th>{t('attendancePage.table.period')}</th>
                <th>{t('attendancePage.table.qrId')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="attendance-empty">
                    {t('attendancePage.loading')}
                  </td>
                </tr>
              ) : filteredAttendance.length > 0 ? (
                filteredAttendance.map(record => (
                  <tr key={record.id} className={record.status === 'late' ? 'is-late' : ''}>
                    <td>
                      <span className="attendance-time-cell">
                        {new Date(record.timestamp + 'Z').toLocaleTimeString(i18n.language, {
                          timeZone: 'America/Mexico_City',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        })}
                        {record.status === 'late' && (
                          <span className="attendance-late-badge">{t('attendancePage.lateBadge')}</span>
                        )}
                      </span>
                    </td>
                    <td>
                      <strong className="attendance-name-cell">{record.student?.lastName}</strong>
                    </td>
                    <td>
                      <strong className="attendance-name-cell">{record.student?.firstName}</strong>
                    </td>
                    <td>
                      <span
                        className="attendance-chip"
                        style={{
                          '--chip-color':
                            record.student?.group?.color || 'var(--primary-color)',
                        }}
                      >
                        {`${record.student?.group?.grade || ''}${record.student?.group?.name || ''}`}
                      </span>
                    </td>
                    <td>
                      <span className="attendance-subject-cell">
                        {record.student?.group?.subject?.name || 'N/A'}
                      </span>
                    </td>
                    <td>{record.period?.name || 'N/A'}</td>
                    <td>
                      <span className="attendance-mono">{record.student?.qrCodeId}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="attendance-empty">
                    {t('attendancePage.noRecords')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AttendancePage;
