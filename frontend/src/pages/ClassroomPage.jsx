import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { apiClient } from '../services/apiClient';
import { FaGoogle, FaUsers, FaUserGraduate, FaClipboardList, FaCheckCircle, FaTimesCircle, FaHourglassHalf } from 'react-icons/fa';
import { SiGoogleclassroom } from 'react-icons/si';
import './ClassroomPage.css';

const SubmissionStatusIcon = ({ state }) => {
  switch (state) {
    case 'RETURNED':
      return <FaCheckCircle className="status-icon returned" title="Returned" />;
    case 'TURNED_IN':
      return <FaHourglassHalf className="status-icon turned-in" title="Turned In" />;
    case 'CREATED':
    default:
      return <FaTimesCircle className="status-icon created" title="Assigned (Missing)" />;
  }
};

const ClassroomPage = () => {
  const { teacherInfo } = useAppContext();
  const [courses, setCourses] = useState([]);
  const [courseWorkMap, setCourseWorkMap] = useState({});
  const [rostersMap, setRostersMap] = useState({});
  const [googleUser, setGoogleUser] = useState(null);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  const [loading, setLoading] = useState({ initial: false, details: false, submissions: false });
  const [error, setError] = useState('');

  useEffect(() => {
    if (teacherInfo?.isGoogleConnected) {
      setLoading(prev => ({ ...prev, initial: true }));
      setError('');
      
      const initialFetch = async () => {
        try {
          const [coursesData, profileData] = await Promise.all([
            apiClient.getClassroomCourses(),
            apiClient.getGoogleUserProfile(),
          ]);

          setCourses(coursesData);
          setGoogleUser(profileData);
          
          const courseWorkPromises = coursesData.map(c => apiClient.getClassroomCourseWork(c.id).then(work => ({ courseId: c.id, work })));
          const rosterPromises = coursesData.map(c => apiClient.getClassroomRoster(c.id).then(roster => ({ courseId: c.id, roster })));
          
          const [courseWorkResults, rosterResults] = await Promise.all([
              Promise.all(courseWorkPromises),
              Promise.all(rosterPromises)
          ]);

          const newCourseWorkMap = courseWorkResults.reduce((acc, { courseId, work }) => {
            acc[courseId] = work || [];
            return acc;
          }, {});
          
          const newRostersMap = rosterResults.reduce((acc, { courseId, roster }) => {
            acc[courseId] = roster || [];
            return acc;
          }, {});

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
  };
  
  const handleAssignmentSelect = (assignment) => {
    setSelectedAssignment(assignment);
    setLoading(prev => ({ ...prev, submissions: true }));
    setError('');
    apiClient.getClassroomSubmissions(selectedCourse.id, assignment.id)
      .then(setSubmissions)
      .catch(err => setError(err.message))
      .finally(() => setLoading(prev => ({ ...prev, submissions: false })));
  };

  const studentsMap = useMemo(() => {
    if (!rostersMap[selectedCourse?.id]) return new Map();
    return new Map(rostersMap[selectedCourse.id].map(s => [s.userId, s.profile]));
  }, [rostersMap, selectedCourse]);

  const totalStudents = useMemo(() => {
      const allStudentIds = new Set();
      Object.values(rostersMap).forEach(roster => {
          roster.forEach(student => allStudentIds.add(student.userId));
      });
      return allStudentIds.size;
  }, [rostersMap]);

  const submissionCounts = useMemo(() => {
    if (!submissions || submissions.length === 0) return { returned: 0, turnedIn: 0, created: 0 };
    return submissions.reduce((acc, sub) => {
      if (sub.state === 'RETURNED') acc.returned += 1;
      else if (sub.state === 'TURNED_IN') acc.turnedIn += 1;
      else acc.created += 1;
      return acc;
    }, { returned: 0, turnedIn: 0, created: 0 });
  }, [submissions]);
  
  const formatDate = (dateInput) => {
    if (!dateInput) return 'No date';
    if (dateInput.year && dateInput.month && dateInput.day) {
        const date = new Date(Date.UTC(dateInput.year, dateInput.month - 1, dateInput.day));
        if (!isNaN(date)) {
            return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
        }
    }
    if (typeof dateInput === 'string') {
        const date = new Date(dateInput);
        if (!isNaN(date)) {
            return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
        }
    }
    return 'Invalid Date';
  };

  if (!teacherInfo) {
    return <div>Loading teacher info...</div>;
  }

  if (!teacherInfo.isGoogleConnected) {
    return (
      <div className="classroom-container connect-container">
        <h2>Connect to Google Classroom</h2>
        <p>Link your Google account to import courses, assignments, and grades seamlessly.</p>
        <a href="http://localhost:8000/api/auth/google/login" className="connect-button">
          Connect with Google
        </a>
      </div>
    );
  }

  return (
    <div className="classroom-container">
      {error && <div className="error-message">{error}</div>}

      <header className="classroom-header-card">
        <div className="header-brand">
          <SiGoogleclassroom className="brand-icon" />
          <h1>Google Classroom</h1>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <FaUsers />
            <span>Groups</span>
            <span className="stat-badge">{courses.length}</span>
          </div>
          <div className="stat-item">
            <FaUserGraduate />
            <span>Total Students</span>
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
      
      <div className={`classroom-main-layout ${!selectedCourse ? 'sidebar-full-width' : ''}`}>
        <aside className="classroom-sidebar">
          <div className="sidebar-header">
            <h3>Groups</h3>
            <FaUsers classname="sidebar-icon"/>
          </div>
          
          {loading.initial ? <p>Loading...</p> : (
            <ul className="course-list">
              {courses.map(course => (
                <li key={course.id} className={`course-list-item ${selectedCourse?.id === course.id ? 'active' : ''}`} onClick={() => handleCourseSelect(course)}>
                  <span className="course-name">{course.name}</span>
                  <div className="badges-container">
                    <div className="badge-item" title="Students"><FaUserGraduate /><span className="assignment-count-badge">{rostersMap[course.id]?.length || 0}</span></div>
                    <div className="badge-item" title="Assignments"><FaClipboardList /><span className="assignment-count-badge">{courseWorkMap[course.id]?.length || 0}</span></div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>
        
        <main className="classroom-content">
          {!selectedCourse ? (
            <div className="placeholder-text">
              <SiGoogleclassroom />
              <p>Select a group to view its details.</p>
            </div>
          ) : (
            <>
              <header className="course-header">
                <h2>{selectedCourse.name}</h2>
                <div className="course-code-container"><span>Class Code</span><code>{selectedCourse.enrollmentCode}</code></div>
              </header>
              
              <section className="assignments-container">
                <h3>Assignments</h3>
                <div className="assignments-grid">
                  {(courseWorkMap[selectedCourse.id] || []).map(cw => (
                    <div key={cw.id} className={`assignment-card ${selectedAssignment?.id === cw.id ? 'selected' : ''}`} onClick={() => handleAssignmentSelect(cw)}>
                      <h4 className="assignment-title">{cw.title}</h4>
                      <div className="assignment-details">
                        <span><strong>Created:</strong> {formatDate(cw.creationTime)}</span>
                        <span><strong>Due:</strong> {formatDate(cw.dueDate)}</span>
                      </div>
                      <div className={`assignment-status ${cw.state === 'PUBLISHED' ? 'open' : 'closed'}`}>
                        {cw.state === 'PUBLISHED' ? 'Accepting Submissions' : 'Closed'}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {selectedAssignment && (
                <section className="submissions-container">
                  <header className="submissions-header">
                    <h3>Submissions for "{selectedAssignment.title}"</h3>
                    <div className="submission-counts">
                      <span><strong>Returned:</strong> {submissionCounts.returned}</span>
                      <span><strong>Turned In:</strong> {submissionCounts.turnedIn}</span>
                      <span><strong>Assigned:</strong> {submissionCounts.created}</span>
                    </div>
                  </header>
                  <div className="submissions-grid">
                    {loading.submissions ? <p>Loading submissions...</p> : submissions.map(sub => {
                      const studentProfile = studentsMap.get(sub.userId);
                      return (
                        <div key={sub.id} className="submission-card">
                          <div className="student-info">
                            {/* THIS IS THE FIX */}
                            <span className="student-name">{studentProfile?.name?.fullName || 'Unknown Student'}</span>
                            <span className="student-id">ID: {sub.userId}</span>
                          </div>
                          <span className="submission-grade">{sub.assignedGrade || '-'}</span>
                          <div className="submission-status-wrapper">
                            <SubmissionStatusIcon state={sub.state} />
                            <span className={`submission-state state-${sub.state}`}>{sub.state.replace('_', ' ')}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default ClassroomPage;