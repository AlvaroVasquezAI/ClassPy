import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import { BsQrCodeScan } from 'react-icons/bs';
import { FaRegUserCircle } from 'react-icons/fa';
import { apiClient } from '../services/apiClient';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import './AttendancePage.css';
import './StudentsPage.css';

const API_BASE_URL = `http://${window.location.hostname}:8000`;

const PERIODS = [
  { id: 1, name: 'Period 1' },
  { id: 2, name: 'Period 2' },
  { id: 3, name: 'Period 3' },
];

const GREETINGS = ['Hello...', 'Hola...', 'Bonjour...', 'Ciao...', 'Olá...'];

const AttendancePage = () => {
  const { t, i18n } = useTranslation();
  const { groups, subjects } = useAppContext();

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
    if (isFlipped) {
      setIsTyping(false);
      return;
    }
    setIsTyping(true);
    const fullGreeting = GREETINGS[greetingIndex];
    if (displayedGreeting.length < fullGreeting.length) {
      typingTimerRef.current = setTimeout(() => {
        setDisplayedGreeting(fullGreeting.slice(0, displayedGreeting.length + 1));
      }, 150);
    } else {
      greetingLoopTimerRef.current = setTimeout(() => {
        setDisplayedGreeting('');
        setGreetingIndex((prevIndex) => (prevIndex + 1) % GREETINGS.length);
      }, 2000);
    }
    return () => {
      clearTimeout(typingTimerRef.current);
      clearTimeout(greetingLoopTimerRef.current);
    }
  }, [displayedGreeting, greetingIndex, isFlipped]);

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

  return (
    <div className="attendance-container">
      <header className="attendance-header">
        <div className="header-top-row">
          <div className="attendance-title">
            <BsQrCodeScan size="2rem" />
            <h1>{t('navbar.attendance')}</h1>
          </div>
          <div className="period-selector">
            <label htmlFor="period-select">{t('attendancePage.table.period')}:</label>
            <select 
              id="period-select"
              className="period-select"
              value={selectedPeriodId}
              onChange={(e) => setSelectedPeriodId(parseInt(e.target.value))}
              onFocus={() => setIsFocusPaused(true)}
              onBlur={() => setIsFocusPaused(false)}
            >
              {PERIODS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>
        <div className="group-filters">
          <button
            className={`group-filter-btn ${selectedGroupId === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedGroupId('all')}
          >
            {t('attendancePage.allGroups')}
          </button>
          {groups.map(group => (
            <button
              key={group.id}
              className={`group-filter-btn ${selectedGroupId === group.id ? 'active' : ''}`}
              onClick={() => setSelectedGroupId(group.id)}
            >
              {getGroupDisplayText(group)}
            </button>
          ))}
        </div>
      </header>
      
      <div className="scan-grid-container">
        <div className="calendar-card">
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            filterDate={isWeekday}
            inline
          />
        </div>

        <div className="scan-status-card">
          <BsQrCodeScan className="scanner-icon" />
          <div className="scan-text-content">
            <p className="scan-prompt">{t('attendancePage.readyTitle')}</p>
            <p className="scan-sub-prompt">{t('attendancePage.readySubtitle')}</p>
          </div>
        </div>

        <div className={`last-scan-card ${isFlipped ? 'flipped' : ''}`}>
          <div className="flip-card-inner">
            <div className="flip-card-front">
              <div className="scan-placeholder-content">
                <FaRegUserCircle className="placeholder-icon" />
                <div className="scanline"></div>
              </div>
              <h3 className="greeting-text">
                {displayedGreeting}
                {isTyping && <span className="typing-cursor"></span>}
              </h3>
            </div>
            <div className="flip-card-back">
              {lastScannedRecord && (
                <React.Fragment key={lastScannedRecord.id}>
                  <div className="scan-details-top">
                    <img 
                      src={`${API_BASE_URL}/api/qr-code/${lastScannedRecord.student.qrCodeId}.png`} 
                      alt="Student QR Code"
                      className="student-qr-image"
                    />
                    <p className="student-qrid">{lastScannedRecord.student.qrCodeId}</p>
                  </div>
                  <h2 className="student-name">{`${lastScannedRecord.student.firstName} ${lastScannedRecord.student.lastName}`}</h2>
                  <p className="student-period">{lastScannedRecord.period.name}</p>
                </React.Fragment>
              )}
            </div>
          </div>
        </div>

        {scanError && <div className="scan-error-feedback">{scanError}</div>}
      </div>

      <form onSubmit={handleScanSubmit}>
        <input
          ref={qrInputRef}
          type="text"
          className="qr-input"
          value={qrInputValue}
          onChange={(e) => setQrInputValue(e.target.value)}
          autoFocus
        />
      </form>

      <div className="attendance-table-container">
        <div className="table-header">
            <div className="table-title-section">
                <h3>{t('attendancePage.recordsFor')} {selectedDate.toLocaleDateString(i18n.language)}</h3>
                <div className="active-filters-display">
                    <span className="filter-tag">
                        {t('attendancePage.table.period')}: <strong>{PERIODS.find(p => p.id === selectedPeriodId)?.name}</strong>
                    </span>
                    <span className="filter-tag">
                        {t('attendancePage.table.group')}: <strong>
                            {selectedGroupId === 'all'
                                ? t('attendancePage.allGroups')
                                : getGroupDisplayText(groups.find(g => g.id === parseInt(selectedGroupId)))
                            }
                        </strong>
                    </span>
                </div>
            </div>
            <div className="record-count-card">
                <span className="count">{filteredAttendance.length}</span>
                <span className="label">{t('attendancePage.totalRecords')}</span>
            </div>
        </div>
        <div className="students-table-container" style={{padding: 0, border: 'none', backgroundColor: 'transparent'}}>
            <table className="students-table">
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
                        <tr><td colSpan="7" style={{textAlign: 'center'}}>Loading...</td></tr>
                    ) : filteredAttendance.length > 0 ? (
                        filteredAttendance.map(record => (
                            <tr key={record.id}>
                                <td>
                                  {new Date(record.timestamp + 'Z').toLocaleTimeString(i18n.language, {
                                    timeZone: 'America/Mexico_City',
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true,
                                  })}
                                </td>
                                <td><strong>{record.student?.lastName}</strong></td>
                                <td>{record.student?.firstName}</td>
                                <td>{`${record.student?.group?.grade || ''}${record.student?.group?.name || ''}`}</td>
                                <td>{record.student?.group?.subject?.name || 'N/A'}</td>
                                <td>{record.period?.name || 'N/A'}</td>
                                <td>{record.student?.qrCodeId}</td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="7" className="no-students-message">{t('attendancePage.noRecords')}</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;