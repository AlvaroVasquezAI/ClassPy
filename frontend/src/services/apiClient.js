const API_HOST = window.location.hostname;
const API_BASE_URL = `http://${API_HOST}:8000`;

export const apiClient = {
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
    if (!response.ok) throw new Error('Failed to create subject.');
    return response.json();
  },

  getGroups: async () => {
    const response = await fetch(`${API_BASE_URL}/api/groups`);
    if (!response.ok) throw new Error('Failed to fetch groups.');
    return response.json();
  },

  createGroup: async (groupData) => {
    const response = await fetch(`${API_BASE_URL}/api/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(groupData),
    });
    if (!response.ok) throw new Error('Failed to create group.');
    return response.json();
  },

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
    if (!response.ok) throw new Error('Failed to save schedule entry.');
    return response.json();
  },

  deleteGroup: async (groupId) => {
    const response = await fetch(`${API_BASE_URL}/api/groups/${groupId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete group.');
    }
    return true; 
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
  
  deleteScheduleEntry: async (scheduleId) => {
    const response = await fetch(`${API_BASE_URL}/api/schedule/${scheduleId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete schedule entry.');
    }
    return true;
  },

  updateSubject: async (subjectId, subjectData) => {
    const response = await fetch(`${API_BASE_URL}/api/subjects/${subjectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subjectData),
    });
    if (!response.ok) throw new Error('Failed to update subject.');
    return response.json();
  },

  deleteSubject: async (subjectId) => {
    const response = await fetch(`${API_BASE_URL}/api/subjects/${subjectId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete subject.');
    return true;
  },
};