'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQuizStore } from '@/store/quiz';
import Header from '@/components/Header';

export default function ResultsPage() {
  const router = useRouter();
  const { activeQuiz, resetQuiz } = useQuizStore();
  const result = activeQuiz?.result;

  useEffect(() => {
    if (!result) {
      router.push('/');
    }
  }, [result, router]);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center relative z-10">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-slate-700" style={{ borderTopColor: 'var(--gold-500)', animation: 'spin 1s linear infinite' }}></div>
          <h2 className="text-xl text-white font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Cargando resultados...</h2>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  const { correct, wrong, totalQuestions } = result;

  const getFeedbackMessage = () => {
    const pct = result.percentage;
    if (pct >= 90) return { title: '¡Excelente!', message: '¡Eres un experto en este tema!', icon: '🏆' };
    if (pct >= 70) return { title: '¡Muy bien!', message: 'Tienes un conocimiento sólido.', icon: '🎯' };
    if (pct >= 50) return { title: 'Bien hecho', message: 'Tienes buenas bases, pero puedes mejorar.', icon: '📚' };
    return { title: 'Sigue practicando', message: 'No te desanimes, ¡es la forma de aprender!', icon: '💪' };
  };

  const { title, message, icon } = getFeedbackMessage();

  return (
    <div className="min-h-screen relative z-10">
      <Header showBack onBack={() => { resetQuiz(); router.push('/'); }} title="Resultados" />
      <div className="max-w-4xl mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="text-5xl mb-4">{icon}</div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Resultados del Quiz
          </h1>
          <p className="text-slate-400">
            {activeQuiz?.topic || 'Tópico sin especificar'}
          </p>
        </div>

        {/* Score Card */}
        <div className="card p-8 mb-8 text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="inline-block px-8 py-4 rounded-2xl mb-6" style={{
            background: result.percentage >= 80
              ? 'linear-gradient(135deg, var(--emerald-600), var(--emerald-500))'
              : result.percentage >= 50
              ? 'linear-gradient(135deg, #d97706, #f59e0b)'
              : 'linear-gradient(135deg, #dc2626, #ef4444)',
          }}>
            <span className="text-4xl md:text-5xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
              {result.percentage}%
            </span>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>{title}</h2>
          <p className="text-slate-400">{message}</p>

          {/* Breakdown */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="p-4 rounded-xl" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div className="text-2xl font-bold text-emerald-400" style={{ fontFamily: 'var(--font-display)' }}>{correct}</div>
              <div className="text-xs text-slate-400 mt-1">Correctas</div>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div className="text-2xl font-bold text-red-400" style={{ fontFamily: 'var(--font-display)' }}>{wrong}</div>
              <div className="text-xs text-slate-400 mt-1">Incorrectas</div>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'rgba(212, 168, 67, 0.1)', border: '1px solid rgba(212, 168, 67, 0.2)' }}>
              <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--gold-400)' }}>{totalQuestions}</div>
              <div className="text-xs text-slate-400 mt-1">Total</div>
            </div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="space-y-6 stagger-children">
          {/* Correct Answers */}
          {result.correctAnswers.length > 0 && (
            <div className="card p-6" style={{ borderColor: 'rgba(16, 185, 129, 0.2)' }}>
              <h3 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Respuestas Correctas
              </h3>
              <div className="space-y-3">
                {result.correctAnswers.map((answer, index) => (
                  <div key={index} className="p-4 rounded-xl" style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                    <p className="text-slate-300 text-sm font-medium mb-2">{answer.question}</p>
                    <div className="flex items-center text-emerald-400 text-sm">
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Respuesta: {typeof answer.selectedAnswer === 'number'
                        ? `Opción ${answer.selectedAnswer + 1}`
                        : answer.selectedAnswer}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Wrong Answers */}
          {result.wrongAnswers.length > 0 && (
            <div className="card p-6" style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
              <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Respuestas Incorrectas
              </h3>
              <div className="space-y-3">
                {result.wrongAnswers.map((answer, index) => (
                  <div key={index} className="p-4 rounded-xl" style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                    <p className="text-slate-300 text-sm font-medium mb-3">{answer.question}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <span className="flex items-center text-red-400">
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Tu respuesta: Opción {(answer.userAnswer as number) + 1}
                      </span>
                      <span className="flex items-center text-emerald-400">
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Correcta: Opción {(answer.correctAnswer as number) + 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <button
            onClick={() => {
              resetQuiz();
              router.push('/');
            }}
            className="btn-primary px-8 py-4 text-base"
          >
            Generar Nuevo Quiz
          </button>
          <button
            onClick={() => {
              resetQuiz();
              router.push('/leaderboard');
            }}
            className="btn-secondary px-8 py-4 text-base"
          >
            Ver Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
}
