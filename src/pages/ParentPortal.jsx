import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
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
    Plus,
    Wallet,
    MessageSquare
} from 'lucide-react';
import { translations } from '../translations';
import { db, storage, auth } from '../firebase';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, arrayUnion, arrayRemove, increment, getDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';

// New Modular Components
import NavIcon from '../components/NavIcon';
import NotificationsView from '../components/NotificationsView';
import KidDetailView from '../components/KidDetailView';
import FeeView from '../components/FeeView';
import MessagesView from '../components/MessagesView';
import SettingsView from '../components/SettingsView';
import PostCard from '../components/PostCard';
import AttendanceHistoryView from '../components/AttendanceHistoryView';
import ReportCardView from '../components/ReportCardView';

const ParentPortal = ({ user }) => {
    const [lang, setLang] = useState('en');
    const [activeTab, setActiveTab] = useState('feed'); // 'feed', 'kids', 'notif', 'fees', 'messages', 'menu'
    const [selectedKid, setSelectedKid] = useState(null);
    const [showSettings, setShowSettings] = useState(false);
    const [schoolInfo, setSchoolInfo] = useState({ name: 'School Portal', logo: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' });
    const [posts, setPosts] = useState([]);
    const [currentAction, setCurrentAction] = useState(null);

    const [showAttendance, setShowAttendance] = useState(false);
    const [showReportCard, setShowReportCard] = useState(false);

    const t = translations[lang];
    const isRTL = lang === 'ur';
    const { scrollY } = useScroll();
    const [hidden, setHidden] = useState(false);

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious();
        if (latest > previous && latest > 150) {
            setHidden(true);
        } else {
            setHidden(false);
        }
    });

    // State for real-time notifications
    const [notifications, setNotifications] = useState([]);

    // Authenticated data from props
    const schoolId = user?.schoolId;
    const parentUserId = user?.uid;

    // Kids Data (Fetched dynamically from Firestore)
    const [kids, setKids] = useState([]);

    // Real-time Kids Listener
    useEffect(() => {
        if (!schoolId || !parentUserId) return;

        let unsubscribes = [];

        // 1. Listen to parent document for linked student IDs
        const parentDocRef = doc(db, `schools/${schoolId}/parents`, parentUserId);
        const unsubscribeParent = onSnapshot(parentDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const linkedStudents = data.linkedStudents || data.children || [];

                // Clear existing student unsubscribes before setting up new ones
                unsubscribes.forEach(unsub => unsub());
                unsubscribes = [];

                const kidsMap = {};

                linkedStudents.forEach((link) => {
                    const studentId = typeof link === 'string' ? link : link.studentId;
                    if (!studentId) return;

                    const studentDocRef = doc(db, `schools/${schoolId}/students`, studentId);
                    // Also check class subcollection for more data (like attendance/fees if stored there)
                    // In this version, basic info is in schools/ID/students/ID
                    const unsubStudent = onSnapshot(studentDocRef, (sSnap) => {
                        if (sSnap.exists()) {
                            const sData = sSnap.data();

                            // Map academic scores array to object format for UI
                            const scoresObj = {};
                            (sData.academicScores || []).forEach(item => {
                                scoresObj[item.subject] = parseInt(item.score) || 0;
                            });

                            // Map homework scores to an average score for the MetricCard
                            const hwScores = (sData.homeworkScores || []).map(s => parseInt(s.score) || 0);
                            const hwAvg = hwScores.length ? Math.round(hwScores.reduce((a, b) => a + b, 0) / hwScores.length) : 0;

                            kidsMap[studentId] = {
                                id: studentId,
                                name: sData.name || [sData.firstName, sData.lastName].filter(Boolean).join(' ') || 'Student',
                                class: sData.className || sData.class || 'N/A',
                                image: sData.profilePic || sData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${studentId}`,
                                rank: sData.rank || 0,
                                attendance: sData.attendance?.percentage || sData.attendance || 0,
                                health: sData.wellness?.health || 80,
                                behavior: sData.wellness?.behavior || 80,
                                hygiene: sData.wellness?.hygiene || 80,
                                homework: hwAvg || sData.homework || 0,
                                scores: Object.keys(scoresObj).length ? scoresObj : (sData.scores || {}),
                                monthlyFeeStatus: sData.monthlyFeeStatus || 'unpaid',
                                customPayments: sData.customPayments || {}
                            };

                            setKids(Object.values(kidsMap));
                        }
                    });
                    unsubscribes.push(unsubStudent);
                });
            }
        });

        return () => {
            unsubscribeParent();
            unsubscribes.forEach(unsub => unsub());
        };
    }, [schoolId, parentUserId]);

    // Listen for current action
    useEffect(() => {
        if (!schoolId) return;
        const actionRef = doc(db, 'schools', schoolId, 'classes', 'action_metadata');
        const unsub = onSnapshot(actionRef, (docSnap) => {
            if (docSnap.exists()) {
                setCurrentAction(docSnap.data());
            } else {
                setCurrentAction(null);
            }
        });
        return () => unsub();
    }, [schoolId]);

    const [messagesCount, setMessagesCount] = useState(0);

    // Listen for unread messages
    useEffect(() => {
        if (!schoolId || !parentUserId) return;
        const q = query(
            collection(db, `schools/${schoolId}/messages`),
            where("parentId", "==", parentUserId),
            where("read", "==", false)
        );
        const unsub = onSnapshot(q, (snap) => {
            setMessagesCount(snap.size);
        });
        return () => unsub();
    }, [schoolId, parentUserId]);

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
        <div className={`app-container ${isRTL ? 'rtl urdu-text' : ''}`} style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: '#F0F2F5', overflow: 'hidden' }}>
            {/* Professional Header */}
            <header style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '1rem 1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                borderRadius: '0 0 20px 20px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '12px',
                        background: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                        padding: '8px'
                    }}>
                        <img src={schoolInfo.logo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Logo" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'white', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                            {schoolInfo.name}
                        </h1>
                        <p style={{ fontSize: '0.75rem', fontWeight: '400', color: 'white', margin: 0, fontFamily: 'Montserrat, sans-serif' }}>TRACK YOUR KID'S EDUCATION</p>
                    </div>
                </div>
                <div onClick={() => setActiveTab('menu')} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(10px)' }}>
                    <Settings size={20} color="white" />
                </div>
            </header>

            <div style={{ flex: 1, overflowY: 'auto', marginTop: '-20px', paddingTop: '20px', borderRadius: '20px 20px 0 0', background: '#F0F2F5' }}>
                <AnimatePresence mode="wait">
                    {selectedKid ? (
                        showAttendance ? (
                            <AttendanceHistoryView
                                key="attendance"
                                kid={selectedKid}
                                schoolId={schoolId}
                                onBack={() => setShowAttendance(false)}
                                t={t}
                            />
                        ) : showReportCard ? (
                            <ReportCardView
                                key="report"
                                kid={selectedKid}
                                schoolInfo={schoolInfo}
                                onBack={() => setShowReportCard(false)}
                                t={t}
                                isRTL={isRTL}
                            />
                        ) : (
                            <KidDetailView
                                key="detail"
                                kid={selectedKid}
                                onBack={() => setSelectedKid(null)}
                                onShowAttendance={() => setShowAttendance(true)}
                                onShowReportCard={() => setShowReportCard(true)}
                                t={t}
                                isRTL={isRTL}
                            />
                        )
                    ) : activeTab === 'notif' ? (
                        <NotificationsView key="notif" items={notifications} t={t} />
                    ) : activeTab === 'fees' ? (
                        <FeeView key="fees" kids={kids} currentAction={currentAction} t={t} />
                    ) : activeTab === 'messages' ? (
                        <MessagesView key="messages" user={user} t={t} />
                    ) : activeTab === 'menu' ? (
                        <SettingsView key="menu" lang={lang} setLang={setLang} handleLogout={handleLogout} t={t} isRTL={isRTL} />
                    ) : (
                        <motion.div key="feed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {/* Kids Circular Slider */}
                            <div style={{
                                padding: '32px 15px',
                                display: 'flex',
                                gap: '20px',
                                overflowX: 'auto',
                                background: 'linear-gradient(135deg, #9333ea 0%, #6b21a8 100%)',
                                marginBottom: '15px',
                                marginTop: '-20px',
                                scrollbarWidth: 'none',
                                position: 'relative',
                                overflow: 'hidden',
                                borderRadius: '0 0 32px 32px',
                                boxShadow: 'inset 0 -10px 20px rgba(0,0,0,0.15), 0 10px 20px rgba(107, 33, 168, 0.2)'
                            }}>
                                {/* Dynamic Sparks for Slider Background */}
                                {[...Array(10)].map((_, i) => (
                                    <motion.div
                                        key={`spark-${i}`}
                                        animate={{
                                            scale: [0, 1, 0],
                                            opacity: [0, 0.5, 0],
                                            y: [0, -30, -60],
                                            x: [0, (i % 2 === 0 ? 15 : -15), (i % 2 === 0 ? 30 : -30)]
                                        }}
                                        transition={{
                                            duration: 3 + Math.random() * 2,
                                            repeat: Infinity,
                                            delay: Math.random() * 5,
                                            ease: "easeInOut"
                                        }}
                                        style={{
                                            position: 'absolute',
                                            top: `${Math.random() * 100}%`,
                                            left: `${Math.random() * 100}%`,
                                            width: '3px',
                                            height: '3px',
                                            background: '#fef9c3',
                                            borderRadius: '50%',
                                            boxShadow: '0 0 8px #fef9c3',
                                            pointerEvents: 'none',
                                            zIndex: 0
                                        }}
                                    />
                                ))}
                                {kids.map(kid => (
                                    <motion.div
                                        key={kid.id}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setSelectedKid(kid)}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '8px',
                                            minWidth: '80px',
                                            cursor: 'pointer',
                                            zIndex: 1
                                        }}
                                    >
                                        <div style={{
                                            width: '75px',
                                            height: '75px',
                                            borderRadius: '50%',
                                            padding: '2px',
                                            background: 'linear-gradient(45deg, #FFD700, #8A2BE2)',
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}>
                                            {/* Moving Shine Sweep for each icon */}
                                            <motion.div
                                                animate={{
                                                    left: ['-100%', '200%'],
                                                }}
                                                transition={{
                                                    duration: 3,
                                                    repeat: Infinity,
                                                    ease: "easeInOut",
                                                    repeatDelay: 1
                                                }}
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    width: '30%',
                                                    height: '100%',
                                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                                                    transform: 'skewX(-25deg)',
                                                    pointerEvents: 'none',
                                                    zIndex: 2
                                                }}
                                            />
                                            <div style={{
                                                width: '100%',
                                                height: '100%',
                                                borderRadius: '50%',
                                                background: 'white',
                                                padding: '2px',
                                                position: 'relative',
                                                zIndex: 1
                                            }}>
                                                <img src={kid.image} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} alt={kid.name} />
                                            </div>
                                        </div>
                                        <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'white', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>{kid.name.split(' ')[0]}</span>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Main Feed Content */}
                            <div style={{ padding: '0 15px 100px' }}>
                                {posts.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '60px', opacity: 0.5 }}>
                                        <Home size={48} style={{ marginBottom: '15px' }} />
                                        <p>No announcements yet.</p>
                                    </div>
                                ) : (
                                    posts.map(post => (
                                        <PostCard
                                            key={post.id}
                                            post={post}
                                            parentUserId={parentUserId}
                                            onLike={handleLike}
                                            onShare={handleShare}
                                            t={t}
                                        />
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Floating Navigation */}
            <motion.footer
                variants={{
                    visible: { y: 0, opacity: 1, scale: 1, x: '-50%' },
                    hidden: { y: 100, opacity: 0, scale: 0.9, x: '-50%' }
                }}
                initial="visible"
                animate={hidden ? "hidden" : "visible"}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                style={{
                    background: 'rgba(107, 33, 168, 0.9)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    height: '65px',
                    borderRadius: '24px',
                    padding: '0 10px',
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    boxShadow: '0 15px 35px rgba(107, 33, 168, 0.4)',
                    position: 'fixed',
                    bottom: '15px',
                    left: '50%',
                    width: 'calc(100% - 30px)',
                    maxWidth: '500px',
                    zIndex: 1001,
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
            >
                <NavIcon icon={Home} active={activeTab === 'feed'} onClick={() => { setActiveTab('feed'); setSelectedKid(null); }} />
                <NavIcon icon={Wallet} active={activeTab === 'fees'} onClick={() => { setActiveTab('fees'); setSelectedKid(null); }} />
                <NavIcon icon={MessageSquare} active={activeTab === 'messages'} onClick={() => { setActiveTab('messages'); setSelectedKid(null); }} badge={messagesCount} />
                <NavIcon icon={Bell} active={activeTab === 'notif'} onClick={() => { setActiveTab('notif'); setSelectedKid(null); }} badge={notifications.filter(n => !n.read).length} />
                <NavIcon icon={Menu} active={activeTab === 'menu'} onClick={() => { setActiveTab('menu'); setSelectedKid(null); }} />
            </motion.footer>
        </div>
    );
};

export default ParentPortal;
