'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface QuizResultItem {
  id: string;
  topic: string;
  difficulty: string;
  quiz_type: string | null;
  total_questions: number;
  correct: number;
  wrong: number;
  percentage: number;
  time_spent: number | null;
  created_at: string;
}

interface QuizResultSummary {
  total_quizzes: number;
  total_questions: number;
  total_correct: number;
  total_wrong: number;
  average_percentage: number;
  best_score: number;
  worst_score: number;
}

interface QuizResultsResponse {
  summary: QuizResultSummary;
  results: QuizResultItem[];
}

export default function HistoryPage() {
  const router = useRouter();
  const [data, setData] = useState<QuizResultsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`${API_URL}/results/history`);
        if (!response.ok) throw new Error('Error al cargar historial');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError('No se pudo cargar el historial de quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const getLevel = (totalCorrect: number) => Math.floor(totalCorrect / 50) + 1;

  const getDifficultyColor = (d: string) => {
    switch (d) {
      case 'easy': return { bg: 'rgba(16, 185, 129, 0.1)', text: 'text-emerald-400', border: 'rgba(16, 185, 129, 0.2)' };
      case 'medium': return { bg: 'rgba(212, 168, 67, 0.1)', text: 'text-amber-400', border: 'rgba(212, 168, 67, 0.2)' };
      case 'hard': return { bg: 'rgba(239, 68, 68, 0.1)', text: 'text-red-400', border: 'rgba(239, 68, 68, 0.2)' };
      default: return { bg: 'rgba(100, 116, 139, 0.1)', text: 'text-slate-400', border: 'rgba(100, 116, 139, 0.2)' };
    }
  };

  const getScoreColor = (pct: number) => {
    if (pct >= 80) return 'text-emerald-400';
    if (pct >= 50) return 'text-amber-400';
    return 'text-red-400';
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen relative z-10">
        <Header showBack onBack={() => router.push('/')} title="Historial" />
        <div className="flex items-center justify-center py-20">
          <div className="text-center animate-fade-in">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-slate-700" style={{ borderTopColor: 'var(--gold-500)', animation: 'spin 1s linear infinite' }}></div>
            <p className="text-slate-400">Cargando historial...</p>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen relative z-10">
        <Header showBack onBack={() => router.push('/')} title="Historial" />
        <div className="flex items-center justify-center py-20">
          <div className="text-center animate-fade-in">
            <div className="text-4xl mb-4">📊</div>
            <h2 className="text-xl text-white font-semibold mb-2" style={{ fontFamily: 'var(--font-display)' }}>Sin resultados</h2>
            <p className="text-slate-400 mb-6">Aún no has completado ningún quiz</p>
            <button onClick={() => router.push('/')} className="btn-primary px-6 py-3">
              Generar Primer Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { summary, results } = data;
  const level = getLevel(summary.total_correct);

  return (
    <div className="min-h-screen relative z-10">
      <Header showBack onBack={() => router.push('/')} title="Historial" />
      <div className="max-w-6xl mx-auto p-6 md:p-8">
        {/* Page Title */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Historial de <span className="text-gradient-gold">Quizzes</span>
          </h1>
          <p className="text-slate-400">Tu progreso y estadísticas acumuladas</p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 stagger-children">
          {/* Total Quizzes */}
          <div className="card p-5 text-center animate-slide-up" style={{ animationDelay: '0.05s' }}>
            <div className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-display)' }}>
              {summary.total_quizzes}
            </div>
            <div className="text-xs text-slate-400">Quizzes Completados</div>
          </div>

          {/* Average */}
          <div className="card p-5 text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className={`text-3xl font-bold mb-1 ${getScoreColor(summary.average_percentage)}`} style={{ fontFamily: 'var(--font-display)' }}>
              {summary.average_percentage}%
            </div>
            <div className="text-xs text-slate-400">Promedio General</div>
          </div>

          {/* Questions Answered */}
          <div className="card p-5 text-center animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <div className="text-3xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--gold-400)' }}>
              {summary.total_questions}
            </div>
            <div className="text-xs text-slate-400">Preguntas Respondidas</div>
          </div>

          {/* Level */}
          <div className="card p-5 text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="text-3xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--emerald-400)' }}>
              Nv. {level}
            </div>
            <div className="text-xs text-slate-400">Nivel Actual</div>
          </div>
        </div>

        {/* Best/Worst Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="card p-4 flex items-center gap-3 animate-slide-up" style={{ animationDelay: '0.25s' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </div>
            <div>
              <div className="text-lg font-bold text-emerald-400" style={{ fontFamily: 'var(--font-display)' }}>{summary.best_score}%</div>
              <div className="text-xs text-slate-500">Mejor resultado</div>
            </div>
          </div>

          <div className="card p-4 flex items-center gap-3 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
            <div>
              <div className="text-lg font-bold text-red-400" style={{ fontFamily: 'var(--font-display)' }}>{summary.worst_score}%</div>
              <div className="text-xs text-slate-500">Peor resultado</div>
            </div>
          </div>

          <div className="card p-4 flex items-center gap-3 animate-slide-up" style={{ animationDelay: '0.35s' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(212, 168, 67, 0.1)', border: '1px solid rgba(212, 168, 67, 0.2)' }}>
              <svg className="w-5 h-5" style={{ color: 'var(--gold-400)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--gold-400)' }}>
                {summary.total_correct}/{summary.total_questions}
              </div>
              <div className="text-xs text-slate-500">Correctas / Total</div>
            </div>
          </div>
        </div>

        {/* History Table */}
        {results.length > 0 ? (
          <div className="card overflow-hidden animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <h2 className="text-lg font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                Historial Detallado
              </h2>
              <p className="text-xs text-slate-500 mt-1">{results.length} quiz{results.length !== 1 ? 'zes' : ''} registrado{results.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Fecha</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Tema</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Dificultad</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Correctas</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Incorrectas</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Resultado</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                  {results.map((r) => {
                    const dc = getDifficultyColor(r.difficulty);
                    return (
                      <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap">{formatDate(r.created_at)}</td>
                        <td className="px-5 py-3.5 text-white font-medium max-w-[200px] truncate">{r.topic}</td>
                        <td className="px-5 py-3.5">
                          <span
                            className="inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize"
                            style={{ background: dc.bg, color: dc.text, border: `1px solid ${dc.border}` }}
                          >
                            {r.difficulty}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="text-emerald-400 font-semibold">{r.correct}</span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="text-red-400 font-semibold">{r.wrong}</span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className={`font-bold ${getScoreColor(r.percentage)}`}>
                            {r.percentage}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="card p-10 text-center animate-fade-in">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg text-white font-semibold mb-2" style={{ fontFamily: 'var(--font-display)' }}>Sin registros</h3>
            <p className="text-slate-400 mb-6">Completa tu primer quiz para ver tu historial aquí</p>
            <button onClick={() => router.push('/')} className="btn-primary px-6 py-3">
              Generar Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
