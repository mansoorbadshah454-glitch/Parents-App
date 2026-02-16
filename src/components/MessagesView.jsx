import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { MessageSquare, User, Clock, CheckCheck } from 'lucide-react';

const MessagesView = ({ user, t }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    const schoolId = user?.schoolId;
    const parentId = user?.uid;

    useEffect(() => {
        if (!schoolId || !parentId) return;

        const q = query(
            collection(db, `schools/${schoolId}/messages`),
            where("parentId", "==", parentId),
            orderBy('timestamp', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timeString: doc.data().timestamp ? new Date(doc.data().timestamp.toDate()).toLocaleString() : 'Just now'
            }));
            setMessages(list);
            setLoading(false);

            // Mark unread messages as read (optional but good UX)
            // For now, parents just view them.
        }, (err) => {
            console.error("Messages Error:", err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [schoolId, parentId]);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '15px', paddingBottom: '100px' }}>
            <h2 style={{ fontWeight: '800', marginBottom: '20px' }}>Messages / پیغامات</h2>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Loading messages...</div>
            ) : messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', opacity: 0.5 }}>
                    <MessageSquare size={48} style={{ marginBottom: '15px' }} />
                    <p>No messages from school yet.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {messages.map(msg => (
                        <div key={msg.id} className="card" style={{
                            padding: '18px',
                            background: 'white',
                            borderRadius: '18px',
                            border: 'none',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {/* Unread indicator */}
                            {!msg.read && (
                                <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', background: 'var(--fb-blue)' }} />
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#E7F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <User size={20} color="var(--fb-blue)" />
                                    </div>
                                    <div>
                                        <h4 style={{ fontWeight: '700', fontSize: '0.95rem' }}>{msg.teacherName || 'School Admin'}</h4>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--fb-muted)' }}>{msg.type === 'direct' ? 'Direct Message' : 'Announcement'}</p>
                                    </div>
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--fb-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Clock size={12} />
                                    <span>{msg.timeString}</span>
                                </div>
                            </div>

                            <div style={{
                                background: '#f8f9fa',
                                padding: '12px 15px',
                                borderRadius: '12px',
                                fontSize: '0.95rem',
                                lineHeight: '1.5',
                                color: '#1c1e21',
                                borderLeft: '3px solid #dee2e6'
                            }}>
                                {msg.message}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: msg.read ? 'var(--fb-blue)' : 'var(--fb-muted)' }}>
                                    {msg.read && <CheckCheck size={14} />}
                                    <span>{msg.read ? 'Seen' : 'Delivered'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--fb-muted)', marginTop: '30px' }}>
                Note: You can only view messages. Replies are disabled.
            </p>
        </motion.div>
    );
};

export default MessagesView;
