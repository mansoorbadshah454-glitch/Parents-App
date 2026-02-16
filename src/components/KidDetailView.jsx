import React from 'react';
import { motion } from 'framer-motion';
import { Heart, TrendingUp, UserCheck, Calendar, ChevronRight, FileText } from 'lucide-react';

const MetricCard = ({ label, value, icon: Icon, color }) => (
    <div className="card" style={{
        padding: '15px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(168, 85, 247, 0.1)',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ padding: '8px', background: `${color}15`, borderRadius: '10px' }}>
                <Icon size={20} color={color} />
            </div>
            <span style={{ fontWeight: '800', color, fontSize: '1.1rem' }}>{value}%</span>
        </div>
        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--fb-muted)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{label}</span>
    </div>
);

const KidDetailView = ({ kid, onBack, onShowAttendance, onShowReportCard, t }) => (
    <motion.div initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 300, opacity: 0 }} style={{ padding: '15px', paddingBottom: '100px' }}>
        <button onClick={onBack} style={{ background: '#E4E6EB', border: 'none', padding: '10px 15px', borderRadius: '10px', fontWeight: '700', marginBottom: '20px' }}>← {t.back || 'Back'}</button>

        <div className="card" style={{
            padding: '12px 20px',
            textAlign: 'center',
            position: 'relative',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(243, 232, 255, 0.8) 100%)',
            border: 'none',
            boxShadow: '0 15px 35px -5px rgba(107, 33, 168, 0.3)',
            overflow: 'hidden',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)'
        }}>
            {/* Decorative accents, sparks and shines */}
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '80px', height: '80px', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', bottom: '-20px', left: '-10px', width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)', borderRadius: '50%' }} />

            {/* Dynamic Sparks */}
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    animate={{
                        scale: [0, 1, 0],
                        opacity: [0, 0.8, 0],
                        y: [0, -20, -40],
                        x: [0, (i % 2 === 0 ? 10 : -10), (i % 2 === 0 ? 20 : -20)]
                    }}
                    transition={{
                        duration: 2 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 5,
                        ease: "easeInOut"
                    }}
                    style={{
                        position: 'absolute',
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        width: '4px',
                        height: '4px',
                        background: '#a855f7',
                        borderRadius: '50%',
                        boxShadow: '0 0 10px #a855f7',
                        pointerEvents: 'none'
                    }}
                />
            ))}

            <img src={kid.image} style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                border: '4px solid #a855f7',
                marginBottom: '10px',
                background: 'white',
                boxShadow: '0 8px 20px rgba(168, 85, 247, 0.2)',
                position: 'relative',
                zIndex: 2
            }} alt={kid.name} />

            {/* Moving Shine Sweep - Moved to be on top */}
            <motion.div
                animate={{
                    left: ['-100%', '200%'],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatDelay: 2
                }}
                style={{
                    position: 'absolute',
                    top: 0,
                    width: '30%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                    transform: 'skewX(-25deg)',
                    pointerEvents: 'none',
                    zIndex: 3
                }}
            />
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#6b21a8' }}>{kid.name}</h2>
            <p style={{ color: '#a855f7', fontSize: '0.9rem', fontWeight: '700', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{kid.class}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '5px' }}>
                <div style={{ background: '#E7F3FF', padding: '15px', borderRadius: '16px' }}>
                    <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: '800', color: '#1877F2' }}>#{kid.rank}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#1877F2' }}>{t.rank}</span>
                </div>
                <div
                    onClick={onShowAttendance}
                    style={{ background: '#E6F4EA', padding: '15px', borderRadius: '16px', cursor: 'pointer', transition: 'transform 0.2s' }}
                    className="btn-press"
                >
                    <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: '800', color: '#1E8E3E' }}>{kid.attendance}%</span>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#1E8E3E' }}>{t.attendance}</span>
                        <ChevronRight size={12} color="#1E8E3E" />
                    </div>
                </div>
            </div>
        </div>

        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '20px 0 10px' }}>{t.subject_scores}</h3>
        <div className="card" style={{ padding: '20px' }}>
            {Object.entries(kid.scores || {}).map(([sub, score]) => (
                <div key={sub} style={{ marginBottom: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
                        <span style={{ fontWeight: '600' }}>{sub}</span>
                        <span style={{ fontWeight: '800', color: 'var(--fb-blue)' }}>{score}%</span>
                    </div>
                    <div style={{ height: '8px', background: '#E4E6EB', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${score}%`, background: 'var(--fb-blue)', borderRadius: '10px' }}></div>
                    </div>
                </div>
            ))}
        </div>

        <button
            onClick={() => onShowReportCard(kid)}
            style={{
                width: '100%',
                marginTop: '20px',
                padding: '16px',
                background: 'linear-gradient(135deg, #1877F2 0%, #0056b3 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                fontWeight: '800',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 10px 20px rgba(24, 119, 242, 0.2)',
                cursor: 'pointer'
            }}
            className="btn-press"
        >
            <FileText size={20} />
            {t.view_report_card || 'View Report Card'}
        </button>

        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '20px 0 10px' }}>Analytics & Progress</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <MetricCard label={t.behavior} value={kid.behavior} icon={Heart} color="#F43F5E" />
            <MetricCard label={t.health} value={kid.health} icon={TrendingUp} color="#10B981" />
            <MetricCard label={t.hygiene} value={kid.hygiene} icon={UserCheck} color="#6366F1" />
            <MetricCard label={t.homework} value={88} icon={Calendar} color="#F59E0B" />
        </div>
    </motion.div>
);

export default KidDetailView;
