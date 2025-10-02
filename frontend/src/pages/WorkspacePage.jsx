import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import { apiClient } from '../services/apiClient'; 
import SubjectsCard from '../components/specific/workspace/SubjectsCard';
import GroupsCard from '../components/specific/workspace/GroupsCard';
import ScheduleCard from '../components/specific/workspace/ScheduleCard';
import ShortcutsCard from '../components/specific/workspace/ShortcutsCard';
import './WorkspacePage.css';

const WorkspacePage = () => {
  const { t } = useTranslation();
  
  const { 
    subjects, 
    groups, 
    isWorkspaceLoading, 
    refreshWorkspaceData 
  } = useAppContext();

  const [schedule, setSchedule] = useState([]);
  const [isScheduleLoading, setIsScheduleLoading] = useState(true);

  const fetchSchedule = async () => {
    try {
      const scheduleData = await apiClient.getSchedule();
      setSchedule(scheduleData);
    } catch (error) {
      console.error("Failed to fetch schedule data:", error);
    } finally {
      setIsScheduleLoading(false);
    }
  };
  
  useEffect(() => {
    fetchSchedule();
  }, []);

  if (isWorkspaceLoading || isScheduleLoading) {
    return <div>{t('workspace.loading')}</div>; 
  }

  return (
    <div className="workspace-container">
        <div className="workspace-main-grid">
            <div className="grid-item shortcuts-card">
                <ShortcutsCard />
            </div>
            <div className="grid-item subjects-card">
                <SubjectsCard subjects={subjects} groups={groups} onUpdate={refreshWorkspaceData} />
            </div>
            <div className="grid-item groups-card">
                <GroupsCard groups={groups} subjects={subjects} onUpdate={refreshWorkspaceData} />
            </div>
            <div className="grid-item schedule-card">
                <ScheduleCard 
                    groups={groups} 
                    subjects={subjects} 
                    schedule={schedule} 
                    onUpdate={fetchSchedule} 
                />
            </div>
        </div>
    </div>
  );
};

export default WorkspacePage;