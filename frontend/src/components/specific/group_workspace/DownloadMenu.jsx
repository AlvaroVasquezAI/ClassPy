import React, { useState } from 'react';
import { useTranslation } from 'react-i18next'; 
import { FaDownload, FaFileCsv, FaQrcode, FaFilePdf } from 'react-icons/fa';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './DownloadMenu.css';

const API_BASE_URL = `http://${window.location.hostname}:8000`;

const DownloadMenu = ({ students, currentGroup, currentSubject }) => {
    const { t } = useTranslation(); 
    const [isOpen, setIsOpen] = useState(false);

    const handleDownloadCSV = () => {
        const headers = ["ID", "Last Name", "First Name", "QR Code ID", "Contact Number", "Status"];
        const rows = students.map(s => [s.id, s.lastName, s.firstName, s.qrCodeId, s.contactNumber || '', s.status]);
        let csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.map(e => e.join(",")).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `students_${currentGroup.grade}${currentGroup.name}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsOpen(false);
    };

    const handleDownloadDataPDF = () => {
        const doc = new jsPDF();
        doc.text(`Student Roster - ${currentGroup.grade}${currentGroup.name} (${currentSubject.name})`, 14, 15);
        doc.autoTable({
            startY: 20,
            head: [['Last Name', 'First Name', 'QR Code ID', 'Contact', 'Status']],
            body: students.map(s => [s.lastName, s.firstName, s.qrCodeId, s.contactNumber || '', s.status]),
        });
        doc.save(`student_data_${currentGroup.grade}${currentGroup.name}.pdf`);
        setIsOpen(false);
    };

    const qrPdfUrl = `${API_BASE_URL}/api/download/qr-codes/${currentGroup.id}.pdf`;

    return (
        <div className="gw-dm-container">
            <button className="gw-dm-main-btn" onClick={() => setIsOpen(!isOpen)}>
                <FaDownload />
            </button>
            {isOpen && (
                <div className="gw-dm-menu">
                    <button onClick={handleDownloadCSV}><FaFileCsv /> {t('groupWorkspace.downloadMenu.csv')}</button>
                    <button onClick={handleDownloadDataPDF}><FaFilePdf /> {t('groupWorkspace.downloadMenu.pdfData')}</button>
                    <a href={qrPdfUrl} target="_blank" rel="noopener noreferrer" onClick={() => setIsOpen(false)}>
                        <FaQrcode /> {t('groupWorkspace.downloadMenu.pdfQr')}
                    </a>
                </div>
            )}
        </div>
    );
};

export default DownloadMenu;