import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PiStudentBold } from 'react-icons/pi';
import { FaFilter, FaUsers, FaSearch, FaTimes } from 'react-icons/fa';
import { apiClient } from '../services/apiClient';
import QRCodeModal from '../components/specific/group_workspace/QRCodeModal';
import './StudentsPage.css';

const API_BASE_URL = `http://${window.location.hostname}:8000`;

const DEFAULT_FILTERS = {
  group: 'all',
  subject: 'all',
  search: '',
  status: 'all',
};

const StudentsPage = () => {
  const { t } = useTranslation();
  const [allStudents, setAllStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);

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
    const statuses = [...new Set(allStudents.map(s => s.status))];
    return { groups, subjects, statuses };
  }, [allStudents]);

  const hasActiveFilters = useMemo(
    () =>
      filters.group !== 'all' ||
      filters.subject !== 'all' ||
      filters.status !== 'all' ||
      filters.search.trim() !== '',
    [filters]
  );

  useEffect(() => {
    let students = [...allStudents];
    if (filters.group !== 'all') {
      students = students.filter(s => s.group.id === parseInt(filters.group, 10));
    }
    if (filters.subject !== 'all') {
      students = students.filter(s => s.subject.id === parseInt(filters.subject, 10));
    }
    if (filters.status !== 'all') {
      students = students.filter(s => s.status === filters.status);
    }
    const query = filters.search.trim().toLowerCase();
    if (query) {
      students = students.filter(s => {
        const haystack = [
          s.firstName,
          s.lastName,
          `${s.firstName} ${s.lastName}`,
          `${s.lastName} ${s.firstName}`,
          s.qrCodeId,
          s.classroomUserId,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      });
    }
    setFilteredStudents(students);
  }, [filters, allStudents]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (status) => {
    setFilters(prev => ({ ...prev, status }));
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
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

  if (loading) {
    return (
      <div className="students-page">
        <div className="students-atmosphere" aria-hidden="true" />
        <div className="students-loading">{t('studentsPage.loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="students-page">
        <div className="students-atmosphere" aria-hidden="true" />
        <div className="students-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="students-page">
      <div className="students-atmosphere" aria-hidden="true" />

      <header className="students-header-card">
        <div className="students-header-brand">
          <PiStudentBold className="students-brand-icon" aria-hidden="true" />
          <div>
            <h1>{t('studentsPage.title')}</h1>
            <p className="students-header-subtitle">{t('studentsPage.subtitle')}</p>
          </div>
        </div>
        <div className="students-header-stat" title={t('studentsPage.resultCount', { count: filteredStudents.length })}>
          <FaUsers aria-hidden="true" />
          <span className="students-stat-label">{t('studentsPage.showing')}</span>
          <span className="students-stat-badge">{filteredStudents.length}</span>
        </div>
      </header>

      <section className="students-filters-card">
        <div className="students-filters-head">
          <div className="students-filters-title">
            <FaFilter aria-hidden="true" />
            <h2>{t('studentsPage.filtersTitle')}</h2>
          </div>
          {hasActiveFilters && (
            <button type="button" className="students-clear-filters" onClick={clearFilters}>
              <FaTimes aria-hidden="true" />
              {t('studentsPage.clearFilters')}
            </button>
          )}
        </div>

        <div className="students-filters-body">
          <div className="students-search-field">
            <FaSearch className="students-search-icon" aria-hidden="true" />
            <input
              id="students-search"
              type="search"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              className="students-search-input"
              placeholder={t('studentsPage.filters.searchPlaceholder')}
              aria-label={t('studentsPage.filters.search')}
              autoComplete="off"
            />
            {filters.search && (
              <button
                type="button"
                className="students-search-clear"
                onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                aria-label={t('studentsPage.clearFilters')}
              >
                <FaTimes />
              </button>
            )}
          </div>

          <div className="students-filters-row">
            <div className="filter-group">
              <label htmlFor="group-filter">{t('studentsPage.filters.group')}</label>
              <div className="filter-select-wrap">
                <select
                  id="group-filter"
                  name="group"
                  value={filters.group}
                  onChange={handleFilterChange}
                  className={`filter-select${filters.group !== 'all' ? ' is-active' : ''}`}
                >
                  <option value="all">{t('studentsPage.filters.all')}</option>
                  {filterOptions.groups.map(g => (
                    <option key={g.id} value={g.id}>{`${g.grade}${g.name}`}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="filter-group">
              <label htmlFor="subject-filter">{t('studentsPage.filters.subject')}</label>
              <div className="filter-select-wrap">
                <select
                  id="subject-filter"
                  name="subject"
                  value={filters.subject}
                  onChange={handleFilterChange}
                  className={`filter-select${filters.subject !== 'all' ? ' is-active' : ''}`}
                >
                  <option value="all">{t('studentsPage.filters.all')}</option>
                  {filterOptions.subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="filter-group filter-group--status">
              <span className="filter-label" id="status-filter-label">
                {t('studentsPage.filters.status')}
              </span>
              <div
                className="students-status-pills"
                role="group"
                aria-labelledby="status-filter-label"
              >
                <button
                  type="button"
                  className={`students-status-pill${filters.status === 'all' ? ' is-active' : ''}`}
                  onClick={() => handleStatusChange('all')}
                >
                  {t('studentsPage.filters.all')}
                </button>
                {filterOptions.statuses.map(status => (
                  <button
                    key={status}
                    type="button"
                    className={`students-status-pill students-status-pill--${status}${filters.status === status ? ' is-active' : ''}`}
                    onClick={() => handleStatusChange(status)}
                  >
                    {t(`studentsPage.status.${status}`)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="students-table-card">
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
                        <button
                          type="button"
                          className="student-qr-button"
                          onClick={() => handleQrClick(student)}
                          title={t('studentsPage.openQr')}
                        >
                          <img
                            src={`${API_BASE_URL}/api/qr-code/${student.qrCodeId}.png`}
                            alt={`QR for ${student.firstName}`}
                            className="student-qr-code"
                          />
                        </button>
                      )}
                    </td>
                    <td><strong className="student-name-cell">{student.lastName}</strong></td>
                    <td><strong className="student-name-cell">{student.firstName}</strong></td>
                    <td>
                      <span
                        className="students-chip group-chip"
                        style={{ '--chip-color': student.group?.color || 'var(--primary-color)' }}
                      >
                        {`${student.group.grade}${student.group.name}`}
                      </span>
                    </td>
                    <td>
                      <span
                        className="students-chip subject-chip"
                        style={{ '--chip-color': student.subject?.color || 'var(--primary-color)' }}
                        title={student.subject.name}
                      >
                        {student.subject.name}
                      </span>
                    </td>
                    <td>
                      <span className="students-mono" title={student.qrCodeId || ''}>
                        {student.qrCodeId || '—'}
                      </span>
                    </td>
                    <td>
                      <span className="students-contact" title={student.contactNumber || ''}>
                        {student.contactNumber || '—'}
                      </span>
                    </td>
                    <td>
                      <span className="students-mono classroom-id" title={student.classroomUserId || ''}>
                        {student.classroomUserId || '—'}
                      </span>
                    </td>
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
      </section>

      <QRCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        student={selectedStudent}
      />
    </div>
  );
};

export default StudentsPage;
