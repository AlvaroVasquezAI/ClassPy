import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; 
import { apiClient } from '../services/apiClient';
import { useAppContext } from '../context/AppContext';
import { FaUserGraduate } from 'react-icons/fa';

import PeriodSelector from '../components/specific/group_workspace/PeriodSelector';
import AssignmentCategoryCard from '../components/specific/group_workspace/AssignmentCategoryCard';
import GradesTable from '../components/specific/group_workspace/GradesTable';
import TopicsCard from '../components/specific/group_workspace/TopicsCard';
import StudentsModal from '../components/specific/group_workspace/StudentsModal';
import QRCodeModal from '../components/specific/group_workspace/QRCodeModal';

import './GroupWorkspacePage.css';

const GroupWorkspacePage = () => {
    const { t } = useTranslation(); 
    const { groupSlug } = useParams();
    const { subjects, groups } = useAppContext();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [topics, setTopics] = useState([]);
    const [selectedPeriodId, setSelectedPeriodId] = useState(1);
    const [selectedTopicId, setSelectedTopicId] = useState(null);
    const [students, setStudents] = useState([]);

    const [isStudentsModalOpen, setIsStudentsModalOpen] = useState(false);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [studentForQr, setStudentForQr] = useState(null);

    const { currentGroup, currentSubject } = useMemo(() => {
        if (!groupSlug || !groups || !subjects) return { currentGroup: null, currentSubject: null };
        const slugParts = groupSlug.replace('_working', '').split('-');
        const gradeAndName = slugParts[0];
        const subjectNameSlug = slugParts.slice(1).join('-');
        const grade = parseInt(gradeAndName.match(/\d+/)[0]);
        const name = gradeAndName.match(/[a-zA-Z]+/)[0].toUpperCase();
        const subject = subjects.find(s => s.name.toLowerCase() === subjectNameSlug.replace('-', ' '));
        if (!subject) return { currentGroup: null, currentSubject: null };
        const group = groups.find(g => g.subjectId === subject.id && g.grade === grade && g.name === name);
        return { currentGroup: group, currentSubject: subject };
    }, [groupSlug, groups, subjects]);

    const fetchTopics = useCallback(async () => {
        if (!currentGroup || !currentSubject) return;
        try {
            const topicsData = await apiClient.getTopics(selectedPeriodId, currentSubject.id);
            setTopics(topicsData);
            if (topicsData.length > 0 && !selectedTopicId) {
                setSelectedTopicId(topicsData[0].id);
            } else if (topicsData.length === 0) {
                setSelectedTopicId(null);
            }
        } catch (err) {
            setError(`Failed to fetch topics: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [selectedPeriodId, currentGroup, currentSubject, selectedTopicId]);

    const fetchStudents = useCallback(async () => {
        if (!currentGroup) return;
        try {
            const studentData = await apiClient.getStudentsByGroup(currentGroup.id);
            setStudents(studentData);
        } catch (err) {
            setError(prev => `${prev}\nFailed to fetch students: ${err.message}`);
        }
    }, [currentGroup]);
    
    useEffect(() => {
        if (currentGroup) {
            fetchTopics();
            fetchStudents();
        }
    }, [fetchTopics, fetchStudents, currentGroup]);


    const selectedTopic = useMemo(() => {
        if (!selectedTopicId) return null;
        return topics.find(t => t.id === selectedTopicId);
    }, [selectedTopicId, topics]);

    const handleShowQrCode = (student) => {
        setStudentForQr(student);
        setIsStudentsModalOpen(false); 
        setIsQrModalOpen(true);
    };

    const handleCloseQrCode = () => {
        setIsQrModalOpen(false);
        setIsStudentsModalOpen(true);
    };


    if (!currentGroup || !currentSubject) {
        return <div>{t('groupWorkspace.notFound')}</div>;
    }

    return (
        <div className="group-workspace-container">
            <header className="gw-header">
                <div className="gw-group-name">{`${currentGroup.grade}${currentGroup.name} - ${currentSubject.name}`}</div>
                <button className="gw-students-button" onClick={() => setIsStudentsModalOpen(true)}>
                    <FaUserGraduate />
                    <span>{t('groupWorkspace.students')}</span>
                </button>
                <span className="gw-student-count">{students.length}</span>
            </header>
            
            <PeriodSelector selectedPeriodId={selectedPeriodId} setSelectedPeriodId={setSelectedPeriodId} />
            
            <div className="gw-main-content">
                <div className="gw-topics-card">
                    <TopicsCard
                        topics={topics}
                        selectedTopicId={selectedTopicId}
                        setSelectedTopicId={setSelectedTopicId}
                        periodId={selectedPeriodId}
                        subjectId={currentSubject.id}
                        onTopicUpdate={fetchTopics}
                    />
                </div>

                <div className="gw-grades-breakdown">
                    {selectedTopic ? (
                        <>
                            <AssignmentCategoryCard categoryName={t('groupWorkspace.categories.notebook')} weight={selectedTopic.notebookWeight} assignmentCount={0} color="#6A9A8B" />
                            <AssignmentCategoryCard categoryName={t('groupWorkspace.categories.practices')} weight={selectedTopic.practiceWeight} assignmentCount={0} color="#3B82F6" />
                            <AssignmentCategoryCard categoryName={t('groupWorkspace.categories.exam')} weight={selectedTopic.examWeight} assignmentCount={0} color="#EF4444" />
                            <AssignmentCategoryCard categoryName={t('groupWorkspace.categories.others')} weight={selectedTopic.otherWeight} assignmentCount={0} color="#F97316" />
                        </>
                    ) : (
                        <p>{t('groupWorkspace.selectTopicPrompt')}</p>
                    )}
                </div>
                
                <div className="gw-grades-table-container">
                    <GradesTable selectedTopic={selectedTopic} students={students} />
                </div>
            </div>

            <StudentsModal
              isOpen={isStudentsModalOpen}
              onClose={() => setIsStudentsModalOpen(false)}
              students={students}
              currentGroup={currentGroup}
              currentSubject={currentSubject}
              onUpdate={fetchStudents}
              onShowQrCode={handleShowQrCode}
            />

            <QRCodeModal 
              isOpen={isQrModalOpen} 
              onClose={handleCloseQrCode}
              student={studentForQr} 
            />
        </div>
    );
};

export default GroupWorkspacePage;