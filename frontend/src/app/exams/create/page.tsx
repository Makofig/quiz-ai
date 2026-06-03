'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Header from '@/components/Header';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function CreateExamPage() {
  const router = useRouter();

  const [topic, setTopic] = useState('');
  const [examType, setExamType] = useState('complete');
  const [difficulty, setDifficulty] = useState('medium');
  const [questions, setQuestions] = useState(20);
  const [duration, setDuration] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const examTypes = [
    { value: 'theoretical', label: 'Teórico', icon: '📖', desc: 'Solo preguntas teóricas' },
    { value: 'practical', label: 'Práctico', icon: '💻', desc: 'Solo ejercicios prácticos' },
    { value: 'complete', label: 'Completo', icon: '🎯', desc: 'Mezcla teoría y práctica' },
  ];

  const difficulties = [
    { value: 'easy', label: 'Fácil', color: 'var(--emerald-400)' },
    { value: 'medium', label: 'Medio', color: 'var(--gold-400)' },
    { value: 'hard', label: 'Difícil', color: 'var(--coral-500)' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/exams/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic.trim(),
          exam_type: examType,
          difficulty,
          questions,
          duration_minutes: duration,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || 'Error al crear examen');
      }

      const data = await response.json();
      router.push(`/exams/${data.id}`);
    } catch (err: any) {
      setError(err.message || 'Error al crear el examen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative z-10">
      <Header showBack onBack={() => router.push('/')} title="Exámenes" />
      <div className="max-w-3xl mx-auto p-6 md:p-8">
        {/* Title */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Crear <span className="text-gradient-gold">Examen</span>
          </h1>
          <p className="text-slate-400">Configura tu examen cronometrado</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Topic */}
          <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.05s' }}>
            <label className="block text-sm font-medium text-slate-300 mb-3" style={{ fontFamily: 'var(--font-display)' }}>
              Tema del Examen
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ej: Programación en Python, Base de Datos, Redes..."
              disabled={loading}
              className="input-field"
              required
            />
          </div>

          {/* Exam Type */}
          <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <label className="block text-sm font-medium text-slate-300 mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Tipo de Examen
            </label>
            <div className="grid grid-cols-3 gap-3">
              {examTypes.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setExamType(t.value)}
                  disabled={loading}
                  className={`p-4 rounded-xl text-center transition-all ${
                    examType === t.value
                      ? 'ring-2'
                      : 'hover:bg-white/[0.03]'
                  }`}
                  style={{
                    background: examType === t.value ? 'rgba(212, 168, 67, 0.1)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${examType === t.value ? 'rgba(212, 168, 67, 0.3)' : 'rgba(255,255,255,0.06)'}`,
                    ringColor: 'var(--gold-500)',
                  }}
                >
                  <div className="text-2xl mb-2">{t.icon}</div>
                  <div className="text-sm font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>{t.label}</div>
                  <div className="text-xs text-slate-500 mt-1">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <label className="block text-sm font-medium text-slate-300 mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Dificultad
            </label>
            <div className="grid grid-cols-3 gap-3">
              {difficulties.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDifficulty(d.value)}
                  disabled={loading}
                  className={`p-3 rounded-xl text-center transition-all ${
                    difficulty === d.value ? 'ring-2' : 'hover:bg-white/[0.03]'
                  }`}
                  style={{
                    background: difficulty === d.value ? `rgba(${d.value === 'easy' ? '16,185,129' : d.value === 'medium' ? '212,168,67' : '239,68,68'}, 0.1)` : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${difficulty === d.value ? `rgba(${d.value === 'easy' ? '16,185,129' : d.value === 'medium' ? '212,168,67' : '239,68,68'}, 0.3)` : 'rgba(255,255,255,0.06)'}`,
                    ringColor: d.color,
                  }}
                >
                  <div className="text-sm font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>{d.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Questions + Duration */}
          <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                  Cantidad de Preguntas
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuestions(Math.max(5, questions - 5))}
                    disabled={loading}
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    -
                  </button>
                  <div className="flex-1 text-center">
                    <span className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>{questions}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setQuestions(Math.min(100, questions + 5))}
                    disabled={loading}
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                  Duración (minutos)
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setDuration(Math.max(5, duration - 5))}
                    disabled={loading}
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    -
                  </button>
                  <div className="flex-1 text-center">
                    <span className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>{duration}</span>
                    <span className="text-xs text-slate-500 ml-1">min</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDuration(Math.min(240, duration + 5))}
                    disabled={loading}
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 rounded-xl animate-fade-in" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Submit */}
          <div className="animate-slide-up" style={{ animationDelay: '0.25s' }}>
            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="btn-primary w-full py-4 text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generando Examen...
                </span>
              ) : (
                `Crear Examen — ${questions} preguntas, ${duration} min`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
