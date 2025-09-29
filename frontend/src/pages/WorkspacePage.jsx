import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import SubjectsCard from '../components/specific/workspace/SubjectsCard';
import GroupsCard from '../components/specific/workspace/GroupsCard';
import ScheduleCard from '../components/specific/workspace/ScheduleCard';
import ShortcutsCard from '../components/specific/workspace/ShortcutsCard';
import './WorkspacePage.css';

const WorkspacePage = () => {
  const [subjects, setSubjects] = useState([]);
  const [groups, setGroups] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [subjectsData, groupsData, scheduleData] = await Promise.all([
        apiClient.getSubjects(),
        apiClient.getGroups(),
        apiClient.getSchedule(),
      ]);
      setSubjects(subjectsData);
      setGroups(groupsData);
      setSchedule(scheduleData);
    } catch (error) {
      console.error("Failed to fetch workspace data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  if (isLoading) {
    return <div>Loading Workspace...</div>;
  }

  return (
    <div className="workspace-container">
        <div className="workspace-main-grid">
            <div className="grid-item shortcuts-card">
                <ShortcutsCard />
            </div>
            <div className="grid-item subjects-card">
                <SubjectsCard subjects={subjects} groups={groups} onUpdate={fetchData} />
            </div>
            <div className="grid-item groups-card">
                <GroupsCard groups={groups} subjects={subjects} onUpdate={fetchData} />
            </div>
            <div className="grid-item schedule-card">
                <ScheduleCard 
                    groups={groups} 
                    subjects={subjects} 
                    schedule={schedule} 
                    onUpdate={fetchData} 
                />
            </div>
        </div>
    </div>
  );
};

export default WorkspacePage;