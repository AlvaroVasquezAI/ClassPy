import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../services/apiClient';
import {
  FaGoogle, FaUsers, FaUserGraduate, FaClipboardList, FaCheckCircle, FaTimesCircle,
  FaHourglassHalf, FaUserSlash, FaUndo, FaExclamationCircle, FaClock, FaRedo, FaFileAlt,
  FaFlask, FaLeaf, FaChalkboardTeacher,
} from 'react-icons/fa';
import { SiGoogleclassroom } from 'react-icons/si';
import './ClassroomPage.css';

const getCourseVisual = (courseName = '') => {
  const name = courseName.toLowerCase();
  if (name.includes('bio')) {
    return { accent: 'green', Icon: FaLeaf };
  }
  if (name.includes('quím') || name.includes('quim') || name.includes('chem')) {
    return { accent: 'teal', Icon: FaFlask };
  }
  return { accent: 'sage', Icon: FaChalkboardTeacher };
};

const hasAssignedGrade = (sub) => sub.assignedGrade !== undefined && sub.assignedGrade !== null;

/** Returned with no score, or explicitly returned as 0 — treated as "returned with zero". */
const isReturnedWithZero = (sub) => {
  if (sub.state !== 'RETURNED') return false;
  if (!hasAssignedGrade(sub)) return true;
  return Number(sub.assignedGrade) === 0;
};

const wasSubmitted = (state) =>
  state === 'TURNED_IN' ||
  state === 'RETURNED' ||
  state === 'RECLAIMED_BY_STUDENT' ||
  state === 'STUDENT_EDITED_AFTER_TURN_IN';

/** Bucket used by counts + filters (matches teacher-facing status groups). */
const getSubmissionBucket = (sub) => {
  if (sub.state === 'RETURNED') {
    return isReturnedWithZero(sub) ? 'returnedUngraded' : 'returned';
  }
  if (sub.state === 'TURNED_IN' || sub.state === 'STUDENT_EDITED_AFTER_TURN_IN') {
    return 'turnedIn';
  }
  if (sub.state === 'NEW') {
    return 'noAccess';
  }
  return 'created';
};

const getStatusMeta = (sub, t) => {
  switch (sub.state) {
    case 'RETURNED':
      if (isReturnedWithZero(sub)) {
        return {
          key: 'returned-ungraded',
          label: t('classroom.returnedUngraded'),
          hint: t('classroom.statusHints.returnedUngraded'),
        };
      }
      return {
        key: 'returned',
        label: t('classroom.returned'),
        hint: t('classroom.statusHints.returned'),
      };
    case 'TURNED_IN':
    case 'STUDENT_EDITED_AFTER_TURN_IN':
      return {
        key: 'turned-in',
        label: t('classroom.turnedIn'),
        hint: t('classroom.statusHints.turnedIn'),
      };
    case 'RECLAIMED_BY_STUDENT':
      return {
        key: 'reclaimed',
        label: t('classroom.reclaimed'),
        hint: t('classroom.statusHints.reclaimed'),
      };
    case 'NEW':
      return {
        key: 'no-access',
        label: t('classroom.noAccess'),
        hint: t('classroom.statusHints.noAccess'),
      };
    case 'CREATED':
    default:
      return {
        key: 'assigned',
        label: t('classroom.assigned'),
        hint: t('classroom.statusHints.assigned'),
      };
  }
};

