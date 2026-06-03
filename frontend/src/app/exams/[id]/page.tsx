'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import Header from '@/components/Header';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface ExamQuestion {
  number: number;
  type: string;
  question: string;
  options: string[];
  correct_option?: number;
  correct_answer?: boolean;
  reference_answer?: string;
  explanation: string;
}

interface ExamData {
  id: string;
  title: string;
  exam_type: string;
  topic: string | null;
  difficulty: string | null;
  total_questions: number;
  duration_minutes: number;
  status: string;
  questions: ExamQuestion[];
  created_at: string;
}

interface ExamAttemptData {
  attempt_id: string;
  exam_id: string;
  started_at: string;
  expires_at: string;
  duration_minutes: number;
  questions: ExamQuestion[];
}

export default function ExamPlayerPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const [exam, setExam] = useState<ExamData | null>(null);
  const [attempt, setAttempt] = useState<ExamAttemptData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [expired, setExpired] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load exam + start attempt
  useEffect(() => {
    const loadExam = async () => {
      try {
        // Get exam details
        const examRes = await fetch(`${API_URL}/exams/${id}`);
        if (!examRes.ok) throw new Error('Examen no encontrado');
        const examData = await examRes.json();
        setExam(examData);

        // Start or resume attempt
        const startRes = await fetch(`${API_URL}/exams/${id}/start`, {
          method: 'POST',
        });
        if (!startRes.ok) throw new Error('Error al iniciar examen');
        const attemptData = await startRes.json();
        setAttempt(attemptData);

        // Calculate remaining time
        const expiresAt = new Date(attemptData.expires_at).getTime();
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
        setTimeLeft(remaining);

        if (remaining <= 0) {
          setExpired(true);
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar examen');
      } finally {
        setLoading(false);
      }
    };

    loadExam();
  }, [id]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0 && attempt) {
      setExpired(true);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [attempt, timeLeft > 0]);

  // Auto-submit on expiry
  useEffect(() => {
    if (expired && !submitting && attempt) {
      handleSubmit();
    }
  }, [expired]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAnswer = useCallback(async (questionNumber: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionNumber]: value }));

    // Save immediately to backend
    try {
      await fetch(`${API_URL}/exams/${id}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question_number: questionNumber,
          selected_answer: value,
        }),
      });
    } catch {
      // Silently fail — answer is still in local state
    }
  }, [id]);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const response = await fetch(`${API_URL}/exams/${id}/submit`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Error al enviar examen');

      const result = await response.json();
      // Store result in sessionStorage for the results page
      sessionStorage.setItem(`exam_result_${id}`, JSON.stringify(result));
      router.push(`/exams/results/${id}`);
    } catch (err: any) {
      setError(err.message || 'Error al enviar');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative z-10">
        <Header showBack onBack={() => router.push('/exams/create')} title="Examen" />
        <div className="flex items-center justify-center py-20">
          <div className="text-center animate-fade-in">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-slate-700" style={{ borderTopColor: 'var(--gold-500)', animation: 'spin 1s linear infinite' }}></div>
            <p className="text-slate-400">Cargando examen...</p>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </div>
    );
  }

  if (error && !exam) {
    return (
      <div className="min-h-screen relative z-10">
        <Header showBack onBack={() => router.push('/exams/create')} title="Examen" />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={() => router.push('/exams/create')} className="btn-primary px-6 py-3">Volver</button>
          </div>
        </div>
      </div>
    );
  }

  if (!exam || !attempt) return null;

  const questions = attempt.questions;
  const current = questions[currentIndex];
  const currentAnswer = answers[current.number];
  const progress = ((currentIndex + (hasAnswered ? 1 : 0)) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;
  const isUrgent = timeLeft < 300;

  return (
    <div className="min-h-screen relative z-10">
      <Header showBack onBack={() => router.push('/exams/create')} title="Examen" />

      {/* Timer Bar */}
      <div className="sticky top-16 z-40" style={{ background: 'rgba(10, 14, 26, 0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400" style={{ fontFamily: 'var(--font-display)' }}>
              {exam.title}
            </span>
            <span className="text-xs px-2 py-1 rounded-full" style={{
              background: 'rgba(212, 168, 67, 0.1)',
              border: '1px solid rgba(212, 168, 67, 0.2)',
              color: 'var(--gold-400)',
            }}>
              {answeredCount}/{questions.length} respondidas
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Timer */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg font-bold ${
              isUrgent ? 'animate-pulse' : ''
            }`} style={{
              background: isUrgent ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.1)',
              border: `1px solid ${isUrgent ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.2)'}`,
              color: isUrgent ? '#ef4444' : '#10b981',
            }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatTime(timeLeft)}
            </div>

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary px-6 py-2 text-sm"
            >
              {submitting ? 'Enviando...' : 'Entregar'}
            </button>
          </div>
        </div>
        {/* Progress */}
        <div className="h-1 w-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="h-full transition-all duration-300" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, var(--gold-500), var(--emerald-500))' }}></div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 md:p-8">
        <div className="flex gap-6">
          {/* Question navigator sidebar */}
          <div className="hidden lg:block w-48 flex-shrink-0">
            <div className="card p-4 sticky top-40">
              <h3 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
                Preguntas
              </h3>
              <div className="grid grid-cols-5 gap-1.5">
                {questions.map((q, i) => {
                  const hasAnswer = !!answers[q.number];
                  const isCurrent = i === currentIndex;
                  return (
                    <button
                      key={q.number}
                      onClick={() => setCurrentIndex(i)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                        isCurrent ? 'ring-2 ring-offset-1' : ''
                      }`}
                      style={{
                        background: hasAnswer
                          ? isCurrent ? 'rgba(212, 168, 67, 0.3)' : 'rgba(16, 185, 129, 0.2)'
                          : isCurrent ? 'rgba(212, 168, 67, 0.15)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${isCurrent ? 'rgba(212, 168, 67, 0.4)' : hasAnswer ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.06)'}`,
                        color: hasAnswer ? '#10b981' : isCurrent ? 'var(--gold-400)' : '#64748b',
                        ringColor: 'var(--gold-500)',
                      }}
                    >
                      {q.number}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Question content */}
          <div className="flex-1">
            {/* Question Card */}
            <div className="card p-6 md:p-8 animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <span className="badge badge-emerald">
                  {current.type === 'multiple_choice' ? 'Opción Múltiple' :
                   current.type === 'true_false' ? 'Verdadero / Falso' :
                   'Respuesta Abierta'}
                </span>
                <span className="text-sm text-slate-500" style={{ fontFamily: 'var(--font-display)' }}>
                  Pregunta {currentIndex + 1} de {questions.length}
                </span>
              </div>

              <h2 className="text-xl md:text-2xl font-semibold text-white mb-8 leading-relaxed" style={{ fontFamily: 'var(--font-display)' }}>
                {current.question}
              </h2>

              {/* Answer options */}
              {current.type === 'multiple_choice' && (
                <div className="space-y-3">
                  {current.options.map((option, index) => {
                    const isSelected = currentAnswer === String(index);
                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswer(current.number, String(index))}
                        disabled={expired}
                        className={`option-btn ${isSelected ? 'selected' : ''}`}
                      >
                        <div className="option-letter">
                          {isSelected ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            String.fromCharCode(65 + index)
                          )}
                        </div>
                        <span className="flex-1">{option}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {current.type === 'true_false' && (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleAnswer(current.number, 'true')}
                    disabled={expired}
                    className={`option-btn justify-center ${currentAnswer === 'true' ? 'selected' : ''}`}
                  >
                    <span className="text-lg font-medium">Verdadero</span>
                  </button>
                  <button
                    onClick={() => handleAnswer(current.number, 'false')}
                    disabled={expired}
                    className={`option-btn justify-center ${currentAnswer === 'false' ? 'selected' : ''}`}
                  >
                    <span className="text-lg font-medium">Falso</span>
                  </button>
                </div>
              )}

              {current.type === 'open_question' && (
                <textarea
                  value={currentAnswer || ''}
                  onChange={(e) => handleAnswer(current.number, e.target.value)}
                  placeholder="Escribe tu respuesta aquí..."
                  disabled={expired}
                  className="input-field min-h-[120px] resize-none"
                />
              )}
            </div>

            {/* Navigation */}
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="btn-secondary px-6 py-3"
                style={{ opacity: currentIndex === 0 ? 0.3 : 1 }}
              >
                ← Anterior
              </button>

              {currentIndex === questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-primary px-8 py-3"
                >
                  {submitting ? 'Enviando...' : 'Entregar Examen'}
                </button>
              ) : (
                <button
                  onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
                  className="btn-primary px-6 py-3"
                >
                  Siguiente →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
