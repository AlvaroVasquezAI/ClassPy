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
import ViewAssignmentsModal from '../components/specific/group_workspace/ViewAssignmentsModal';
import CreateAssignmentModal from '../components/specific/group_workspace/CreateAssignmentModal';
import DeleteAssignmentModal from '../components/specific/group_workspace/DeleteAssignmentModal';

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
    const [groupDetails, setGroupDetails] = useState(null);
    const [allAssignments, setAllAssignments] = useState(null);
    const [gradeData, setGradeData] = useState({ assignments: [], grades: {} });
    const [isGradesLoading, setIsGradesLoading] = useState(false);
    const [isStudentsModalOpen, setIsStudentsModalOpen] = useState(false);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [studentForQr, setStudentForQr] = useState(null);
    const [isViewAssignmentsModalOpen, setIsViewAssignmentsModalOpen] = useState(false);
    const [isCreateAssignmentModalOpen, setIsCreateAssignmentModalOpen] = useState(false);
    const [isDeleteAssignmentModalOpen, setIsDeleteAssignmentModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [assignmentToEdit, setAssignmentToEdit] = useState(null);
    const [assignmentToDelete, setAssignmentToDelete] = useState(null);

    const { currentGroup, currentSubject } = useMemo(() => {
        if (!groupSlug || !groups || !subjects) return { currentGroup: null, currentSubject: null };
        const slugParts = groupSlug.replace('_working', '').split('-');
        const gradeAndName = slugParts[0];
        const subjectNameSlug = slugParts.slice(1).join('-');
        const gradeMatch = gradeAndName.match(/\d+/);
        const nameMatch = gradeAndName.match(/[a-zA-Z]+/);
        if (!gradeMatch || !nameMatch) return { currentGroup: null, currentSubject: null };
        const grade = parseInt(gradeMatch[0]);
        const name = nameMatch[0].toUpperCase();
        const subject = subjects.find(s => s.name.toLowerCase() === subjectNameSlug.replace(/-/g, ' '));
        if (!subject) return { currentGroup: null, currentSubject: null };
        const group = groups.find(g => g.subjectId === subject.id && g.grade === grade && g.name === name);
        return { currentGroup: group, currentSubject: subject };
    }, [groupSlug, groups, subjects]);

    useEffect(() => {
        if (currentGroup) {
            apiClient.getGroupDetails(currentGroup.id)
                .then(setGroupDetails)
                .catch(err => setError(`Failed to fetch group details: ${err.message}`));
        }
    }, [currentGroup]);

    const fetchTopics = useCallback(() => {
        if (!currentGroup || !currentSubject) return;
        setLoading(true);
        apiClient.getTopics(selectedPeriodId, currentSubject.id)
            .then(topicsData => {
                setTopics(topicsData);
                if (topicsData.length > 0 && !topicsData.find(t => t.id === selectedTopicId)) {
                    setSelectedTopicId(topicsData[0].id);
                } else if (topicsData.length === 0) {
                    setSelectedTopicId(null);
                }
            })
            .catch(err => setError(`Failed to fetch topics: ${err.message}`))
            .finally(() => setLoading(false));
    }, [selectedPeriodId, currentGroup, currentSubject, selectedTopicId]);

    const fetchStudents = useCallback(() => {
        if (currentGroup) {
            apiClient.getStudentsByGroup(currentGroup.id)
                .then(setStudents)
                .catch(err => setError(prev => `${prev ? prev + '\n' : ''}Failed to fetch students: ${err.message}`));
        }
    }, [currentGroup]);

    const refreshAssignments = useCallback(() => {
        if (selectedTopicId) {
            apiClient.getAssignmentsByTopic(selectedTopicId)
                .then(setAllAssignments)
                .catch(err => setError(`Failed to refresh assignments: ${err.message}`));
        }
    }, [selectedTopicId]);

    useEffect(() => {
        if(currentGroup) {
            fetchTopics();
            fetchStudents();
        }
    }, [selectedPeriodId, currentGroup]);

    useEffect(() => {
        if (selectedTopicId) {
            setIsGradesLoading(true);
            apiClient.getGradesForTopic(selectedTopicId)
                .then(setGradeData)
                .catch(err => {
                    setError(`Failed to fetch grades: ${err.message}`);
                    setGradeData({ assignments: [], grades: {} });
                })
                .finally(() => setIsGradesLoading(false));
            refreshAssignments();
        } else {
            setAllAssignments(null);
            setGradeData({ assignments: [], grades: {} });
        }
    }, [selectedTopicId, refreshAssignments]);

    const assignmentCounts = useMemo(() => {
        if (!allAssignments) return { notebook: 0, practices: 0, exam: 0, others: 0 };
        return {
            notebook: allAssignments.notebookAssignments.length,
            practices: allAssignments.practiceAssignments.length,
            exam: allAssignments.examAssignments.length,
            others: allAssignments.otherAssignments.length,
        };
    }, [allAssignments]);

    const linkedClassroomAsgIds = useMemo(() => {
        if (!allAssignments) return new Set();
        const ids = [
            ...(allAssignments.notebookAssignments || []).map(a => a.classroomAsgId),
            ...(allAssignments.practiceAssignments || []).map(a => a.classroomAsgId),
            ...(allAssignments.examAssignments || []).map(a => a.classroomAsgId),
            ...(allAssignments.otherAssignments || []).map(a => a.classroomAsgId),
        ];
        return new Set(ids.filter(Boolean));
    }, [allAssignments]);

    const assignmentsForModal = useMemo(() => {
        if (!allAssignments || !selectedCategory) return [];
    
        switch (selectedCategory) {
            case 'Notebook':
                return allAssignments.notebookAssignments;
            case 'Practices':
                return allAssignments.practiceAssignments;
            case 'Exam':
                return allAssignments.examAssignments;
            case 'Others':
                return allAssignments.otherAssignments; 
            default:
                return [];
        }
    }, [allAssignments, selectedCategory]);

    const selectedTopic = useMemo(() => topics.find(t => t.id === selectedTopicId) || null, [selectedTopicId, topics]);

    const handleOpenViewAssignments = (category) => {
        setSelectedCategory(category);
        setIsViewAssignmentsModalOpen(true);
    };

    const handleOpenCreateAssignment = (category) => {
        setSelectedCategory(category);
        setIsCreateAssignmentModalOpen(true);
    };

    const handleOpenEditAssignment = (assignment) => {
        setAssignmentToEdit(assignment);
        setSelectedCategory(findCategoryForAssignment(assignment));
        setIsCreateAssignmentModalOpen(true);
    };
    
    const handleOpenDeleteAssignment = (assignment) => {
        setAssignmentToDelete(assignment);
        setSelectedCategory(findCategoryForAssignment(assignment));
        setIsDeleteAssignmentModalOpen(true);
    };

    const findCategoryForAssignment = (assignmentToFind) => {
        if (!allAssignments) return null;
        if (allAssignments.notebookAssignments.some(a => a.id === assignmentToFind.id)) return 'Notebook';
        if (allAssignments.practiceAssignments.some(a => a.id === assignmentToFind.id)) return 'Practices';
        if (allAssignments.examAssignments.some(a => a.id === assignmentToFind.id)) return 'Exam';
        if (allAssignments.otherAssignments.some(a => a.id === assignmentToFind.id)) return 'Others';
        return null;
    }

    const handleConfirmDelete = async () => {
        if (!assignmentToDelete || !selectedCategory) return;
        try {
            const categoryTitleCase = selectedCategory === 'Practices' ? 'Practice' : (selectedCategory === 'Others' ? 'Other' : selectedCategory);
            const deleteFunction = apiClient[`delete${categoryTitleCase}Assignment`];
            await deleteFunction(assignmentToDelete.id);
            refreshAssignments();
            setIsDeleteAssignmentModalOpen(false);
        } catch (err) {
            setError(`Failed to delete assignment: ${err.message}`);
        }
    };
    
    const handleShowQrCode = (student) => {
        setStudentForQr(student);
        setIsStudentsModalOpen(false);
        setIsQrModalOpen(true);
    };

    const handleCloseQrCode = () => {
        setIsQrModalOpen(false);
        setStudentForQr(null);
        setIsStudentsModalOpen(true);
    };

    if (!currentGroup || !currentSubject) {
        return <div style={{ padding: '2rem' }}>{t('groupWorkspace.notFound')}</div>;
    }

    const categories = [
        { name: 'Notebook', color: '#6A9A8B', count: assignmentCounts.notebook, weight: selectedTopic?.notebookWeight },
        { name: 'Practices', color: '#3B82F6', count: assignmentCounts.practices, weight: selectedTopic?.practiceWeight },
        { name: 'Exam', color: '#EF4444', count: assignmentCounts.exam, weight: selectedTopic?.examWeight },
        { name: 'Others', color: '#F97316', count: assignmentCounts.others, weight: selectedTopic?.otherWeight },
    ];

    return (
        <div className="group-workspace-container">
            {error && <div className="error-message" style={{ margin: '0 0 1.5rem 0' }}>{error}</div>}
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
                    <TopicsCard topics={topics} selectedTopicId={selectedTopicId} setSelectedTopicId={setSelectedTopicId} periodId={selectedPeriodId} subjectId={currentSubject.id} onTopicUpdate={fetchTopics} />
                </div>
                <div className="gw-grades-breakdown">
                    {selectedTopic ? categories.map(cat => (
                        <AssignmentCategoryCard
                            key={cat.name}
                            categoryName={t(`groupWorkspace.categories.${cat.name.toLowerCase()}`)}
                            weight={cat.weight}
                            assignmentCount={cat.count}
                            color={cat.color}
                            onView={() => handleOpenViewAssignments(cat.name)}
                            onCreate={() => handleOpenCreateAssignment(cat.name)}
                        />
                    )) : <p>{t('groupWorkspace.selectTopicPrompt')}</p>}
                </div>
                <div className="gw-grades-table-container">
                    <GradesTable selectedTopic={selectedTopic} students={students} gradeData={gradeData} isLoading={isGradesLoading} />
                </div>
            </div>

            <StudentsModal isOpen={isStudentsModalOpen} onClose={() => setIsStudentsModalOpen(false)} students={students} currentGroup={currentGroup} onUpdate={fetchStudents} onShowQrCode={handleShowQrCode} />
            <QRCodeModal isOpen={isQrModalOpen} onClose={handleCloseQrCode} student={studentForQr} />

            <ViewAssignmentsModal
                isOpen={isViewAssignmentsModalOpen}
                onClose={() => setIsViewAssignmentsModalOpen(false)}
                category={selectedCategory}
                assignments={assignmentsForModal}
                onEdit={handleOpenEditAssignment}
                onDelete={handleOpenDeleteAssignment}
            />
            <CreateAssignmentModal
                isOpen={isCreateAssignmentModalOpen}
                onClose={() => {
                    setIsCreateAssignmentModalOpen(false);
                    setAssignmentToEdit(null);
                }}
                topic={selectedTopic}
                category={selectedCategory}
                classroomCourseId={groupDetails?.classroomGroup?.classroomCourseId || null}
                linkedAsgIds={linkedClassroomAsgIds}
                onUpdate={refreshAssignments}
                assignmentToEdit={assignmentToEdit}
            />
            <DeleteAssignmentModal
                isOpen={isDeleteAssignmentModalOpen}
                onClose={() => {
                    setIsDeleteAssignmentModalOpen(false);
                    setAssignmentToDelete(null);
                }}
                assignment={assignmentToDelete}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
};

export default GroupWorkspacePage;