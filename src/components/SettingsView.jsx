import React from 'react';
import { motion } from 'framer-motion';
import { auth } from '../firebase';

const SettingsView = ({ lang, setLang, t }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '20px' }}>
        <h2 style={{ fontWeight: '800', marginBottom: '20px' }}>{t.settings}</h2>
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', background: 'white', borderRadius: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '700' }}>{t.language}</span>
                <select
                    value={lang}
                    onChange={(e) => setLang(e.target.value)}
                    style={{ padding: '8px 15px', borderRadius: '10px', border: '1px solid #ddd', fontWeight: '600' }}
                >
                    <option value="en">English</option>
                    <option value="ur">اردو </option>
                </select>
            </div>
            <button
                onClick={() => auth.signOut()}
                style={{
                    padding: '12px', background: '#FEF2F2', color: '#D93025',
                    borderRadius: '12px', border: 'none', fontWeight: '800', cursor: 'pointer',
                    marginTop: '20px'
                }}
            >
                {t.logout}
            </button>
        </div>
    </motion.div>
);

export default SettingsView;