/** Extra flags that sit beside the primary status; empty when nothing unusual applies. */
const getSubmissionFlags = (sub, t, courseWork) => {
  const flags = [];
  const assignmentStillOpen = courseWork?.state === 'PUBLISHED';
  if (sub.late) {
    if (wasSubmitted(sub.state)) {
      flags.push({
        key: 'late',
        label: t('classroom.flags.late'),
        hint: t('classroom.flagHints.late'),
      });
    } else {
      // NEW / CREATED after the due date — not the same as "assignment closed"
      flags.push({
        key: 'past-due',
        label: t('classroom.flags.pastDue'),
        hint: assignmentStillOpen
          ? t('classroom.flagHints.pastDueStillOpen')
          : t('classroom.flagHints.pastDueClosed'),
      });
    }
  }
  if (sub.state === 'STUDENT_EDITED_AFTER_TURN_IN') {
    flags.push({
      key: 'resubmitted',
      label: t('classroom.flags.resubmitted'),
      hint: t('classroom.flagHints.resubmitted'),
    });
  }
  if (
    sub.draftGrade !== undefined &&
    sub.draftGrade !== null &&
    !hasAssignedGrade(sub) &&
    sub.state !== 'RETURNED'
  ) {
    flags.push({
      key: 'draft',
      label: t('classroom.flags.draft'),
      hint: t('classroom.flagHints.draft'),
    });
  }
  return flags;
};

const formatSubmissionGrade = (sub, maxPoints) => {
  if (!hasAssignedGrade(sub)) return '—';
  const score = sub.assignedGrade;
  if (maxPoints === undefined || maxPoints === null || maxPoints === '') return String(score);
  return `${score}/${maxPoints}`;
};

/** Parse Google Classroom dueDate (+ optional dueTime) into a Date, or null. */
const getCourseWorkDueDate = (courseWork) => {
  const d = courseWork?.dueDate;
  if (!d?.year || !d?.month || !d?.day) return null;
  const hours = courseWork?.dueTime?.hours ?? 23;
  const minutes = courseWork?.dueTime?.minutes ?? 59;
  const seconds = courseWork?.dueTime?.seconds ?? 59;
  const date = new Date(Date.UTC(d.year, d.month - 1, d.day, hours, minutes, seconds));
  return Number.isNaN(date.getTime()) ? null : date;
};

/**
 * Assignment lifecycle for teachers:
 * - accepting: published, before due date (or no due date)
 * - accepting-late: published, after due date (late work still welcome)
 * - completed: no longer published / closed in Classroom
 */
const getAssignmentLifecycle = (courseWork, t) => {
  if (courseWork?.state !== 'PUBLISHED') {
    return {
      key: 'completed',
      label: t('classroom.assignmentStatus.completed'),
      hint: t('classroom.assignmentStatusHints.completed'),
    };
  }

  const due = getCourseWorkDueDate(courseWork);
  if (due && due.getTime() < Date.now()) {
    return {
      key: 'accepting-late',
      label: t('classroom.assignmentStatus.acceptingLate'),
      hint: t('classroom.assignmentStatusHints.acceptingLate'),
    };
  }

  return {
    key: 'accepting',
    label: t('classroom.assignmentStatus.accepting'),
    hint: t('classroom.assignmentStatusHints.accepting'),
  };
};

const SubmissionStatusIcon = ({ statusKey }) => {
  switch (statusKey) {
    case 'returned':
      return <FaCheckCircle className="status-icon returned" aria-hidden="true" />;
    case 'returned-ungraded':
      return <FaExclamationCircle className="status-icon returned-ungraded" aria-hidden="true" />;
    case 'turned-in':
      return <FaHourglassHalf className="status-icon turned-in" aria-hidden="true" />;
    case 'no-access':
      return <FaUserSlash className="status-icon no-access" aria-hidden="true" />;
    case 'reclaimed':
      return <FaUndo className="status-icon reclaimed" aria-hidden="true" />;
    case 'assigned':
    default:
      return <FaTimesCircle className="status-icon created" aria-hidden="true" />;
  }
};

const FlagIcon = ({ flagKey }) => {
  switch (flagKey) {
    case 'late':
    case 'past-due':
      return <FaClock aria-hidden="true" />;
    case 'resubmitted':
      return <FaRedo aria-hidden="true" />;
    case 'draft':
      return <FaFileAlt aria-hidden="true" />;
    default:
      return null;
  }
};

