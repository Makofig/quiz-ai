'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useQuizStore } from '@/store/quiz';
import Header from '@/components/Header';
import FileUpload from '@/components/FileUpload';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function Home() {
  const router = useRouter();
  const { activeQuiz } = useQuizStore();

  const [topic, setTopic] = useState('');
  const [quizType, setQuizType] = useState<'theoretical' | 'practical' | 'mixed'>('theoretical');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [model, setModel] = useState('');
  const [availableModels, setAvailableModels] = useState<{id: string; name: string; model: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingModels, setLoadingModels] = useState(true);
  const [error, setError] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await fetch(`${API_URL}/quiz/models`);
        if (res.ok) {
          const data = await res.json();
          setAvailableModels(data.models || []);
          if (data.models?.length > 0 && !model) setModel(data.models[0].id);
        }
      } catch {
        // Fallback to hardcoded models
        const fallback = [
          { id: 'mistral', name: 'Mistral', model: 'mistral:7b' },
          { id: 'gemma', name: 'Gemma', model: 'gemma4:e4b' },
          { id: 'qwen', name: 'Qwen', model: 'qwen3.6:35b' },
        ];
        setAvailableModels(fallback);
        setModel('mistral');
      } finally {
        setLoadingModels(false);
      }
    };
    fetchModels();
  }, []);

  useEffect(() => {
    if (activeQuiz && !activeQuiz.isSubmitted) {
      router.push(`/quiz/${activeQuiz.id}`);
    }
  }, [activeQuiz, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/quiz/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: fileContent ? undefined : topic,
          content: fileContent || undefined,
          quiz_type: quizType,
          difficulty,
          question_count: questionCount,
          model: model || undefined,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || 'Error al generar el quiz');
      }

      const data = await response.json();

      const quiz = {
        id: data.id || `quiz-${Date.now()}`,
        topic: data.topic || topic || 'General Knowledge',
        difficulty,
        type: quizType,
        currentQuestionIndex: 0,
        questions: data.questions.map((q: any, i: number) => ({
          number: q.number || i + 1,
          type: q.type || 'multiple_choice',
          question: q.question,
          options: q.options ?? [],
          correct_option: q.correct_option,
          correct_answer: q.correct_answer,
          reference_answer: q.reference_answer,
          explanation: q.explanation || '',
        })),
        answers: {},
        isSubmitted: false,
        createdAt: data.created_at || new Date().toISOString(),
      };

      useQuizStore.getState().setQuiz(quiz);
      router.push(`/quiz/${quiz.id}`);
    } catch (err: any) {
      setError(err.message || 'Error al generar el quiz. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative z-10">
      <Header />
      <div className="max-w-4xl mx-auto p-6">
        {/* Hero */}
        <div className="text-center mb-12 py-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 badge badge-gold mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Plataforma de Aprendizaje IA
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            Generador de{' '}
            <span className="text-gradient-gold">Quizzes</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Crea evaluaciones personalizadas impulsadas por inteligencia artificial para potenciar tu aprendizaje
          </p>
          <button
            onClick={() => document.getElementById('quiz-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="mt-6 btn-primary px-10 py-4 text-lg inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Comenzar
          </button>
        </div>

        {/* Form Card */}
        <div id="quiz-form" className="card p-8 md:p-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* File Upload */}
            <FileUpload
              onContentExtracted={(content, filename) => {
                setFileContent(content);
                setUploadedFileName(filename);
                if (content) setTopic(filename.replace(/\.[^/.]+$/, ''));
              }}
              disabled={loading}
            />

            {/* Divider */}
            {fileContent && (
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-slate-700"></div>
                <span className="text-xs text-slate-500">o escribe un tema</span>
                <div className="flex-1 h-px bg-slate-700"></div>
              </div>
            )}

            {/* Topic Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                {fileContent ? 'Tema del Quiz (opcional)' : 'Tema de Evaluación'}
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ej: Programación en Python, Historia del Arte, Física Cuántica..."
                disabled={loading || !!fileContent}
                className="input-field"
              />
            </div>

            {/* Grid Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                  Tipo
                </label>
                <select
                  value={quizType}
                  onChange={(e) => setQuizType(e.target.value as any)}
                  disabled={loading}
                  className="select-field"
                >
                  <option value="theoretical">Teórico</option>
                  <option value="practical">Práctico</option>
                  <option value="mixed">Mixto</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                  Dificultad
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  disabled={loading}
                  className="select-field"
                >
                  <option value="easy">Fácil</option>
                  <option value="medium">Medio</option>
                  <option value="hard">Difícil</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                  Cantidad
                </label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  disabled={loading}
                  className="select-field"
                >
                  <option value="5">5 preguntas</option>
                  <option value="10">10 preguntas</option>
                  <option value="20">20 preguntas</option>
                  <option value="30">30 preguntas</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                  Modelo IA
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  disabled={loading || loadingModels}
                  className="select-field"
                >
                  {loadingModels ? (
                    <option>Cargando...</option>
                  ) : availableModels.length === 0 ? (
                    <option>Sin modelos</option>
                  ) : (
                    availableModels.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Preview */}
            <div className="p-4 rounded-lg" style={{ background: 'rgba(212, 168, 67, 0.05)', border: '1px solid rgba(212, 168, 67, 0.15)' }}>
              <p className="text-sm text-slate-400">
                <span className="text-slate-500">Vista previa:</span>{' '}
                <span className="text-white font-medium">{topic || '—'}</span>
                {' · '}
                <span className="text-amber-400">{quizType}</span>
                {' · '}
                <span className="text-emerald-400">{difficulty}</span>
                {' · '}
                <span className="text-blue-400">{questionCount} preguntas</span>
                {model && (
                  <>
                    {' · '}
                    <span className="text-purple-400">
                      {availableModels.find(m => m.id === model)?.name || model}
                    </span>
                  </>
                )}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 rounded-lg text-center" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || (!topic && !fileContent)}
              className="btn-primary w-full text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generando quiz...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Start Quiz
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 stagger-children">
          {[
            {
              title: 'Personalizado',
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.42 15.17l-5.248-5.248a7.5 7.5 0 1110.607 0L11.42 15.17zM8.5 11a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                </svg>
              ),
              description: 'Configura tema, dificultad y cantidad de preguntas según tus necesidades'
            },
            {
              title: 'Inteligente',
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              ),
              description: 'Generación automatizada con IA local para calidad garantizada y privacidad total'
            },
            {
              title: 'Feedback',
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              ),
              description: 'Análisis detallado de resultados con explicaciones para cada respuesta'
            }
          ].map((feature, i) => (
            <div key={i} className="card p-6 group">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(212, 168, 67, 0.1)', color: 'var(--gold-400)' }}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                {feature.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <button
            onClick={() => router.push('/exams/create')}
            className="card px-6 py-4 flex items-center gap-3 hover:bg-white/[0.03] transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>Examen Cronometrado</div>
              <div className="text-xs text-slate-500">Simulacro con límite de tiempo</div>
            </div>
          </button>
          <button
            onClick={() => router.push('/quiz/history')}
            className="card px-6 py-4 flex items-center gap-3 hover:bg-white/[0.03] transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>Historial</div>
              <div className="text-xs text-slate-500">Tus quizzes y exámenes</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
