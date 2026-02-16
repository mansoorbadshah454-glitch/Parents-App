import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home,
    Users,
    Bell,
    Menu,
    Search,
    MessageCircle,
    ThumbsUp,
    Share2,
    MoreHorizontal,
    ChevronRight,
    TrendingUp,
    Award,
    Calendar,
    Heart,
    UserCheck,
    Languages,
    Settings,
    X,
    LogOut,
    ShieldCheck,
    BellRing,
    Plus
} from 'lucide-react';
import { translations } from '../translations';
import { db, storage } from '../firebase';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, arrayUnion, arrayRemove, increment, getDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';

const ParentPortal = ({ user }) => {
    const [lang, setLang] = useState('en');
    const [activeTab, setActiveTab] = useState('feed'); // 'feed', 'kids', 'notif', 'menu'
    const [selectedKid, setSelectedKid] = useState(null);
    const [showSettings, setShowSettings] = useState(false);
    const [schoolInfo, setSchoolInfo] = useState({ name: 'School Portal', logo: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' });
    const [posts, setPosts] = useState([]); // Added missing state for posts

    const t = translations[lang];
    const isRTL = lang === 'ur';

    // State for real-time notifications
    const [notifications, setNotifications] = useState([]);

    // Authenticated data from props
    const schoolId = user?.schoolId;
    const parentUserId = user?.uid;

    // Kids Data (Hardcoded for now as per current app state)
    // In a real scenario, this would come from a user profile fetch
    const [kids] = useState([
        { id: 1, name: "Ali Ahmed", class: "10-A", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kid1", rank: 3, attendance: 94, health: 98, behavior: 92, hygiene: 100, scores: { Math: 85, Science: 92, English: 88, History: 74 } },
        { id: 2, name: "Zainab Ahmed", class: "6-B", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kid2", rank: 1, attendance: 98, health: 95, behavior: 98, hygiene: 95, scores: { Math: 96, Science: 94, English: 98, History: 92 } }
    ]);

    // Real-time Notifications Listener
    useEffect(() => {
        if (!schoolId || !parentUserId) return;

        // Fetch School Info (Name & Logo)
        const fetchSchoolInfo = async () => {
            console.log("ParentPortal: Fetching info for school:", schoolId);
            try {
                // Path 1: Root Doc (Newer architecture)
                const schoolDoc = await getDoc(doc(db, "schools", schoolId));
                let fetchedName = '';
                let fetchedLogo = '';

                if (schoolDoc.exists()) {
                    fetchedName = schoolDoc.data().name || '';
                    fetchedLogo = schoolDoc.data().logo || schoolDoc.data().profileImage || '';
                }

                // Path 2: Settings/Profile doc (Legacy or specific settings)
                if (!fetchedLogo) {
                    const settingsSnap = await getDoc(doc(db, `schools/${schoolId}/settings`, 'profile'));
                    if (settingsSnap.exists()) {
                        fetchedName = fetchedName || settingsSnap.data().name || '';
                        fetchedLogo = settingsSnap.data().profileImage || '';
                    }
                }

                // Path 3: Direct Storage check (Fallback)
                if (!fetchedLogo) {
                    console.log("ParentPortal: Trying direct storage fallback...");
                    const extensions = ['png', 'jpg', 'jpeg', 'webp'];
                    for (const ext of extensions) {
                        try {
                            const logoPath = `schools/${schoolId}/profile.${ext}`;
                            const logoRef = ref(storage, logoPath);
                            fetchedLogo = await getDownloadURL(logoRef);
                            if (fetchedLogo) {
                                console.log(`ParentPortal: Found storage logo: ${logoPath}`);
                                break;
                            }
                        } catch (err) { }
                    }
                }

                setSchoolInfo({
                    name: fetchedName || 'School Portal',
                    logo: fetchedLogo || 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png'
                });
            } catch (e) {
                console.error("ParentPortal: Error fetching school info", e);
            }
        };

        fetchSchoolInfo();

        const q = query(
            collection(db, `schools/${schoolId}/notifications`),
            where("parentId", "==", parentUserId),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                time: doc.data().createdAt ? new Date(doc.data().createdAt.toDate()).toLocaleString() : 'Just now'
            }));
            setNotifications(fetched);
        }, (err) => {
            console.log("Notifications Error:", err);
        });

        return () => unsubscribe();
    }, [parentUserId, schoolId]);

    useEffect(() => {
        if (!schoolId) return;

        const q = query(
            collection(db, `schools/${schoolId}/posts`),
            orderBy('timestamp', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Client-side Filtering for Audience
            const filtered = fetched.filter(post => {
                if (post.audience === 'all' || !post.audience) return true;
                if (post.audience === 'class') {
                    // Check if any kid belongs to the target class
                    // Using Class Name matching for now as per instructions and available data
                    // Ideally should match IDs if available in kids data
                    return kids.some(kid =>
                        kid.class === post.targetClassName ||
                        kid.class === post.targetClassId // Fallback if IDs were used
                    );
                }
                return false;
            });

            setPosts(filtered);
        }, (err) => {
            console.log("Feed Error (likely wrong School ID):", err);
            // Fallback for demo if permission fails or ID wrong
        });

        return () => unsubscribe();
    }, [kids]);
    // END: Real Feed Logic

    const handleLike = async (post) => {
        const schoolId = "10LdYt5s40hE007y"; // consistent ID
        // Optimistic update handled by listener
        const postRef = doc(db, `schools/${schoolId}/posts`, post.id);
        const isLiked = post.likes?.includes(parentUserId);

        try {
            if (isLiked) {
                await updateDoc(postRef, {
                    likes: arrayRemove(parentUserId)
                });
            } else {
                await updateDoc(postRef, {
                    likes: arrayUnion(parentUserId)
                });
            }
        } catch (error) {
            console.error("Error liking post parent:", error);
        }
    };

    const handleShare = async (post) => {
        const schoolId = "10LdYt5s40hE007y";
        try {
            // Just increment count for now
            const postRef = doc(db, `schools/${schoolId}/posts`, post.id);
            await updateDoc(postRef, {
                shares: increment(1)
            });
            alert("Post shared!");
        } catch (error) {
            console.error("Error sharing post parent:", error);
        }
    };
    const handleLogout = async () => {
        try {
            await auth.signOut();
            localStorage.removeItem('parent_session');
            window.location.href = '/login';
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <div className={`app-container ${isRTL ? 'rtl urdu-text' : ''}`}>
            {/* Settings Modal */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div
                        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--fb-bg)', zIndex: 2000, maxWidth: '500px', margin: '0 auto', padding: '20px' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                            <h2 style={{ fontWeight: '800' }}>Settings / ترتیبات</h2>
                            <button onClick={() => setShowSettings(false)} style={{ background: '#E4E6EB', border: 'none', padding: '10px', borderRadius: '50%' }}><X /></button>
                        </div>

                        <div className="card" style={{ padding: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Languages color="var(--fb-blue)" />
                                    <span style={{ fontWeight: '600' }}>Language / زبان </span>
                                </div>
                                <div style={{ display: 'flex', background: '#E4E6EB', borderRadius: '20px', padding: '4px' }}>
                                    <button
                                        onClick={() => setLang('en')}
                                        style={{ background: lang === 'en' ? 'var(--fb-blue)' : 'transparent', color: lang === 'en' ? 'white' : 'inherit', border: 'none', padding: '6px 15px', borderRadius: '18px', fontWeight: '700' }}
                                    >EN</button>
                                    <button
                                        onClick={() => setLang('ur')}
                                        style={{ background: lang === 'ur' ? 'var(--fb-blue)' : 'transparent', color: lang === 'ur' ? 'white' : 'inherit', border: 'none', padding: '4px 15px', borderRadius: '18px', fontWeight: '700' }}
                                    >اردو</button>
                                </div>
                            </div>
                        </div>

                        <div className="card" onClick={handleLogout} style={{ padding: '15px', marginTop: '15px', cursor: 'pointer' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#dc2626' }}>
                                <LogOut />
                                <span style={{ fontWeight: '600' }}>Logout Sessions</span>
                            </div>
                        </div>

                        <p style={{ textAlign: 'center', color: 'var(--fb-muted)', fontSize: '0.8rem', marginTop: '20px' }}>SchoolPro Parent App v1.0.4</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <header style={{
                background: 'var(--fb-card)',
                padding: '10px 15px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                borderBottom: '1px solid var(--fb-border)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={schoolInfo.logo} style={{ width: '35px', height: '35px' }} alt="Logo" />
                    <h1 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--fb-blue)' }}>{schoolInfo.name}</h1>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setShowSettings(true)} className="btn-press" style={{ background: '#E4E6EB', border: 'none', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}>
                        <Settings size={20} />
                    </button>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {selectedKid ? (
                    <KidDetailView key="detail" kid={selectedKid} onBack={() => setSelectedKid(null)} t={t} isRTL={isRTL} />
                ) : activeTab === 'notif' ? (
                    <NotificationsView key="notif" items={notifications} t={t} />
                ) : (
                    <motion.div key="feed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

                        {/* Kids Circular Slider */}
                        <div style={{ padding: '15px 15px', display: 'flex', gap: '20px', overflowX: 'auto', background: 'var(--fb-card)', marginBottom: '10px', scrollbarWidth: 'none' }}>
                            {kids.map(kid => (
                                <div key={kid.id} onClick={() => setSelectedKid(kid)} className="btn-press" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', minWidth: '70px', cursor: 'pointer' }}>
                                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '3px solid var(--fb-blue)', padding: '3px' }}>
                                        <img src={kid.image} style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'white', objectFit: 'cover' }} />
                                    </div>
                                    <span style={{ fontSize: '0.8rem', fontWeight: '800' }}>{kid.name.split(' ')[0]}</span>
                                </div>
                            ))}
                        </div>

                        {/* Newsfeed */}
                        <div style={{ padding: '0 10px' }}>
                            {posts.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--fb-muted)' }}>
                                    No updates yet / کوئی اپ ڈیٹس نہیں
                                </div>
                            )}

                            {posts.map(post => (
                                <div key={post.id} className="card fb-post">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            {post.authorImage ? (
                                                <img src={post.authorImage} className="avatar" style={{ objectFit: 'cover' }} />
                                            ) : (
                                                <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${post.authorName}`} className="avatar" />
                                            )}
                                            <div>
                                                <h4 style={{ fontSize: '0.95rem', fontWeight: '700' }}>{post.authorName || 'Principal Desk'}</h4>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--fb-muted)' }}>
                                                    <span>{post.timestamp ? new Date(post.timestamp.toDate()).toLocaleDateString() : 'Just now'}</span>
                                                    <span>•</span>
                                                    <Users size={12} />
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            {post.role === 'Principal' && <ShieldCheck size={16} color="var(--fb-blue)" />}
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.95rem', marginBottom: '10px', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>{post.text}</p>

                                    {post.mediaUrl && post.mediaType === 'video' ? (
                                        <video
                                            src={post.mediaUrl}
                                            controls
                                            style={{ width: 'calc(100% + 24px)', marginLeft: '-12px', marginBottom: '10px', display: 'block', maxHeight: '400px', background: 'black' }}
                                        />
                                    ) : (post.mediaUrl || post.imageUrl) ? (
                                        <img
                                            src={post.mediaUrl || post.imageUrl}
                                            style={{ width: 'calc(100% + 24px)', marginLeft: '-12px', marginBottom: '10px', display: 'block', maxHeight: '400px', objectFit: 'cover' }}
                                        />
                                    ) : null}

                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '0.8rem', color: 'var(--fb-muted)', borderTop: '1px solid var(--fb-border)', marginTop: '5px' }}>
                                        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                                            <button
                                                onClick={() => handleLike(post)}
                                                style={{
                                                    background: 'transparent', border: 'none', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', gap: '5px',
                                                    color: post.likes?.includes(parentUserId) ? '#ef4444' : 'var(--fb-muted)',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                <ThumbsUp size={18} fill={post.likes?.includes(parentUserId) ? '#ef4444' : 'none'} />
                                                <span>{post.likes?.length || 0}</span>
                                            </button>
                                            <button
                                                onClick={() => handleShare(post)}
                                                style={{
                                                    background: 'transparent', border: 'none', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', gap: '5px',
                                                    color: 'var(--fb-muted)', fontWeight: '600'
                                                }}
                                            >
                                                <Share2 size={18} />
                                                <span>{post.shares || 0}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <footer className="nav-bottom">
                <NavIcon icon={Home} active={activeTab === 'feed'} onClick={() => { setActiveTab('feed'); setSelectedKid(null); }} />
                <NavIcon icon={Users} active={activeTab === 'kids'} onClick={() => setActiveTab('kids')} />
                <NavIcon icon={Award} />
                <div style={{ position: 'relative' }}>
                    <NavIcon icon={Bell} active={activeTab === 'notif'} onClick={() => { setActiveTab('notif'); setSelectedKid(null); }} />
                    {notifications.some(n => !n.read) && <div style={{ position: 'absolute', top: '10px', right: '10px', width: '10px', height: '10px', background: '#dc2626', borderRadius: '50%', border: '2px solid white' }}></div>}
                </div>
                <NavIcon icon={Menu} />
            </footer>
        </div>
    );
};

const NotificationsView = ({ items, t }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '15px' }}>
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

const NavIcon = ({ icon: Icon, active, onClick }) => (
    <div onClick={onClick} style={{ padding: '10px', cursor: 'pointer', borderBottom: active ? '3px solid var(--fb-blue)' : '3px solid transparent' }}>
        <Icon size={26} color={active ? 'var(--fb-blue)' : 'var(--fb-muted)'} />
    </div>
);

const KidDetailView = ({ kid, onBack, t }) => (
    <motion.div initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 300, opacity: 0 }} style={{ padding: '15px', paddingBottom: '100px' }}>
        <button onClick={onBack} style={{ background: '#E4E6EB', border: 'none', padding: '10px 15px', borderRadius: '10px', fontWeight: '700', marginBottom: '20px' }}>← Back</button>

        <div className="card" style={{ padding: '25px', textAlign: 'center', position: 'relative' }}>
            <img src={kid.image} style={{ width: '100px', height: '100px', borderRadius: '50%', border: '4px solid var(--fb-blue)', marginBottom: '15px', background: 'white' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{kid.name}</h2>
            <p style={{ color: 'var(--fb-muted)', fontSize: '0.9rem', marginBottom: '15px' }}>{kid.class}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}>
                <div style={{ background: '#E7F3FF', padding: '15px', borderRadius: '16px' }}>
                    <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: '800', color: '#1877F2' }}>#{kid.rank}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#1877F2' }}>{t.rank}</span>
                </div>
                <div style={{ background: '#E6F4EA', padding: '15px', borderRadius: '16px' }}>
                    <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: '800', color: '#1E8E3E' }}>{kid.attendance}%</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#1E8E3E' }}>{t.attendance}</span>
                </div>
            </div>
        </div>

        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '20px 0 10px' }}>{t.subject_scores}</h3>
        <div className="card" style={{ padding: '20px' }}>
            {Object.entries(kid.scores).map(([sub, score]) => (
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

        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '20px 0 10px' }}>Analytics & Progress</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <MetricCard label={t.behavior} value={kid.behavior} icon={Heart} color="#F43F5E" />
            <MetricCard label={t.health} value={kid.health} icon={TrendingUp} color="#10B981" />
            <MetricCard label={t.hygiene} value={kid.hygiene} icon={UserCheck} color="#6366F1" />
            <MetricCard label={t.homework} value={88} icon={Calendar} color="#F59E0B" />
        </div>
    </motion.div>
);

const MetricCard = ({ label, value, icon: Icon, color }) => (
    <div className="card" style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ padding: '8px', background: `${color}15`, borderRadius: '10px' }}>
                <Icon size={20} color={color} />
            </div>
            <span style={{ fontWeight: '800', color }}>{value}%</span>
        </div>
        <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--fb-muted)' }}>{label}</span>
    </div>
);

export default ParentPortal;
