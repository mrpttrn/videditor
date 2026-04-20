import { useNavigate } from 'react-router-dom';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-[var(--bg-base)] overflow-hidden relative">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 60%, rgba(99,102,241,0.12) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6 text-center px-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">VidEditor</h1>
        </div>

        <p className="text-base text-[var(--text-secondary)] max-w-sm">
          A free, browser-based video editor. No upload, no account — everything stays on your device.
        </p>

        <div className="flex flex-col gap-2 items-center w-full max-w-xs">
          <button
            className="w-full py-3 px-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-indigo-600/20"
            onClick={() => navigate('/editor')}
          >
            Open Editor
          </button>
          <p className="text-[11px] text-[var(--text-muted)]">
            Supports video, image, and audio files
          </p>
        </div>

        <div className="flex gap-6 mt-4">
          {[
            { icon: '🎬', label: 'Multi-track' },
            { icon: '✂️', label: 'Trim & cut' },
            { icon: '🎵', label: 'Audio' },
            { icon: '⬇️', label: 'Export .webm' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span className="text-xl">{icon}</span>
              <span className="text-[10px] text-[var(--text-muted)]">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
