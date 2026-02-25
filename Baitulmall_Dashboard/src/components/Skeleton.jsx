import React from 'react';

const Skeleton = ({ width = '100%', height = '1rem', borderRadius = '0.5rem', className = '' }) => {
    return (
        <div
            className={`skeleton-shimmer ${className}`}
            style={{
                width,
                height,
                borderRadius,
                background: 'var(--skeleton-bg, rgba(0,0,0,0.05))',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .skeleton-shimmer::after {
                    content: "";
                    position: absolute;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    left: 0;
                    background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(255, 255, 255, 0.08),
                        transparent
                    );
                    animation: shimmer 1.5s infinite;
                }
                [data-theme*='dark'] .skeleton-shimmer {
                    background: rgba(255,255,255,0.05);
                }
            `}</style>
        </div>
    );
};

export default Skeleton;
