'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface ExamResult {
  attempt_id: string;
  exam_title: string;
  exam_type: string;
  topic: string | null;
  score: number;
  correct: number;
  wrong: number;
  total_questions: number;
  percentage: number;
  passed: boolean;
  time_spent_seconds: number;
  started_at: string | null;
  submitted_at: string | null;
  correct_answers: Array<{ question: string; selected_answer: any; correct_answer: any; explanation: string }>;
  wrong_answers: Array<{ question: string; user_answer: any; correct_answer: any; explanation: string }>;
}

export default function ExamResultPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [result, setResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // First try sessionStorage (just submitted)
    const stored = sessionStorage.getItem(`exam_result_${id}`);
    if (stored) {
      try {
        setResult(JSON.parse(stored));
        setLoading(false);
        return;
      } catch {}
    }

    // Fallback to API
    const fetchResult = async () => {
      try {
        const response = await fetch(`${API_URL}/exams/${id}/result`);
        if (!response.ok) throw new Error('No hay resultado disponible');
        const data = await response.json();
        setResult(data);
      } catch {
        // No result — redirect to history
        router.push('/exams/history');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [id, router]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen relative z-10">
        <Header showBack onBack={() => router.push('/exams/history')} title="Resultado" />
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-slate-700" style={{ borderTopColor: 'var(--gold-500)', animation: 'spin 1s linear infinite' }}></div>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const { percentage, passed, correct, wrong, total_questions, time_spent_seconds } = result;

  const getFeedback = () => {
    if (percentage >= 90) return { title: '¡Excelente!', message: 'Dominas este tema. ¡Sigue así!', icon: '🏆', color: 'var(--emerald-400)' };
    if (percentage >= 70) return { title: '¡Aprobado!', message: 'Buen rendimiento. Puedes mejorar aún más.', icon: '✅', color: 'var(--gold-400)' };
    if (percentage >= 50) return { title: 'Casi...', message: 'Estás cerca. Repasa los temas débiles.', icon: '📚', color: '#f59e0b' };
    return { title: 'No aprobado', message: 'Necesitas repasar. ¡No te rindas!', icon: '💪', color: '#ef4444' };
  };

  const fb = getFeedback();

  return (
    <div className="min-h-screen relative z-10">
      <Header showBack onBack={() => router.push('/exams/history')} title="Resultado" />
      <div className="max-w-4xl mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="text-5xl mb-4">{fb.icon}</div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            {fb.title}
          </h1>
          <p className="text-slate-400">{fb.message}</p>
          <p className="text-sm text-slate-500 mt-2">{result.exam_title}</p>
        </div>

        {/* Score Card */}
        <div className="card p-8 mb-8 text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="inline-block px-8 py-4 rounded-2xl mb-6" style={{
            background: passed
              ? 'linear-gradient(135deg, var(--emerald-600), var(--emerald-500))'
              : 'linear-gradient(135deg, #dc2626, #ef4444)',
          }}>
            <span className="text-4xl md:text-5xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
              {percentage}%
            </span>
          </div>

          <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-6 ml-4 ${
            passed ? 'text-emerald-400' : 'text-red-400'
          }`} style={{
            background: passed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${passed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
          }}>
            {passed ? 'APROBADO' : 'NO APROBADO'} (mínimo 70%)
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-8">
            <div className="p-4 rounded-xl" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div className="text-2xl font-bold text-emerald-400" style={{ fontFamily: 'var(--font-display)' }}>{correct}</div>
              <div className="text-xs text-slate-400 mt-1">Correctas</div>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div className="text-2xl font-bold text-red-400" style={{ fontFamily: 'var(--font-display)' }}>{wrong}</div>
              <div className="text-xs text-slate-400 mt-1">Incorrectas</div>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'rgba(212, 168, 67, 0.1)', border: '1px solid rgba(212, 168, 67, 0.2)' }}>
              <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--gold-400)' }}>{total_questions}</div>
              <div className="text-xs text-slate-400 mt-1">Total</div>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'rgba(100, 116, 139, 0.1)', border: '1px solid rgba(100, 116, 139, 0.2)' }}>
              <div className="text-2xl font-bold text-slate-300" style={{ fontFamily: 'var(--font-display)' }}>{formatTime(time_spent_seconds)}</div>
              <div className="text-xs text-slate-400 mt-1">Tiempo</div>
            </div>
          </div>
        </div>

        {/* Correct Answers */}
        {result.correct_answers.length > 0 && (
          <div className="card p-6 mb-6 animate-slide-up" style={{ animationDelay: '0.2s', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
            <h3 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Respuestas Correctas ({result.correct_answers.length})
            </h3>
            <div className="space-y-3">
              {result.correct_answers.map((a, i) => (
                <div key={i} className="p-4 rounded-xl" style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                  <p className="text-slate-300 text-sm font-medium mb-2">{a.question}</p>
                  {a.explanation && <p className="text-xs text-slate-500 mt-2">{a.explanation}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wrong Answers */}
        {result.wrong_answers.length > 0 && (
          <div className="card p-6 mb-6 animate-slide-up" style={{ animationDelay: '0.3s', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
            <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Respuestas Incorrectas ({result.wrong_answers.length})
            </h3>
            <div className="space-y-3">
              {result.wrong_answers.map((a, i) => (
                <div key={i} className="p-4 rounded-xl" style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                  <p className="text-slate-300 text-sm font-medium mb-2">{a.question}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm mt-2">
                    <span className="text-red-400">Tu respuesta: {String(a.user_answer)}</span>
                    <span className="text-emerald-400">Correcta: {String(a.correct_answer)}</span>
                  </div>
                  {a.explanation && <p className="text-xs text-slate-500 mt-2">{a.explanation}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <button onClick={() => router.push('/exams/create')} className="btn-primary px-8 py-4 text-base">
            Nuevo Examen
          </button>
          <button onClick={() => router.push('/exams/history')} className="btn-secondary px-8 py-4 text-base">
            Ver Historial
          </button>
        </div>
      </div>
    </div>
  );
}
