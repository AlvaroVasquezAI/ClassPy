const API_HOST = window.location.hostname;
const API_BASE_URL = `http://${API_HOST}:8000`;

export const apiClient = {
  // =================================================================
  // Teacher Methods
  // =================================================================
  getTeacher: async () => {
    const response = await fetch(`${API_BASE_URL}/api/teacher`);
    if (response.status === 204 || response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error('Failed to fetch teacher data.');
    }
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  },

  createTeacher: async (formData) => {
    const response = await fetch(`${API_BASE_URL}/api/teacher`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to create teacher.');
    }
    return response.json();
  },

  updateTeacher: async (formData) => {
    const response = await fetch(`${API_BASE_URL}/api/teacher`, {
      method: 'PUT',
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to update teacher.');
    }
    return response.json();
  },

  // =================================================================
  // Subject Methods
  // =================================================================
  getSubjects: async () => {
    const response = await fetch(`${API_BASE_URL}/api/subjects`);
    if (!response.ok) throw new Error('Failed to fetch subjects.');
    return response.json();
  },

  createSubject: async (subjectData) => {
    const response = await fetch(`${API_BASE_URL}/api/subjects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subjectData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to create subject.');
    }
    return response.json();
  },

  updateSubject: async (subjectId, subjectData) => {
    const response = await fetch(`${API_BASE_URL}/api/subjects/${subjectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subjectData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to update subject.');
    }
    return response.json();
  },

  deleteSubject: async (subjectId) => {
    const response = await fetch(`${API_BASE_URL}/api/subjects/${subjectId}`, {
      method: 'DELETE',
    });
    if (response.status !== 204) {
      throw new Error('Failed to delete subject.');
    }
    return true;
  },

  // =================================================================
  // Group Methods
  // =================================================================
  getGroups: async () => {
    const response = await fetch(`${API_BASE_URL}/api/groups`);
    if (!response.ok) throw new Error('Failed to fetch groups.');
    return response.json();
  },

  getGroupDetails: async (groupId) => {
    const response = await fetch(`${API_BASE_URL}/api/groups/${groupId}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch group details.');
    }
    return response.json();
  },

  createGroup: async (groupData) => {
    const response = await fetch(`${API_BASE_URL}/api/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(groupData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to create group.');
    }
    return response.json();
  },

  updateGroup: async (groupId, groupData) => {
    const response = await fetch(`${API_BASE_URL}/api/groups/${groupId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(groupData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to update group.');
    }
    return response.json();
  },

  deleteGroup: async (groupId) => {
    const response = await fetch(`${API_BASE_URL}/api/groups/${groupId}`, {
      method: 'DELETE',
    });
    if (response.status !== 204) {
      throw new Error('Failed to delete group.');
    }
    return true;
  },

  // =================================================================
  // Schedule Methods
  // =================================================================
  getSchedule: async () => {
    const response = await fetch(`${API_BASE_URL}/api/schedule`);
    if (!response.ok) throw new Error('Failed to fetch schedule.');
    return response.json();
  },

  saveScheduleEntry: async (scheduleData) => {
    const response = await fetch(`${API_BASE_URL}/api/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scheduleData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to save schedule entry.');
    }
    return response.json();
  },

  deleteScheduleEntry: async (scheduleId) => {
    const response = await fetch(`${API_BASE_URL}/api/schedule/${scheduleId}`, {
      method: 'DELETE',
    });
    if (response.status !== 204) {
      throw new Error('Failed to delete schedule entry.');
    }
    return true;
  },

  // =================================================================
  // Topic Methods
  // =================================================================
  getTopics: async (periodId, subjectId) => {
    const response = await fetch(`${API_BASE_URL}/api/topics/by-period-subject?period_id=${periodId}&subject_id=${subjectId}`);
    if (!response.ok) throw new Error('Failed to fetch topics.');
    return response.json();
  },

  createTopic: async (topicData) => {
    const response = await fetch(`${API_BASE_URL}/api/topics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(topicData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to create topic.');
    }
    return response.json();
  },

  updateTopic: async (topicId, topicData) => {
    const response = await fetch(`${API_BASE_URL}/api/topics/${topicId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(topicData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to update topic.');
    }
    return response.json();
  },

  deleteTopic: async (topicId) => {
    const response = await fetch(`${API_BASE_URL}/api/topics/${topicId}`, {
      method: 'DELETE',
    });
    if (response.status !== 204) {
      throw new Error('Failed to delete topic.');
    }
    return true;
  },

  // =================================================================
  // Student Methods
  // =================================================================
  getStudentsByGroup: async (groupId) => {
    const response = await fetch(`${API_BASE_URL}/api/students?group_id=${groupId}`);
    if (!response.ok) throw new Error('Failed to fetch students.');
    return response.json();
  },

  createStudent: async (studentData) => {
    const response = await fetch(`${API_BASE_URL}/api/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to create student.');
    }
    return response.json();
  },

  updateStudent: async (studentId, studentData) => {
    const response = await fetch(`${API_BASE_URL}/api/students/${studentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to update student.');
    }
    return response.json();
  },

  deleteStudent: async (studentId) => {
    const response = await fetch(`${API_BASE_URL}/api/students/${studentId}`, {
      method: 'DELETE',
    });
    if (response.status !== 204) {
      throw new Error('Failed to delete student.');
    }
    return true;
  },

  // =================================================================
  // Assignment Methods
  // =================================================================
  getAssignmentsByTopic: async (topicId) => {
    const response = await fetch(`${API_BASE_URL}/api/assignments/by-topic/${topicId}`);
    if (!response.ok) throw new Error('Failed to fetch assignments.');
    return response.json();
  },
  
  createNotebookAssignment: async (data) => {
    const response = await fetch(`${API_BASE_URL}/api/assignments/notebook`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.detail || 'Failed to create Notebook assignment.'); }
    return response.json();
  },
  updateNotebookAssignment: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/api/assignments/notebook/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.detail || 'Failed to update Notebook assignment.'); }
    return response.json();
  },
  deleteNotebookAssignment: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/assignments/notebook/${id}`, { method: 'DELETE' });
    if (response.status !== 204) throw new Error('Failed to delete Notebook assignment.');
    return true;
  },

  createPracticeAssignment: async (data) => {
    const response = await fetch(`${API_BASE_URL}/api/assignments/practice`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.detail || 'Failed to create Practice assignment.'); }
    return response.json();
  },
  updatePracticeAssignment: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/api/assignments/practice/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.detail || 'Failed to update Practice assignment.'); }
    return response.json();
  },
  deletePracticeAssignment: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/assignments/practice/${id}`, { method: 'DELETE' });
    if (response.status !== 204) throw new Error('Failed to delete Practice assignment.');
    return true;
  },

  createExamAssignment: async (data) => {
    const response = await fetch(`${API_BASE_URL}/api/assignments/exam`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.detail || 'Failed to create Exam assignment.'); }
    return response.json();
  },
  updateExamAssignment: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/api/assignments/exam/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.detail || 'Failed to update Exam assignment.'); }
    return response.json();
  },
  deleteExamAssignment: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/assignments/exam/${id}`, { method: 'DELETE' });
    if (response.status !== 204) throw new Error('Failed to delete Exam assignment.');
    return true;
  },

  createOtherAssignment: async (data) => {
    const response = await fetch(`${API_BASE_URL}/api/assignments/other`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.detail || 'Failed to create Other assignment.'); }
    return response.json();
  },
  updateOtherAssignment: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/api/assignments/other/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.detail || 'Failed to update Other assignment.'); }
    return response.json();
  },
  deleteOtherAssignment: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/assignments/other/${id}`, { method: 'DELETE' });
    if (response.status !== 204) throw new Error('Failed to delete Other assignment.');
    return true;
  },

  // =================================================================
  // Grades Methods
  // =================================================================
  getGradesForTopic: async (topicId) => {
    const response = await fetch(`${API_BASE_URL}/api/grades/topic/${topicId}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch grades.');
    }
    return response.json();
  },
  
  // =================================================================
  // Google Classroom Methods
  // =================================================================
  getClassroomCourses: async () => {
    const response = await fetch(`${API_BASE_URL}/api/classroom/courses`);
    if (!response.ok) throw new Error('Failed to fetch Classroom courses.');
    return response.json();
  },

  getClassroomCourseWork: async (courseId) => {
    const response = await fetch(`${API_BASE_URL}/api/classroom/courses/${courseId}/coursework`);
    if (!response.ok) throw new Error('Failed to fetch course work.');
    return response.json();
  },

  getClassroomSubmissions: async (courseId, courseworkId) => {
    const response = await fetch(`${API_BASE_URL}/api/classroom/courses/${courseId}/coursework/${courseworkId}/submissions`);
    if (!response.ok) throw new Error('Failed to fetch submissions.');
    return response.json();
  },

  getClassroomRoster: async (courseId) => {
    const response = await fetch(`${API_BASE_URL}/api/classroom/courses/${courseId}/students`);
    if (!response.ok) throw new Error('Failed to fetch student roster.');
    return response.json();
  },

  getGoogleUserProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/api/classroom/user/profile`);
    if (!response.ok) throw new Error('Failed to fetch Google user profile.');
    return response.json();
  },

  createStudentsInBulk: async (groupId, studentsData) => {
    const payload = { students: studentsData };
    const response = await fetch(`${API_BASE_URL}/api/students/bulk/${groupId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to bulk create students.');
    }
    return response.json();
  },

  getAllStudents: async () => {
    const response = await fetch(`${API_BASE_URL}/api/students/all`);
    if (!response.ok) throw new Error('Failed to fetch all students.');
    return response.json();
  },
};