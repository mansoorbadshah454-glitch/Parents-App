import React from 'react';
import { motion } from 'framer-motion';
import { Bell, BellRing, Award } from 'lucide-react';

const NotificationsView = ({ items, t }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '15px', paddingBottom: '100px' }}>
        <h2 style={{ fontWeight: '800', marginBottom: '20px' }}>{t.notifications}</h2>
        {items.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--fb-muted)' }}>
                <Bell size={48} style={{ opacity: 0.3, marginBottom: '10px' }} />
                <p>No notifications yet</p>
            </div>
        )}
        {items.map(item => (
            <div key={item.id} className="card" style={{ padding: '15px', display: 'flex', gap: '15px', background: item.read ? 'transparent' : 'rgba(24, 119, 242, 0.05)', marginBottom: '10px' }}>
                <div style={{
                    width: '50px', height: '50px', borderRadius: '50%',
                    background: item.status === 'present' ? '#E6F4EA' : '#FEF2F2',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    {item.type === 'attendance' ? (
                        <BellRing color={item.status === 'present' ? '#10b981' : '#dc2626'} />
                    ) : (
                        <Award color="var(--fb-blue)" />
                    )}
                </div>
                <div style={{ flex: 1 }}>
                    {item.type === 'attendance' ? (
                        <p style={{ fontSize: '0.95rem' }}>
                            <b>{item.studentName}</b> was marked{' '}
                            <span style={{
                                color: item.status === 'present' ? '#10b981' : '#dc2626',
                                fontWeight: '700',
                                textTransform: 'uppercase'
                            }}>
                                {item.status}
                            </span>{' '}
                            in {item.className}
                        </p>
                    ) : (
                        <p style={{ fontSize: '0.95rem' }}>
                            <b>{item.studentName}</b> {item.message}
                        </p>
                    )}
                    <p style={{ fontSize: '0.8rem', color: 'var(--fb-muted)', marginTop: '4px' }}>
                        {item.time}
                    </p>
                </div>
            </div>
        ))}
    </motion.div>
);

export default NotificationsView;
