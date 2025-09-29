import React, { useState, useMemo } from 'react';
import { apiClient } from '../../../services/apiClient';
import { FaEdit, FaTrash } from 'react-icons/fa';
import './Schedule.css';

const timeSlots = [
  "07:00 - 07:50",
  "07:50 - 08:40",
  "08:40 - 09:30",
  "09:30 - 10:20",
  "10:20 - 10:50", // Recess
  "10:50 - 11:40",
  "11:40 - 12:30",
  "12:30 - 13:20",
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const ScheduleCard = ({ groups, subjects, schedule, onUpdate }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isRemoveMode, setIsRemoveMode] = useState(false);

  const groupsMap = useMemo(() => groups.reduce((acc, g) => ({ ...acc, [g.id]: g }), {}), [groups]);
  const subjectsMap = useMemo(() => subjects.reduce((acc, s) => ({ ...acc, [s.id]: s.name }), {}), [subjects]);

  const toggleMode = (mode) => {
    if (mode === 'edit') {
      setIsRemoveMode(false);
      setIsEditMode(prev => !prev);
    } else if (mode === 'remove') {
      setIsEditMode(false);
      setIsRemoveMode(prev => !prev);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragStart = (e, scheduleEntry) => {
    e.dataTransfer.setData("scheduleId", scheduleEntry.id);
    e.dataTransfer.setData("groupId", scheduleEntry.groupId);
  };

  const handleDrop = async (e, day, time) => {
    e.preventDefault();
    const scheduleIdToMove = e.dataTransfer.getData("scheduleId");
    const groupId = e.dataTransfer.getData("groupId");

    if (!groupId) return;

    const [startTime, endTime] = time.split(' - ');
    const newScheduleData = {
      groupId: parseInt(groupId),
      dayOfWeek: day,
      startTime,
      endTime,
    };

    try {
      await apiClient.saveScheduleEntry(newScheduleData);
      if (scheduleIdToMove) {
        await apiClient.deleteScheduleEntry(parseInt(scheduleIdToMove));
      }
      onUpdate();
    } catch (error) {
      console.error("Failed to update schedule", error);
    }
  };

  const handleDelete = async (scheduleId) => {
    try {
      await apiClient.deleteScheduleEntry(scheduleId);
      onUpdate();
    } catch (error)
    {
      console.error("Failed to delete schedule entry", error);
    }
  };

  return (
    <div className="schedule-container">
      <div className="schedule-header">
        <h3>Weekly Schedule</h3>
        <div className="header-actions">
          <button className={`action-button ${isEditMode ? 'active' : ''}`} title="Edit Schedule" onClick={() => toggleMode('edit')}>
            <FaEdit />
          </button>
          <button className={`action-button ${isRemoveMode ? 'active danger-button' : ''}`} title="Remove from Schedule" onClick={() => toggleMode('remove')}>
            <FaTrash />
          </button>
        </div>
      </div>
      <div className="schedule-grid">
        <div className="time-column">
          <div className="grid-header"></div> 
          {timeSlots.map(time => {
            const isRecess = time.startsWith("10:20");
            return (
              <div key={time} className={`time-slot-label ${isRecess ? 'recess-label' : ''}`}>
                {isRecess ? "Recess" : time}
              </div>
            );
          })}
        </div>

        {days.map(day => (
          <div key={day} className="day-column">
            <div className="grid-header">{day}</div>
            {timeSlots.map(time => {
              const isRecess = time.startsWith("10:20");
              if (isRecess) {
                return <div key={`${day}-${time}`} className="grid-cell recess"></div>;
              }

              const scheduleEntry = schedule.find(
                entry => entry.dayOfWeek === day && entry.startTime === time.split(' - ')[0]
              );

              return (
                <div 
                  key={`${day}-${time}`} 
                  className={`grid-cell ${!isRecess ? 'droppable' : ''}`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, day, time)}
                >
                  {scheduleEntry && groupsMap[scheduleEntry.groupId] && (
                    <div 
                      className={`item-chip schedule-item ${isEditMode ? 'draggable' : ''} ${isRemoveMode ? 'deletable' : ''}`} 
                      style={{ backgroundColor: groupsMap[scheduleEntry.groupId].color }}
                      draggable={isEditMode}
                      onDragStart={(e) => handleDragStart(e, scheduleEntry)}
                      onClick={() => isRemoveMode && handleDelete(scheduleEntry.id)}
                    >
                      {(() => {
                         const group = groupsMap[scheduleEntry.groupId];
                         const subjectName = subjectsMap[group.subjectId] || '...';
                         return `${group.grade}${group.name} - ${subjectName}`;
                      })()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleCard;