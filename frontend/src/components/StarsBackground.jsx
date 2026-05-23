import React from 'react';

const StarsBackground = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#0a0e1a]">
      {/* Twilight atmosphere radial gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(124,58,237,0.18)_0%,transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(59,130,246,0.1)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,rgba(236,72,153,0.05)_0%,transparent_50%)]" />

      {/* Twinkling stars effect */}
      <div 
        className="absolute inset-0 opacity-70 animate-pulse duration-[8000ms] ease-in-out infinite"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.7) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 30% 60%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 60% 10%, rgba(255,255,255,0.6) 0%, transparent 100%),
            radial-gradient(1.2px 1.2px at 80% 80%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 50% 40%, rgba(255,255,255,0.7) 0%, transparent 100%),
            radial-gradient(2px 2px at 15% 85%, rgba(167,139,250,0.6) 0%, transparent 100%),
            radial-gradient(2px 2px at 70% 30%, rgba(99,179,237,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 90% 50%, rgba(255,255,255,0.5) 0%, transparent 100%)
          `,
          backgroundSize: '100% 100%',
        }}
      />
    </div>
  );
};

export default StarsBackground;
