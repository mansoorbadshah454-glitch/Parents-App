import React from 'react';
import { motion } from 'framer-motion';

const NavIcon = ({ icon: Icon, active, onClick, badge }) => (
    <div onClick={onClick} style={{
        padding: '10px',
        cursor: 'pointer',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    }}>
        <Icon size={24} color={active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)'} />
        {active && (
            <motion.div
                layoutId="nav-active"
                style={{
                    position: 'absolute',
                    bottom: '0',
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: 'white',
                    boxShadow: '0 0 10px white'
                }}
            />
        )}
        {badge > 0 && (
            <div style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                background: '#dc2626',
                color: 'white',
                fontSize: '0.65rem',
                fontWeight: 'bold',
                minWidth: '18px',
                height: '18px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid white',
                padding: '0 4px'
            }}>
                {badge > 9 ? '9+' : badge}
            </div>
        )}
    </div>
);

export default NavIcon;
