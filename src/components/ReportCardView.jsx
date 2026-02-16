import React from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, ChevronLeft, Award, Calendar, User, BookOpen } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ReportCardView = ({ kid, schoolInfo, onBack, t, isRTL }) => {

    const downloadPDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // Header
        doc.setFillColor(24, 119, 242);
        doc.rect(0, 0, pageWidth, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text(schoolInfo.name.toUpperCase(), pageWidth / 2, 20, { align: 'center' });

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('OFFICIAL ACADEMIC REPORT CARD', pageWidth / 2, 30, { align: 'center' });

        // Student Info Box
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.rect(14, 50, pageWidth - 28, 40);

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('STUDENT NAME:', 20, 60);
        doc.text('CLASS:', 20, 70);
        doc.text('ROLL NO:', 20, 80);

        doc.setFont('helvetica', 'normal');
        doc.text(kid.name.toUpperCase(), 60, 60);
        doc.text(kid.class, 60, 70);
        doc.text(kid.rollNo || 'N/A', 60, 80);

        doc.setFont('helvetica', 'bold');
        doc.text('RANK:', 130, 60);
        doc.text('ATTENDANCE:', 130, 70);
        doc.text('DATE:', 130, 80);

        doc.setFont('helvetica', 'normal');
        doc.text(`#${kid.rank}`, 165, 60);
        doc.text(`${kid.attendance}%`, 165, 70);
        doc.text(new Date().toLocaleDateString(), 165, 80);

        // Scores Table
        const tableData = Object.entries(kid.scores || {}).map(([subject, score]) => [
            subject,
            '100',
            score.toString(),
            score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : 'D'
        ]);

        doc.autoTable({
            startY: 100,
            head: [['Subject', 'Total Marks', 'Obtained Marks', 'Grade']],
            body: tableData,
            headStyles: { fillColor: [24, 119, 242], textColor: [255, 255, 255], fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [245, 247, 250] },
            margin: { top: 100 }
        });

        // Summary Statistics
        const finalY = doc.lastAutoTable.finalY + 20;
        doc.setFont('helvetica', 'bold');
        doc.text('WELLNESS & PERFORMANCE SUMMARY', 14, finalY);

        doc.autoTable({
            startY: finalY + 5,
            body: [
                ['Behavior', `${kid.behavior}%`, 'Health & Fitness', `${kid.health}%`],
                ['Hygiene', `${kid.hygiene}%`, 'Homework Completion', '88%']
            ],
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 5 }
        });

        // Footer
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        const footerY = doc.internal.pageSize.getHeight() - 20;
        doc.text('This is a computer-generated report and does not require a physical signature.', pageWidth / 2, footerY, { align: 'center' });

        doc.save(`${kid.name}_Report_Card.pdf`);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{ padding: '20px', paddingBottom: '100px' }}
        >
            {/* Header with Back Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
                <button
                    onClick={onBack}
                    style={{
                        width: '40px', height: '40px', borderRadius: '12px',
                        background: 'white', border: '1px solid #e5e7eb',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                    }}
                >
                    <ChevronLeft size={20} color="#1f2937" />
                </button>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1f2937' }}>{t.report_card || 'Academic Report Card'}</h2>
            </div>

            {/* Preview Card */}
            <div style={{
                background: 'white',
                borderRadius: '24px',
                padding: '30px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                border: '1px solid #f3f4f6',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '6px',
                    background: 'linear-gradient(90deg, #1877F2, #8A2BE2)'
                }} />

                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{
                        width: '70px', height: '70px', borderRadius: '50%',
                        background: '#f8fafc', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', margin: '0 auto 15px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <Award size={32} color="#1877F2" />
                    </div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0 }}>{kid.name}</h3>
                    <p style={{ color: '#6b7280', fontWeight: '600', fontSize: '0.9rem' }}>{kid.class} • Roll No: {kid.rollNo || 'N/A'}</p>
                </div>

                {/* Quick Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
                    <div style={{ background: '#eff6ff', padding: '15px', borderRadius: '16px', textAlign: 'center' }}>
                        <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: '800', color: '#1877F2' }}>#{kid.rank}</span>
                        <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#1d4ed8', textTransform: 'uppercase' }}>{t.rank}</span>
                    </div>
                    <div style={{ background: '#f0fdf4', padding: '15px', borderRadius: '16px', textAlign: 'center' }}>
                        <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: '800', color: '#16a34a' }}>{kid.attendance}%</span>
                        <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#15803d', textTransform: 'uppercase' }}>{t.attendance}</span>
                    </div>
                </div>

                {/* Score List */}
                <div style={{ marginBottom: '30px' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BookOpen size={18} color="#6b7280" />
                        {t.subject_scores}
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {Object.entries(kid.scores || {}).map(([subject, score]) => (
                            <div key={subject} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '12px 15px', background: '#f9fafb', borderRadius: '12px'
                            }}>
                                <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{subject}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontWeight: '800', color: '#111827' }}>{score}</span>
                                    <span style={{
                                        padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800',
                                        background: score >= 80 ? '#dcfce7' : score >= 60 ? '#fef9c3' : '#fee2e2',
                                        color: score >= 80 ? '#166534' : score >= 60 ? '#854d0e' : '#991b1b'
                                    }}>
                                        {score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : 'D'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Download Button */}
                <button
                    onClick={downloadPDF}
                    style={{
                        width: '100%', padding: '18px', borderRadius: '16px',
                        background: 'linear-gradient(135deg, #1877F2 0%, #0056b3 100%)',
                        color: 'white', fontWeight: '800', border: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                        boxShadow: '0 10px 25px rgba(24, 119, 242, 0.25)',
                        cursor: 'pointer'
                    }}
                    className="btn-press"
                >
                    <Download size={22} />
                    {t.download_pdf || 'Download Full Report PDF'}
                </button>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'center', padding: '0 10px' }}>
                <p style={{ fontSize: '0.8rem', color: '#9ca3af', lineHeight: '1.4' }}>
                    This report represents the current academic progress and is subject to final moderation by the school administration.
                </p>
            </div>
        </motion.div>
    );
};

export default ReportCardView;
