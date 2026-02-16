import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Shield, Mail, Lock, ArrowRight, Loader2, Database, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const normalizedEmail = email.toLowerCase().trim();
            const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
            const user = userCredential.user;

            const userDoc = await getDoc(doc(db, "global_users", user.uid));
            if (userDoc.exists() && userDoc.data().role === 'parent') {
                const schoolId = userDoc.data().schoolId;

                localStorage.setItem('parent_session', JSON.stringify({
                    uid: user.uid,
                    schoolId: schoolId,
                    role: 'parent',
                    email: user.email,
                    name: userDoc.data().name || 'Parent'
                }));

                const schoolSnap = await getDoc(doc(db, "schools", schoolId));
                if (schoolSnap.exists() && schoolSnap.data().status === 'suspended') {
                    await auth.signOut();
                    setError('Access Denied: School system suspended.');
                    return;
                }

                navigate('/');
            } else {
                await auth.signOut();
                setError('Access Denied: Not a Parent account.');
            }
        } catch (authErr) {
            setError("Invalid credentials. Please verify.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page" style={{
            height: '100dvh',
            width: '100dvw',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--fb-bg)',
            padding: '2rem'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
                style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '2.5rem 2rem',
                    borderRadius: '24px',
                    zIndex: 10
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ margin: '0 auto 1.5rem', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--fb-blue)', borderRadius: '24px' }}>
                        <GraduationCap color="white" size={40} />
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--fb-blue)' }}>PARENTS</h1>
                    <p style={{ color: 'var(--fb-muted)', fontSize: '0.875rem' }}>School Management System</p>
                </div>

                {error && (
                    <div style={{ background: '#FEF2F2', border: '1px solid #FEE2E2', color: '#DC2626', padding: '0.9rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.825rem', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--fb-muted)', display: 'block', marginBottom: '8px' }}>Email</label>
                        <div style={{ position: 'relative' }}>
                            <Mail style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--fb-muted)' }} size={18} />
                            <input
                                type="email"
                                style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', border: '1px solid var(--fb-border)', borderRadius: '12px', fontSize: '1rem', outline: 'none' }}
                                placeholder="parent@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--fb-muted)', display: 'block', marginBottom: '8px' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--fb-muted)' }} size={18} />
                            <input
                                type="password"
                                style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', border: '1px solid var(--fb-border)', borderRadius: '12px', fontSize: '1rem', outline: 'none' }}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-press"
                        style={{ width: '100%', padding: '1rem', marginTop: '1rem', borderRadius: '12px', fontSize: '1rem', fontWeight: '700', border: 'none', color: 'white', background: 'var(--fb-blue)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                        {loading ? <Loader2 className="animate-spin" size={24} /> : <>Login <ArrowRight size={20} /></>}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;