const ClassroomPage = () => {
  const { teacherInfo } = useAppContext();
  const { t } = useTranslation();
  
  const [courses, setCourses] = useState([]);
  const [courseWorkMap, setCourseWorkMap] = useState({});
  const [rostersMap, setRostersMap] = useState({});
  const [googleUser, setGoogleUser] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [submissionFilter, setSubmissionFilter] = useState('all');
  const [loading, setLoading] = useState({ initial: false, details: false, submissions: false });
  const [error, setError] = useState('');

  useEffect(() => {
    if (teacherInfo?.isGoogleConnected) {
      setLoading(prev => ({ ...prev, initial: true }));
      setError('');
      const initialFetch = async () => {
        try {
          const [coursesData, profileData] = await Promise.all([ apiClient.getClassroomCourses(), apiClient.getGoogleUserProfile() ]);
          setCourses(coursesData);
          setGoogleUser(profileData);
          const courseWorkPromises = coursesData.map(c => apiClient.getClassroomCourseWork(c.id).then(work => ({ courseId: c.id, work })));
          const rosterPromises = coursesData.map(c => apiClient.getClassroomRoster(c.id).then(roster => ({ courseId: c.id, roster })));
          const [courseWorkResults, rosterResults] = await Promise.all([ Promise.all(courseWorkPromises), Promise.all(rosterPromises) ]);
          const newCourseWorkMap = courseWorkResults.reduce((acc, { courseId, work }) => { acc[courseId] = work || []; return acc; }, {});
          const newRostersMap = rosterResults.reduce((acc, { courseId, roster }) => { acc[courseId] = roster || []; return acc; }, {});
          setCourseWorkMap(newCourseWorkMap);
          setRostersMap(newRostersMap);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(prev => ({ ...prev, initial: false }));
        }
      };
      initialFetch();
    }
  }, [teacherInfo]);
  
  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setSelectedAssignment(null);
    setSubmissions([]);
    setSubmissionFilter('all');
  };
  const handleAssignmentSelect = (assignment) => {
    setSelectedAssignment(assignment);
    setSubmissionFilter('all');
    setLoading(prev => ({ ...prev, submissions: true }));
    setError('');
    apiClient.getClassroomSubmissions(selectedCourse.id, assignment.id)
      .then(setSubmissions)
      .catch(err => setError(err.message))
      .finally(() => setLoading(prev => ({ ...prev, submissions: false })));
  };
  const studentsMap = useMemo(() => { if (!rostersMap[selectedCourse?.id]) return new Map(); return new Map(rostersMap[selectedCourse.id].map(s => [s.userId, s.profile])); }, [rostersMap, selectedCourse]);
  const totalStudents = useMemo(() => { const allStudentIds = new Set(); Object.values(rostersMap).forEach(roster => { roster.forEach(student => allStudentIds.add(student.userId)); }); return allStudentIds.size; }, [rostersMap]);
  const submissionCounts = useMemo(() => {
    const counts = { returned: 0, returnedUngraded: 0, turnedIn: 0, created: 0, noAccess: 0, all: 0 };
    if (!submissions || submissions.length === 0) return counts;
    counts.all = submissions.length;
    submissions.forEach((sub) => {
      counts[getSubmissionBucket(sub)] += 1;
    });
    return counts;
  }, [submissions]);
  const filteredSubmissions = useMemo(() => {
    if (!submissions || submissions.length === 0) return [];
    if (submissionFilter === 'all') return submissions;
    return submissions.filter((sub) => getSubmissionBucket(sub) === submissionFilter);
  }, [submissions, submissionFilter]);

  const formatDate = (dateInput) => { if (!dateInput) return t('classroom.noDate'); if (dateInput.year && dateInput.month && dateInput.day) { const date = new Date(Date.UTC(dateInput.year, dateInput.month - 1, dateInput.day)); if (!isNaN(date)) { return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }); } } if (typeof dateInput === 'string') { const date = new Date(dateInput); if (!isNaN(date)) { return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }); } } return 'Invalid Date'; };

  if (!teacherInfo) {
    return (
      <div className="classroom-page">
        <div className="classroom-atmosphere" aria-hidden="true" />
        <div className="classroom-loading">{t('classroom.loading')}</div>
      </div>
    );
  }

  if (!teacherInfo.isGoogleConnected) {
    return (
      <div className="classroom-page">
        <div className="classroom-atmosphere" aria-hidden="true" />
        <div className="classroom-container">
          <div className="connect-container-wrapper">
            <div className="connect-container">
              <SiGoogleclassroom className="connect-icon" />
              <h2>{t('classroom.connectTitle')}</h2>
              <p>{t('classroom.connectSubtitle')}</p>
              <button onClick={() => window.location.href=`http://${window.location.hostname}:8000/api/auth/google/login`} className="connect-button">
                <FaGoogle />
                <span>{t('classroom.connectButton')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="classroom-page">
      <div className="classroom-atmosphere" aria-hidden="true" />
      <div className="classroom-container">
      {error && <div className="error-message">{error}</div>}
      <header className="classroom-header-card">
        <div className="header-brand">
          <SiGoogleclassroom className="brand-icon" />
          <h1>{t('classroom.headerTitle')}</h1>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <FaUsers />
            <span>{t('classroom.groups')}</span>
            <span className="stat-badge">{courses.length}</span>
          </div>
          <div className="stat-item">
            <FaUserGraduate />
            <span>{t('classroom.totalStudents')}</span>
            <span className="stat-badge">{totalStudents}</span>
          </div>
        </div>
        {googleUser && (
          <div className="header-user">
            <FaGoogle />
            <span>{googleUser.email}</span>
          </div>
        )}
      </header>
      
      <div className={`classroom-body ${!selectedCourse ? 'groups-only' : ''}`}>
        <aside className="classroom-section classroom-section-groups">
          <div className="sidebar-header">
            <h3>
              <FaUsers className="sidebar-icon" />
              <span className="sidebar-header-label">{t('classroom.groups')}</span>
            </h3>
          </div>
          {loading.initial ? <p className="classroom-inline-loading">{t('classroom.loading')}</p> : (
            <ul className="course-list">
              {courses.map(course => {
                const { accent, Icon } = getCourseVisual(course.name);
                return (
                  <li
                    key={course.id}
                    className={`course-list-item accent-${accent} ${selectedCourse?.id === course.id ? 'active' : ''}`}
                    onClick={() => handleCourseSelect(course)}
                  >
                    <span className="course-icon-wrap" aria-hidden="true">
                      <Icon className="course-icon" />
                    </span>
                    <div className="course-list-item-main">
                      <span className="course-name">{course.name}</span>
                      <div className="badges-container">
                        <div className="badge-item badge-students" title={t('classroom.students')}>
                          <FaUserGraduate />
                          <span className="assignment-count-badge">{rostersMap[course.id]?.length || 0}</span>
                        </div>
                        <div className="badge-item badge-tasks" title={t('classroom.assignments')}>
                          <FaClipboardList />
                          <span className="assignment-count-badge">{courseWorkMap[course.id]?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>
        
        <main className="classroom-section classroom-section-detail">
          {!selectedCourse ? (
            <div className="placeholder-text">
              <SiGoogleclassroom />
              <p>{t('classroom.selectGroupPrompt')}</p>
            </div>
          ) : (
            <div className="detail-scroll">
              <header className="course-header">
                <h2>{selectedCourse.name}</h2>
                <div className="course-code-container"><span>{t('classroom.classCode')}</span><code>{selectedCourse.enrollmentCode}</code></div>
              </header>
              <section className="assignments-container">
                <h3>{t('classroom.assignments')}</h3>
                <div className="assignments-grid">
                  {(courseWorkMap[selectedCourse.id] || []).map(cw => {
                    const lifecycle = getAssignmentLifecycle(cw, t);
                    return (
                    <button
                      type="button"
                      key={cw.id}
                      className={`assignment-card ${selectedAssignment?.id === cw.id ? 'selected' : ''}`}
                      onClick={() => handleAssignmentSelect(cw)}
                    >
                      <span className="assignment-title">{cw.title || t('classroom.assignments')}</span>
                      <span className="assignment-details">
                        <span><strong>{t('classroom.created')}:</strong> {formatDate(cw.creationTime)}</span>
                        <span><strong>{t('classroom.due')}:</strong> {formatDate(cw.dueDate)}</span>
                      </span>
                      <span
                        className={`assignment-status status-${lifecycle.key}`}
                        title={lifecycle.hint}
                      >
                        {lifecycle.label}
                      </span>
                    </button>
                    );
                  })}
                </div>
              </section>
              {selectedAssignment && (
                <section className="submissions-container">
                  <header className="submissions-header">
                    <h3>{t('classroom.submissionsFor', { assignmentTitle: selectedAssignment.title })}</h3>
                    <div className="submission-counts" role="group" aria-label={t('classroom.filterByStatus')}>
                      {[
                        { key: 'all', className: 'all', label: t('classroom.filterAll'), count: submissionCounts.all, hint: t('classroom.filterAllHint') },
                        { key: 'returned', className: 'returned', label: t('classroom.returned'), count: submissionCounts.returned, hint: t('classroom.statusHints.returned') },
                        { key: 'returnedUngraded', className: 'returned-ungraded', label: t('classroom.returnedUngraded'), count: submissionCounts.returnedUngraded, hint: t('classroom.statusHints.returnedUngraded') },
                        { key: 'turnedIn', className: 'turned-in', label: t('classroom.turnedIn'), count: submissionCounts.turnedIn, hint: t('classroom.statusHints.turnedIn') },
                        { key: 'created', className: 'assigned', label: t('classroom.assigned'), count: submissionCounts.created, hint: t('classroom.statusHints.assigned') },
                        { key: 'noAccess', className: 'no-access', label: t('classroom.noAccess'), count: submissionCounts.noAccess, hint: t('classroom.statusHints.noAccess') },
                      ].map((filter) => (
                        <button
                          key={filter.key}
                          type="button"
                          className={`count-pill ${filter.className}${submissionFilter === filter.key ? ' active' : ''}`}
                          title={filter.hint}
                          aria-pressed={submissionFilter === filter.key}
                          onClick={() => setSubmissionFilter(filter.key)}
                        >
                          <strong>{filter.label}:</strong> {filter.count}
                        </button>
                      ))}
                    </div>
                  </header>
                  <div className="submissions-grid">
                    {loading.submissions ? <p className="classroom-inline-loading">{t('classroom.loading')}</p> : filteredSubmissions.length === 0 ? (
                      <p className="classroom-inline-loading">{t('classroom.noSubmissionsInFilter')}</p>
                    ) : filteredSubmissions.map(sub => {
                      const studentProfile = studentsMap.get(sub.userId);
                      const status = getStatusMeta(sub, t);
                      const flags = getSubmissionFlags(sub, t, selectedAssignment);
                      return (
                        <div key={sub.id} className="submission-card">
                          <div className="student-info">
                            <span className="student-name">{studentProfile?.name?.fullName || t('classroom.unknownStudent')}</span>
                            <span className="student-id">ID: {sub.userId}</span>
                          </div>
                          <span className="submission-grade">
                            {formatSubmissionGrade(sub, selectedAssignment.maxPoints)}
                          </span>
                          <div className="submission-status-column">
                            <div
                              className={`submission-status-wrapper status-${status.key}`}
                              title={status.hint}
                            >
                              <SubmissionStatusIcon statusKey={status.key} />
                              <span className={`submission-state state-${status.key}`}>{status.label}</span>
                            </div>
                            {flags.length > 0 && (
                              <div className="submission-flags">
                                {flags.map(flag => (
                                  <span
                                    key={flag.key}
                                    className={`submission-flag flag-${flag.key}`}
                                    title={flag.hint}
                                  >
                                    <FlagIcon flagKey={flag.key} />
                                    {flag.label}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>
          )}
        </main>
      </div>
      </div>
    </div>
  );
};

export default ClassroomPage;