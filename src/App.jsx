import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import ParentPortal from './pages/ParentPortal';
import Login from './pages/Login';

function App() {
  const [user, setUser] = useState(() => {
    try {
      const session = localStorage.getItem('parent_session');
      return session ? JSON.parse(session) : null;
    } catch (e) {
      localStorage.removeItem('parent_session');
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const session = localStorage.getItem('parent_session');
        let sessionData = session ? JSON.parse(session) : null;

        if (sessionData && sessionData.uid === currentUser.uid) {
          setUser({ ...currentUser, ...sessionData });
          setLoading(false);
        } else {
          // Recover profile if session missing or different
          try {
            const userDoc = await getDoc(doc(db, "global_users", currentUser.uid));
            if (userDoc.exists() && userDoc.data().role === 'parent') {
              const userData = userDoc.data();
              const fullUser = { ...currentUser, ...userData };
              setUser(fullUser);
              localStorage.setItem('parent_session', JSON.stringify({
                uid: currentUser.uid,
                schoolId: userData.schoolId,
                role: 'parent',
                email: currentUser.email,
                name: userData.name || 'Parent'
              }));
            } else {
              setUser(currentUser);
            }
          } catch (e) {
            console.error("Profile recovery failed", e);
            setUser(currentUser);
          } finally {
            setLoading(false);
          }
        }
      } else {
        const session = localStorage.getItem('parent_session');
        setUser(session ? JSON.parse(session) : null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F0F2F5', color: '#1877F2' }}>
        <div className="animate-pulse" style={{ width: '40px', height: '40px', border: '4px solid #1877F2', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
        <p style={{ marginTop: '1rem', fontWeight: '600' }}>Loading Parent Portal...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
        <Route path="/" element={user ? <ParentPortal user={user} /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
