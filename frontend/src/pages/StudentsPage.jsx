import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PiStudentBold } from 'react-icons/pi';
import { apiClient } from '../services/apiClient';
import QRCodeModal from '../components/specific/group_workspace/QRCodeModal';
import './StudentsPage.css';

const API_BASE_URL = `http://${window.location.hostname}:8000`;

const StudentsPage = () => {
    const { t } = useTranslation();
    const [allStudents, setAllStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filters, setFilters] = useState({
        group: 'all',
        subject: 'all',
        firstName: 'all',
        lastName: 'all',
        status: 'all',
    });

    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                setLoading(true);
                const studentsData = await apiClient.getAllStudents();
                setAllStudents(studentsData);
                setFilteredStudents(studentsData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    const filterOptions = useMemo(() => {
        const groups = [...new Map(allStudents.map(s => [s.group.id, s.group])).values()];
        const subjects = [...new Map(allStudents.map(s => [s.subject.id, s.subject])).values()];
        const firstNames = [...new Set(allStudents.map(s => s.firstName))].sort();
        const lastNames = [...new Set(allStudents.map(s => s.lastName))].sort();
        const statuses = [...new Set(allStudents.map(s => s.status))];
        return { groups, subjects, firstNames, lastNames, statuses };
    }, [allStudents]);

    useEffect(() => {
        let students = [...allStudents];
        if (filters.group !== 'all') {
            students = students.filter(s => s.group.id === parseInt(filters.group));
        }
        if (filters.subject !== 'all') {
            students = students.filter(s => s.subject.id === parseInt(filters.subject));
        }
        if (filters.firstName !== 'all') {
            students = students.filter(s => s.firstName === filters.firstName);
        }
        if (filters.lastName !== 'all') {
            students = students.filter(s => s.lastName === filters.lastName);
        }
        if (filters.status !== 'all') {
            students = students.filter(s => s.status === filters.status);
        }
        setFilteredStudents(students);
    }, [filters, allStudents]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleQrClick = (student) => {
        setSelectedStudent(student);
        setIsQrModalOpen(true);
    };

    const getStatusClass = (status) => {
        if (status === 'inactive') return 'status-inactive';
        if (status === 'transferred') return 'status-transferred';
        return 'status-active';
    };

    if (loading) return <div>{t('studentsPage.loading')}</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="students-page-container">
            <header className="students-page-header">
                <h1>{t('studentsPage.title')}</h1>
                <PiStudentBold size="2rem" />
            </header>

            <div className="filters-container">
                <div className="filter-group">
                    <label htmlFor="group-filter">{t('studentsPage.filters.group')}</label>
                    <select id="group-filter" name="group" value={filters.group} onChange={handleFilterChange} className="filter-select">
                        <option value="all">{t('studentsPage.filters.all')}</option>
                        {filterOptions.groups.map(g => (
                            <option key={g.id} value={g.id}>{`${g.grade}${g.name}`}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label htmlFor="subject-filter">{t('studentsPage.filters.subject')}</label>
                    <select id="subject-filter" name="subject" value={filters.subject} onChange={handleFilterChange} className="filter-select">
                        <option value="all">{t('studentsPage.filters.all')}</option>
                        {filterOptions.subjects.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>
                
                <div className="filter-group">
                    <label htmlFor="firstName-filter">{t('studentsPage.filters.firstName')}</label>
                    <select id="firstName-filter" name="firstName" value={filters.firstName} onChange={handleFilterChange} className="filter-select">
                        <option value="all">{t('studentsPage.filters.all')}</option>
                        {filterOptions.firstNames.map(name => <option key={name} value={name}>{name}</option>)}
                    </select>
                </div>
                
                <div className="filter-group">
                    <label htmlFor="lastName-filter">{t('studentsPage.filters.lastName')}</label>
                    <select id="lastName-filter" name="lastName" value={filters.lastName} onChange={handleFilterChange} className="filter-select">
                        <option value="all">{t('studentsPage.filters.all')}</option>
                        {filterOptions.lastNames.map(name => <option key={name} value={name}>{name}</option>)}
                    </select>
                </div>

                <div className="filter-group">
                    <label htmlFor="status-filter">{t('studentsPage.filters.status')}</label>
                    <select id="status-filter" name="status" value={filters.status} onChange={handleFilterChange} className="filter-select">
                        <option value="all">{t('studentsPage.filters.all')}</option>
                        {filterOptions.statuses.map(status => (
                            <option key={status} value={status}>{t(`studentsPage.status.${status}`)}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="students-table-container">
                <table className="students-table">
                    <thead>
                        <tr>
                            <th>{t('studentsPage.table.qrCode')}</th>
                            <th>{t('studentsPage.table.lastName')}</th>
                            <th>{t('studentsPage.table.firstName')}</th>
                            <th>{t('studentsPage.table.group')}</th>
                            <th>{t('studentsPage.table.subject')}</th>
                            <th>{t('studentsPage.table.id')}</th>
                            <th>{t('studentsPage.table.contact')}</th>
                            <th>{t('studentsPage.table.classroomId')}</th>
                            <th>{t('studentsPage.table.status')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map(student => (
                                <tr key={student.id}>
                                    <td>
                                        {student.qrCodeId && (
                                            <img
                                                src={`${API_BASE_URL}/api/qr-code/${student.qrCodeId}.png`}
                                                alt={`QR for ${student.firstName}`}
                                                className="student-qr-code"
                                                onClick={() => handleQrClick(student)}
                                            />
                                        )}
                                    </td>
                                    <td><strong>{student.lastName}</strong></td>
                                    <td><strong>{student.firstName}</strong></td>
                                    <td>{`${student.group.grade}${student.group.name}`}</td>
                                    <td>{student.subject.name}</td>
                                    <td>{student.qrCodeId || ''}</td>
                                    <td>{student.contactNumber || ''}</td>
                                    <td>{student.classroomUserId || ''}</td>
                                    <td>
                                        <span className={`status-badge ${getStatusClass(student.status)}`}>
                                            {t(`studentsPage.status.${student.status}`)}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9" className="no-students-message">
                                    {t('studentsPage.noStudents')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <QRCodeModal
                isOpen={isQrModalOpen}
                onClose={() => setIsQrModalOpen(false)}
                student={selectedStudent}
            />
        </div>
    );
};

export default StudentsPage;