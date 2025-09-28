const API_HOST = window.location.hostname;
const API_BASE_URL = `http://${API_HOST}:8000`;

export const apiClient = {
  getTeacher: async () => {
    const response = await fetch(`${API_BASE_URL}/api/teacher`);
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
};