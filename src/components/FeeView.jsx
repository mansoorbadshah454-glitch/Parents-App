import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, CheckCircle, Ban, Clock, ShieldCheck } from 'lucide-react';

const FeeView = ({ kids, currentAction, t }) => {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '15px', paddingBottom: '100px' }}>
            <h2 style={{ fontWeight: '800', marginBottom: '20px' }}>Fee Management / فیس مینجمنٹ</h2>

            {kids.map(kid => (
                <div key={kid.id} className="card" style={{ padding: '20px', marginBottom: '20px', background: 'white', borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' }}>
                        <img src={kid.image} style={{ width: '50px', height: '50px', borderRadius: '50%', border: '2px solid var(--fb-blue)' }} alt={kid.name} />
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>{kid.name}</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--fb-muted)' }}>{kid.class}</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {/* Monthly Fee */}
                        <div style={{
                            background: kid.monthlyFeeStatus === 'paid' ? '#E6F4EA' : '#FEF2F2',
                            padding: '15px',
                            borderRadius: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: kid.monthlyFeeStatus === 'paid' ? '#1E8E3E' : '#D93025' }}>MONTHLY FEE</span>
                                {kid.monthlyFeeStatus === 'paid' ? <CheckCircle size={16} color="#1E8E3E" /> : <Ban size={16} color="#D93025" />}
                            </div>
                            <span style={{ fontSize: '1.2rem', fontWeight: '800', color: kid.monthlyFeeStatus === 'paid' ? '#1E8E3E' : '#D93025' }}>
                                {kid.monthlyFeeStatus === 'paid' ? 'Paid / ادا شدہ' : 'Unpaid / غیر ادا شدہ'}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--fb-muted)' }}>
                                <Clock size={12} />
                                <span>Current Month</span>
                            </div>
                        </div>

                        {/* Custom Action Fee (Only if kid is targeted) */}
                        {currentAction && (kid.customPayments?.[currentAction.name]) && (
                            <div style={{
                                background: kid.customPayments[currentAction.name].status === 'paid' ? '#E7F3FF' : '#FFF7ED',
                                padding: '15px',
                                borderRadius: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: kid.customPayments[currentAction.name].status === 'paid' ? '#1877F2' : '#EA580C' }}>{currentAction.name.toUpperCase()}</span>
                                    {kid.customPayments[currentAction.name].status === 'paid' ? <ShieldCheck size={16} color="#1877F2" /> : <Clock size={16} color="#EA580C" />}
                                </div>
                                <span style={{ fontSize: '1.2rem', fontWeight: '800', color: kid.customPayments[currentAction.name].status === 'paid' ? '#1877F2' : '#EA580C' }}>
                                    {kid.customPayments[currentAction.name].status === 'paid' ? 'Paid' : 'Pending'}
                                </span>
                                <div style={{ fontSize: '0.7rem', color: 'var(--fb-muted)' }}>
                                    Special Collection
                                </div>
                            </div>
                        )}

                        {!currentAction && (
                            <div style={{
                                background: '#F8F9FA',
                                padding: '15px',
                                borderRadius: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                border: '1px dashed #DEE2E6',
                                opacity: 0.6
                            }}>
                                <Wallet size={20} color="#ADB5BD" />
                                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6C757D', marginTop: '5px' }}>No Active Actions</span>
                            </div>
                        )}
                    </div>
                </div>
            ))}

            <div className="card" style={{ padding: '20px', background: 'linear-gradient(135deg, #1877F2 0%, #0056b3 100%)', color: 'white', borderRadius: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ padding: '10px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px' }}>
                        <Wallet size={24} />
                    </div>
                    <div>
                        <h4 style={{ fontWeight: '800' }}>Payment Policy / ادائیگی کی پالیسی</h4>
                        <p style={{ fontSize: '0.85rem', opacity: 0.9 }}>Monthly fees must be cleared by the 10th of every month. Please visit the school office for payments.</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default FeeView;
