import React, { useState, useEffect } from 'react';
import Modal from '../../common/Modal';
import { apiClient } from '../../../services/apiClient';

const CreateAssignmentModal = ({ isOpen, onClose, topic, category, classroomCourseId, linkedAsgIds, onUpdate, assignmentToEdit }) => {
  const [assignmentName, setAssignmentName] = useState('');
  const [linkedClassroomAsgId, setLinkedClassroomAsgId] = useState('');
  const [classroomAssignments, setClassroomAssignments] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isEditMode = !!assignmentToEdit;

  useEffect(() => {
    if (isOpen) {
      if (classroomCourseId) {
        apiClient.getClassroomCourseWork(classroomCourseId)
          .then(setClassroomAssignments)
          .catch(err => {
            console.error("Failed to fetch classroom assignments", err);
            setError("Could not load Classroom assignments.");
          });
      }
      if (isEditMode) {
        setAssignmentName(assignmentToEdit.name);
        setLinkedClassroomAsgId(assignmentToEdit.classroomAsgId || '');
      }
    } else {
      setAssignmentName('');
      setLinkedClassroomAsgId('');
      setError('');
      setClassroomAssignments([]);
    }
  }, [isOpen, classroomCourseId, isEditMode, assignmentToEdit]);

  useEffect(() => {
    if (linkedClassroomAsgId && !isEditMode) {
      const selectedAsg = classroomAssignments.find(a => a.id === linkedClassroomAsgId);
      if (selectedAsg) {
        setAssignmentName(selectedAsg.title);
      }
    } else if (!linkedClassroomAsgId && !isEditMode) {
      setAssignmentName('');
    }
  }, [linkedClassroomAsgId, classroomAssignments, isEditMode]);

  const handleSubmit = async () => {
    if (!assignmentName.trim()) {
      setError('Assignment Name is required.');
      return;
    }
    if (!topic || !category) {
      setError('An internal error occurred (missing topic or category). Please try again.');
      return;
    }

    setIsLoading(true);
    setError('');

    const payload = {
      name: assignmentName,
      classroomAsgId: linkedClassroomAsgId || null,
    };

    try {
      let apiCall;
      
      if (isEditMode) {
        let updateFunction;
        switch (category) {
            case 'Notebook': updateFunction = apiClient.updateNotebookAssignment; break;
            case 'Practices': updateFunction = apiClient.updatePracticeAssignment; break;
            case 'Exam': updateFunction = apiClient.updateExamAssignment; break;
            case 'Others': updateFunction = apiClient.updateOtherAssignment; break;
            default: throw new Error(`Invalid assignment category for update: ${category}`);
        }
        apiCall = updateFunction(assignmentToEdit.id, payload);
      } else {
        const createPayload = { ...payload, topicId: topic.id };
        let createFunction;
        switch (category) {
            case 'Notebook': createFunction = apiClient.createNotebookAssignment; break;
            case 'Practices': createFunction = apiClient.createPracticeAssignment; break;
            case 'Exam': createFunction = apiClient.createExamAssignment; break;
            case 'Others': createFunction = apiClient.createOtherAssignment; break;
            default: throw new Error(`Invalid assignment category for create: ${category}`);
        }
        apiCall = createFunction(createPayload);
      }
      
      await apiCall;
      onUpdate(); 
      onClose();  
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const modalFooter = (
    <button className="primary-button" onClick={handleSubmit} disabled={isLoading}>
      {isLoading ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Assignment')}
    </button>
  );

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isEditMode ? `Edit ${category} Assignment` : `Create New ${category} Assignment`}
      footer={modalFooter}
    >
      <div className="modal-form">
        {error && <p className="form-error">{error}</p>}
        
        <label>Link to Google Classroom Assignment (Optional)</label>
        <select 
          value={linkedClassroomAsgId} 
          onChange={e => setLinkedClassroomAsgId(e.target.value)} 
          className="form-input"
          disabled={!classroomCourseId || isLoading}
        >
          <option value="">{classroomCourseId ? "Don't link" : "Group not linked to Classroom"}</option>
          {classroomAssignments.map(asg => (
            <option 
              key={asg.id} 
              value={asg.id} 
              disabled={linkedAsgIds.has(asg.id) && asg.id !== assignmentToEdit?.classroomAsgId}
            >
              {asg.title} {linkedAsgIds.has(asg.id) && asg.id !== assignmentToEdit?.classroomAsgId ? '(Already linked)' : ''}
            </option>
          ))}
        </select>

        <label htmlFor="assignmentName">Assignment Name</label>
        <input 
          id="assignmentName"
          type="text" 
          value={assignmentName} 
          onChange={e => setAssignmentName(e.target.value)} 
          className="form-input" 
          placeholder="e.g., Chapter 5 Review"
          required
          disabled={isLoading}
        />
      </div>
    </Modal>
  );
};

export default CreateAssignmentModal;