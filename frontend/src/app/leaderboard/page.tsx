'use client';

import { useRouter } from 'next/navigation';
import { useLeaderboardStore } from '@/store/leaderboard';
import Header from '@/components/Header';

export default function Leaderboard() {
  const router = useRouter();
  const { entries, loadLeaderboard } = useLeaderboardStore();
  
  // For open-source version, leaderboard is purely mock/local data
  // No auth or user_id dependency needed
  
  return (
    <div className="min-h-screen relative z-10">
      <Header showBack onBack={() => router.push('/')} title="Leaderboard" />
      <div className="max-w-4xl mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 badge badge-gold mb-4">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Ranking Global
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Ranking de Usuarios
          </h1>
          <p className="text-slate-400">Sube en el ranking compitiendo con otros usuarios</p>
        </div>

        {/* Leaderboard */}
        <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="space-y-3">
            {entries.map((entry, index) => (
              <div 
                key={entry.userId} 
                className="flex items-center p-4 rounded-xl transition-all"
                style={{
                  background: entry.isCurrent ? 'rgba(212, 168, 67, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${entry.isCurrent ? 'rgba(212, 168, 67, 0.2)' : 'rgba(255, 255, 255, 0.04)'}`,
                  animationDelay: `${index * 0.05}s`,
                }}
              >
                {/* Rank */}
                <div className="w-10 h-10 flex items-center justify-center rounded-lg mr-4 font-bold text-sm" style={{
                  background: entry.rank === 1 ? 'linear-gradient(135deg, #d4a843, #e0be6a)' :
                    entry.rank === 2 ? 'linear-gradient(135deg, #94a3b8, #cbd5e1)' :
                    entry.rank === 3 ? 'linear-gradient(135deg, #b45309, #d97706)' :
                    'var(--navy-700)',
                  color: entry.rank <= 3 ? 'var(--navy-950)' : 'var(--slate-400)',
                  fontFamily: 'var(--font-display)',
                }}>
                  {entry.rank}
                </div>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full overflow-hidden mr-4 flex-shrink-0" style={{ border: '2px solid var(--slate-700)' }}>
                  <img 
                    src={entry.avatar} 
                    alt={entry.username} 
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold truncate" style={{
                    color: entry.isCurrent ? 'var(--gold-400)' : 'white',
                    fontFamily: 'var(--font-display)',
                  }}>
                    {entry.username}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Nivel {entry.level}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-5">
                  <div className="text-right">
                    <div className="text-sm font-bold" style={{ color: 'var(--gold-400)', fontFamily: 'var(--font-display)' }}>
                      {entry.xp}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">XP</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-400" style={{ fontFamily: 'var(--font-display)' }}>
                      {entry.streak}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Días</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Personal Position */}
        {entries.find(e => e.isCurrent) && (
          <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="inline-block card p-6">
              <div className="text-xs text-slate-500 mb-2 uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>Tu posición</div>
              <div className="text-4xl font-bold" style={{ color: 'var(--gold-400)', fontFamily: 'var(--font-display)' }}>
                {entries.findIndex(e => e.isCurrent) + 1}º
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <button
            onClick={() => loadLeaderboard()}
            className="btn-secondary px-8 py-3"
          >
            Recargar Ranking
          </button>
          <button
            onClick={() => router.push('/')}
            className="btn-primary px-8 py-3"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  );
}
