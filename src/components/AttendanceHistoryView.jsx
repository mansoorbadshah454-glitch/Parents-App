import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, UserCheck, UserX, Clock } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

const AttendanceHistoryView = ({ kid, schoolId, onBack, t }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [attendanceData, setAttendanceData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttendance = async () => {
            if (!schoolId || !kid.id) return;
            setLoading(true);
            try {
                // Fetch attendance records for the school
                const q = query(
                    collection(db, `schools/${schoolId}/attendance`),
                    orderBy('date', 'desc')
                );
                const querySnapshot = await getDocs(q);
                const records = {};

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const dateStr = data.date; // Format expected: YYYY-MM-DD
                    const studentRecord = data.records?.find(r => r.studentId === kid.id);
                    if (studentRecord) {
                        records[dateStr] = studentRecord.status; // 'present' or 'absent'
                    }
                });
                setAttendanceData(records);
            } catch (error) {
                console.error("Error fetching attendance history:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAttendance();
    }, [schoolId, kid.id]);

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const renderCalendar = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const totalDays = daysInMonth(year, month);
        const startDay = firstDayOfMonth(year, month);
        const days = [];

        // Padding for the first week
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} style={{ width: '100%', aspectRatio: '1/1' }}></div>);
        }

        for (let day = 1; day <= totalDays; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const status = attendanceData[dateStr];

            let bgColor = 'transparent';
            let textColor = 'inherit';
            if (status === 'present') {
                bgColor = '#E6F4EA';
                textColor = '#1e8e3e';
            } else if (status === 'absent') {
                bgColor = '#FEF2F2';
                textColor = '#dc2626';
            }

            days.push(
                <div
                    key={day}
                    style={{
                        width: '100%',
                        aspectRatio: '1/1',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '12px',
                        background: bgColor,
                        color: textColor,
                        fontSize: '0.9rem',
                        fontWeight: '700',
                        position: 'relative',
                        border: status ? 'none' : '1px solid #F0F2F5'
                    }}
                >
                    {day}
                    {status && (
                        <div style={{
                            position: 'absolute',
                            bottom: '4px',
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            background: textColor
                        }} />
                    )}
                </div>
            );
        }

        return days;
    };

    const changeMonth = (offset) => {
        const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1);
        setCurrentMonth(newDate);
    };

    const stats = {
        present: Object.values(attendanceData).filter(s => s === 'present').length,
        absent: Object.values(attendanceData).filter(s => s === 'absent').length
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ padding: '20px', paddingBottom: '100px' }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
                <button
                    onClick={onBack}
                    style={{
                        background: '#E4E6EB',
                        border: 'none',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}
                >
                    <ChevronLeft size={24} />
                </button>
                <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>Attendance History</h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--fb-muted)', margin: 0 }}>{kid.name}</p>
                </div>
            </div>

            {/* Stats Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div className="card" style={{ padding: '15px', background: '#E6F4EA' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e8e3e', marginBottom: '4px' }}>
                        <UserCheck size={18} />
                        <span style={{ fontWeight: '700', fontSize: '0.8rem' }}>PRESENT</span>
                    </div>
                    <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e8e3e' }}>{stats.present} <small style={{ fontSize: '0.8rem', fontWeight: '400' }}>Days</small></span>
                </div>
                <div className="card" style={{ padding: '15px', background: '#FEF2F2' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626', marginBottom: '4px' }}>
                        <UserX size={18} />
                        <span style={{ fontWeight: '700', fontSize: '0.8rem' }}>ABSENT</span>
                    </div>
                    <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#dc2626' }}>{stats.absent} <small style={{ fontSize: '0.8rem', fontWeight: '400' }}>Days</small></span>
                </div>
            </div>

            {/* Calendar Card */}
            <div className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontWeight: '800', fontSize: '1rem' }}>
                        {currentMonth.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                    </h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => changeMonth(-1)} style={{ background: '#F0F2F5', border: 'none', padding: '5px', borderRadius: '8px' }}><ChevronLeft size={20} /></button>
                        <button onClick={() => changeMonth(1)} style={{ background: '#F0F2F5', border: 'none', padding: '5px', borderRadius: '8px' }}><ChevronRight size={20} /></button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', marginBottom: '10px' }}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                        <span key={d} style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--fb-muted)' }}>{d}</span>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                    {renderCalendar()}
                </div>

                <div style={{ marginTop: '25px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--fb-muted)' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1e8e3e' }}></div>
                        <span>Present</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--fb-muted)' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#dc2626' }}></div>
                        <span>Absent</span>
                    </div>
                </div>
            </div>

            {loading && (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--fb-muted)' }}>Loading records...</p>
                </div>
            )}
        </motion.div>
    );
};

export default AttendanceHistoryView;
