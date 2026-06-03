'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="sticky top-0 z-50" style={{ background: 'rgba(10, 14, 26, 0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <button onClick={() => router.push('/')} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--gold-500), var(--gold-400))' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="var(--navy-950)" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white hidden sm:block" style={{ fontFamily: 'var(--font-display)' }}>
              Quiz IA
            </span>
          </button>

          {/* Right: Navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => { router.push('/quiz/history'); setShowMenu(false); }}
              className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
            >
              Historial
            </button>
            <button
              onClick={() => { router.push('/exams/history'); setShowMenu(false); }}
              className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
            >
              Exámenes
            </button>
            <button
              onClick={() => { setShowMenu(!showMenu); }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'linear-gradient(135deg, var(--gold-500), var(--gold-400))', color: 'var(--navy-950)' }}>
                Q
              </div>
              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-2xl animate-scale-in z-50" style={{ background: 'var(--navy-800)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="p-2">
                    <button
                      onClick={() => { router.push('/'); setShowMenu(false); }}
                      className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Inicio
                    </button>
                    <button
                      onClick={() => { router.push('/leaderboard'); setShowMenu(false); }}
                      className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Leaderboard
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
