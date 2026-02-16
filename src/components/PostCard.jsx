import React from 'react';
import { Users, Heart, Share2, ShieldCheck, ThumbsUp } from 'lucide-react';

const PostCard = ({ post, parentUserId, onLike, onShare, t }) => {
    return (
        <div key={post.id} className="card fb-post" style={{ padding: '15px', marginBottom: '15px', borderRadius: '18px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {post.authorImage ? (
                        <img src={post.authorImage} className="avatar" style={{ objectFit: 'cover', width: '40px', height: '40px', borderRadius: '50%' }} alt="Author" />
                    ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#F0F2F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users size={20} color="#65676b" />
                        </div>
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
                    style={{ width: 'calc(100% + 30px)', marginLeft: '-15px', marginBottom: '10px', display: 'block', maxHeight: '400px', background: 'black' }}
                />
            ) : (post.mediaUrl || post.imageUrl) ? (
                <img
                    src={post.mediaUrl || post.imageUrl}
                    style={{ width: 'calc(100% + 30px)', marginLeft: '-15px', marginBottom: '10px', display: 'block', maxHeight: '400px', objectFit: 'cover' }}
                    alt="Post content"
                />
            ) : null}

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '0.8rem', color: 'var(--fb-muted)', borderTop: '1px solid var(--fb-border)', marginTop: '5px' }}>
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                    <button
                        onClick={() => onLike(post)}
                        style={{
                            background: 'transparent', border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '5px',
                            color: post.likes?.includes(parentUserId) ? '#1877F2' : 'var(--fb-muted)',
                            fontWeight: '600'
                        }}
                    >
                        <ThumbsUp size={18} fill={post.likes?.includes(parentUserId) ? '#1877F2' : 'none'} />
                        <span>{post.likes?.length || 0}</span>
                    </button>
                    <button
                        onClick={() => onShare(post)}
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
    );
};

export default PostCard;
