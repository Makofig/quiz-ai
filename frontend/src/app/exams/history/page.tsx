'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface ExamHistoryItem {
  id: string;
  title: string;
  exam_type: string;
  topic: string | null;
  difficulty: string | null;
  total_questions: number;
  duration_minutes: number;
  status: string;
  percentage: number | null;
  passed: boolean | null;
  created_at: string;
}

interface ExamHistoryData {
  summary: {
    total_exams: number;
    total_completed: number;
    average_percentage: number;
    best_score: number;
    worst_score: number;
    passed: number;
    failed: number;
  };
  exams: ExamHistoryItem[];
}

export default function ExamHistoryPage() {
  const router = useRouter();
  const [data, setData] = useState<ExamHistoryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${API_URL}/exams/history`);
        if (!response.ok) throw new Error('Error al cargar historial');
        const result = await response.json();
        setData(result);
      } catch {
        // Empty state is fine
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getTypeLabel = (t: string) => {
    switch (t) {
      case 'theoretical': return 'Teórico';
      case 'practical': return 'Práctico';
      case 'complete': return 'Completo';
      default: return t;
    }
  };

  const getTypeColor = (t: string) => {
    switch (t) {
      case 'theoretical': return { bg: 'rgba(59, 130, 246, 0.1)', text: 'text-blue-400', border: 'rgba(59, 130, 246, 0.2)' };
      case 'practical': return { bg: 'rgba(16, 185, 129, 0.1)', text: 'text-emerald-400', border: 'rgba(16, 185, 129, 0.2)' };
      case 'complete': return { bg: 'rgba(212, 168, 67, 0.1)', text: 'text-amber-400', border: 'rgba(212, 168, 67, 0.2)' };
      default: return { bg: 'rgba(100, 116, 139, 0.1)', text: 'text-slate-400', border: 'rgba(100, 116, 139, 0.2)' };
    }
  };

  const getScoreColor = (pct: number) => {
    if (pct >= 70) return 'text-emerald-400';
    if (pct >= 50) return 'text-amber-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen relative z-10">
        <Header showBack onBack={() => router.push('/')} title="Exámenes" />
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-slate-700" style={{ borderTopColor: 'var(--gold-500)', animation: 'spin 1s linear infinite' }}></div>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </div>
    );
  }

  const exams = data?.exams || [];
  const summary = data?.summary;

  return (
    <div className="min-h-screen relative z-10">
      <Header showBack onBack={() => router.push('/')} title="Exámenes" />
      <div className="max-w-6xl mx-auto p-6 md:p-8">
        {/* Title */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              Historial de <span className="text-gradient-gold">Exámenes</span>
            </h1>
            <p className="text-slate-400">Tus exámenes cronometrados y resultados</p>
          </div>
          <button onClick={() => router.push('/exams/create')} className="btn-primary px-6 py-3">
            + Nuevo Examen
          </button>
        </div>

        {/* Summary Cards */}
        {summary && summary.total_exams > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 stagger-children">
            <div className="card p-5 text-center animate-slide-up" style={{ animationDelay: '0.05s' }}>
              <div className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                {summary.total_completed}
              </div>
              <div className="text-xs text-slate-400">Completados</div>
            </div>
            <div className="card p-5 text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className={`text-3xl font-bold mb-1 ${getScoreColor(summary.average_percentage)}`} style={{ fontFamily: 'var(--font-display)' }}>
                {summary.average_percentage}%
              </div>
              <div className="text-xs text-slate-400">Promedio</div>
            </div>
            <div className="card p-5 text-center animate-slide-up" style={{ animationDelay: '0.15s' }}>
              <div className="text-3xl font-bold text-emerald-400 mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                {summary.passed}
              </div>
              <div className="text-xs text-slate-400">Aprobados</div>
            </div>
            <div className="card p-5 text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="text-3xl font-bold text-red-400 mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                {summary.failed}
              </div>
              <div className="text-xs text-slate-400">No aprobados</div>
            </div>
          </div>
        )}

        {/* Exam List */}
        {exams.length > 0 ? (
          <div className="space-y-3 stagger-children">
            {exams.map((exam, i) => {
              const tc = getTypeColor(exam.exam_type);
              return (
                <div
                  key={exam.id}
                  className="card p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer animate-slide-up"
                  style={{ animationDelay: `${0.05 * i}s` }}
                  onClick={() => {
                    if (exam.percentage !== null) {
                      router.push(`/exams/results/${exam.id}`);
                    } else {
                      router.push(`/exams/${exam.id}`);
                    }
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg" style={{
                      background: tc.bg,
                      border: `1px solid ${tc.border}`,
                    }}>
                      {exam.exam_type === 'theoretical' ? '📖' : exam.exam_type === 'practical' ? '💻' : '🎯'}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold" style={{ fontFamily: 'var(--font-display)' }}>{exam.topic || exam.title}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${tc.text}`} style={{ background: tc.bg, border: `1px solid ${tc.border}` }}>
                          {getTypeLabel(exam.exam_type)}
                        </span>
                        <span className="text-xs text-slate-500">{exam.total_questions} preguntas · {exam.duration_minutes} min</span>
                        <span className="text-xs text-slate-500">{formatDate(exam.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {exam.percentage !== null ? (
                      <>
                        <span className={`text-2xl font-bold ${getScoreColor(exam.percentage)}`} style={{ fontFamily: 'var(--font-display)' }}>
                          {exam.percentage}%
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                          exam.passed ? 'text-emerald-400' : 'text-red-400'
                        }`} style={{
                          background: exam.passed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          border: `1px solid ${exam.passed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                        }}>
                          {exam.passed ? 'APROBADO' : 'REPROBADO'}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs px-3 py-1.5 rounded-full text-slate-400" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        Pendiente
                      </span>
                    )}
                    <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card p-10 text-center animate-fade-in">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg text-white font-semibold mb-2" style={{ fontFamily: 'var(--font-display)' }}>Sin exámenes</h3>
            <p className="text-slate-400 mb-6">Crea tu primer examen cronometrado</p>
            <button onClick={() => router.push('/exams/create')} className="btn-primary px-6 py-3">
              Crear Examen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
