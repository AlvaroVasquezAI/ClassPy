import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../../services/apiClient';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { MdOutlineSchedule } from "react-icons/md";
import Modal from '../../common/Modal';
import './Schedule.css';

const timeSlots = [
  "07:00 - 07:50", "07:50 - 08:40", "08:40 - 09:30", "09:30 - 10:20",
  "10:20 - 10:50", // Recess
  "10:50 - 11:40", "11:40 - 12:30", "12:30 - 13:20",
];

const daysInEnglish = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const ScheduleCard = ({ groups, subjects, schedule, onUpdate }) => {
  const { t } = useTranslation();

  const [isEditMode, setIsEditMode] = useState(false);
  const [isRemoveMode, setIsRemoveMode] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const groupsMap = useMemo(() => groups.reduce((acc, g) => ({ ...acc, [g.id]: g }), {}), [groups]);
  const subjectsMap = useMemo(() => subjects.reduce((acc, s) => ({ ...acc, [s.id]: s.name }), {}), [subjects]);

  const toggleMode = (mode) => {
    setIsEditMode(mode === 'edit' ? !isEditMode : false);
    setIsRemoveMode(mode === 'remove' ? !isRemoveMode : false);
  };

  const handleDragOver = (e) => e.preventDefault();
  
  const handleDragStart = (e, data) => {
    e.dataTransfer.setData("groupId", data.groupId);
    if (data.scheduleId) e.dataTransfer.setData("scheduleId", data.scheduleId);
  };
  
  const handleDrop = async (e, dayInEnglish, time) => {
    e.preventDefault();
    const scheduleIdToMove = e.dataTransfer.getData("scheduleId");
    const groupId = e.dataTransfer.getData("groupId");

    if (!groupId) return;
    
    const [startTime, endTime] = time.split(' - ');
    const newScheduleData = {
      groupId: parseInt(groupId),
      dayOfWeek: dayInEnglish, 
      startTime,
      endTime,
    };

    try {
      await apiClient.saveScheduleEntry(newScheduleData);
      if (scheduleIdToMove) await apiClient.deleteScheduleEntry(parseInt(scheduleIdToMove));
      onUpdate();
    } catch (error) {
      console.error("Failed to update schedule", error);
    }
  };

  const handleDelete = async (scheduleId) => {
    try {
      await apiClient.deleteScheduleEntry(scheduleId);
      onUpdate();
    } catch (error) {
      console.error("Failed to delete schedule entry", error);
    }
  };

  const getGroupDisplayText = (group) => {
    if (!group) return '';
    const subjectName = subjectsMap[group.subjectId] || '...';
    return `${group.grade}${group.name} - ${subjectName}`;
  };

  return (
    <div className="schedule-container">
      <div className="schedule-header">
        <div className="header-left">
          <MdOutlineSchedule />
          <h3>{t('workspace.schedule.title')}</h3>
        </div>
        <div className="header-actions">
          <button className={`action-button ${isEditMode ? 'active' : ''}`} title={t('workspace.schedule.editTitle')} onClick={() => toggleMode('edit')}><FaEdit /></button>
          <button className={`action-button ${isRemoveMode ? 'active danger-button' : ''}`} title={t('workspace.schedule.removeTitle')} onClick={() => toggleMode('remove')}><FaTrash /></button>
          <button className="add-button" title={t('workspace.schedule.addTitle')} onClick={() => setIsAddModalOpen(true)}><FaPlus /></button>
        </div>
      </div>
      <div className="schedule-grid">
        <div className="time-column">
          <div className="grid-header"></div>
          {timeSlots.map(time => {
            const isRecess = time.startsWith("10:20");
            return <div key={time} className={`time-slot-label ${isRecess ? 'recess-label' : ''}`}>{isRecess ? t('workspace.schedule.recess') : time}</div>;
          })}
        </div>
        {daysInEnglish.map(dayInEnglish => (
          <div key={dayInEnglish} className="day-column">
            <div className="grid-header">{t(`workspace.schedule.days.${dayInEnglish.toLowerCase()}`)}</div>
            {timeSlots.map(time => {
              const isRecess = time.startsWith("10:20");
              if (isRecess) return <div key={`${dayInEnglish}-${time}`} className="grid-cell recess"></div>;

              const scheduleEntry = schedule.find(entry => entry.dayOfWeek === dayInEnglish && entry.startTime === time.split(' - ')[0]);
              return (
                <div 
                  key={`${dayInEnglish}-${time}`} 
                  className={`grid-cell ${!isRecess ? 'droppable' : ''}`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, dayInEnglish, time)}
                >
                  {scheduleEntry && groupsMap[scheduleEntry.groupId] && (
                    <div
                      className={`item-chip schedule-item ${isEditMode ? 'draggable' : ''} ${isRemoveMode ? 'deletable' : ''}`}
                      style={{ backgroundColor: groupsMap[scheduleEntry.groupId].color }}
                      draggable={isEditMode}
                      onDragStart={(e) => handleDragStart(e, { groupId: scheduleEntry.groupId, scheduleId: scheduleEntry.id })}
                      onClick={() => isRemoveMode && handleDelete(scheduleEntry.id)}>
                      {getGroupDisplayText(groupsMap[scheduleEntry.groupId])}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title={t('workspace.schedule.addModalTitle')}
        footer={null} 
      >
        <p style={{textAlign: 'center', color: 'var(--text-color-light)', marginTop: 0}}>{t('workspace.schedule.addModalInstruction')}</p>
        <div className="add-group-modal-body" onDragLeave={() => setIsAddModalOpen(false)}>
          {groups.map(group => (
            <div key={group.id} className="item-chip draggable"
              style={{ backgroundColor: group.color }}
              draggable="true"
              onDragStart={(e) => handleDragStart(e, { groupId: group.id })}>
              {getGroupDisplayText(group)}
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default ScheduleCard;