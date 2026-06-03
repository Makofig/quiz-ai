'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQuizStore } from '@/store/quiz';
import Header from '@/components/Header';
import { MarkdownMath } from '@/components/MarkdownMath';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function QuizPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const { activeQuiz, addAnswer, nextQuestion, prevQuestion, resetQuiz, setResult } = useQuizStore();
  
  const [showExplanation, setShowExplanation] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [openAnswer, setOpenAnswer] = useState('');

  useEffect(() => {
    if (!activeQuiz || activeQuiz.id !== id) {
      resetQuiz();
    }
  }, [id, activeQuiz, resetQuiz]);

  useEffect(() => {
    if (activeQuiz) {
      const currentAnswer = activeQuiz.answers[activeQuiz.questions[activeQuiz.currentQuestionIndex]?.number];
      if (typeof currentAnswer === 'string') {
        setOpenAnswer(currentAnswer);
      } else {
        setOpenAnswer('');
      }
    }
  }, [activeQuiz?.currentQuestionIndex]);

  if (!activeQuiz || activeQuiz.id !== id) {
    return (
      <div className="min-h-screen flex items-center justify-center relative z-10">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-slate-700" style={{ borderTopColor: 'var(--gold-500)', animation: 'spin 1s linear infinite' }}></div>
          <h2 className="text-xl text-white font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Cargando Quiz...</h2>
          <p className="text-slate-400 mt-2">Por favor espera un momento</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  const currentQuestion = activeQuiz.questions[activeQuiz.currentQuestionIndex];
  const currentAnswer = activeQuiz.answers[currentQuestion.number];
  const isLastQuestion = activeQuiz.currentQuestionIndex === activeQuiz.questions.length - 1;
  const progress = ((activeQuiz.currentQuestionIndex + (hasAnswered ? 1 : 0)) / activeQuiz.questions.length) * 100;

  const getCorrectAnswer = (q: typeof currentQuestion) => {
    if (q.type === 'multiple_choice') return q.correct_option;
    if (q.type === 'true_false') return q.correct_answer;
    return q.reference_answer;
  };

  const handleMultipleChoice = (optionIndex: number) => {
    if (hasAnswered) return;
    addAnswer(currentQuestion.number, optionIndex);
    setHasAnswered(true);
    setShowExplanation(true);
  };

  const handleTrueFalse = (value: boolean) => {
    if (hasAnswered) return;
    addAnswer(currentQuestion.number, value);
    setHasAnswered(true);
    setShowExplanation(true);
  };

  const handleOpenAnswer = () => {
    if (hasAnswered || !openAnswer.trim()) return;
    addAnswer(currentQuestion.number, openAnswer.trim());
    setHasAnswered(true);
    setShowExplanation(true);
  };

  const handleNext = async () => {
    if (isLastQuestion) {
      setSubmitting(true);
      try {
        const answers = Object.entries(activeQuiz.answers).map(([num, selected]) => ({
          question_number: parseInt(num),
          selected_answer: selected,
        }));
        
        const questions = activeQuiz.questions.map((q) => ({
          number: q.number,
          question: q.question,
          correct_answer: getCorrectAnswer(q),
        }));

        const response = await fetch(`${API_URL}/results/grade`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            topic: activeQuiz.topic,
            difficulty: activeQuiz.difficulty || 'easy',
            quiz_type: activeQuiz.type || 'theoretical',
            answers,
            questions,
          }),
        });

        if (!response.ok) throw new Error('Error al calificar el quiz');

        const gradingResult = await response.json();

        const result = {
          totalQuestions: gradingResult.total_questions,
          correct: gradingResult.correct,
          wrong: gradingResult.wrong,
          percentage: gradingResult.percentage,
          correctAnswers: gradingResult.correct_answers.map((a: any) => ({
            question: a.question,
            selectedAnswer: a.selected_answer ?? '',
            correctAnswer: a.correct_answer,
          })),
          wrongAnswers: gradingResult.wrong_answers.map((a: any) => ({
            question: a.question,
            userAnswer: a.user_answer ?? '',
            correctAnswer: a.correct_answer,
          })),
          time_spent: 0,
          explanation: gradingResult.explanation,
        };

        setResult(result);
        router.push('/quiz/results');
      } catch {
        const totalQuestions = activeQuiz.questions.length;

        const correctAnswers = activeQuiz.questions.filter(q => {
          const correct = getCorrectAnswer(q);
          return activeQuiz.answers[q.number] === correct;
        }).length;

        const wrongAnswers = activeQuiz.questions.filter(q => {
          const correct = getCorrectAnswer(q);
          return activeQuiz.answers[q.number] !== correct;
        });

        const result = {
          totalQuestions,
          correct: correctAnswers,
          wrong: wrongAnswers.length,
          percentage: Math.round((correctAnswers / totalQuestions) * 100),
          correctAnswers: activeQuiz.questions.filter(q => {
            const correct = getCorrectAnswer(q);
            return activeQuiz.answers[q.number] === correct;
          }).map(q => ({
            question: q.question,
            selectedAnswer: activeQuiz.answers[q.number] ?? '',
            correctAnswer: getCorrectAnswer(q),
          })),
          wrongAnswers: wrongAnswers.map(q => ({
            question: q.question,
            userAnswer: activeQuiz.answers[q.number] ?? '',
            correctAnswer: getCorrectAnswer(q),
          })),
          time_spent: 0,
          explanation: `¡Excelente trabajo! Encontraste ${correctAnswers} respuestas correctas de ${totalQuestions} preguntas.`,
        };

        setResult(result);
        router.push('/quiz/results');
      } finally {
        setSubmitting(false);
      }
    } else {
      nextQuestion();
      setHasAnswered(false);
      setShowExplanation(false);
      setOpenAnswer('');
    }
  };

  const handleBack = () => {
    prevQuestion();
    setHasAnswered(false);
    setShowExplanation(false);
  };

  const renderQuestion = () => {
    if (currentQuestion.type === 'true_false') {
      return (
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleTrueFalse(true)}
            disabled={hasAnswered}
            className={`option-btn justify-center ${hasAnswered && currentAnswer === true ? (currentQuestion.correct_answer === true ? 'correct' : 'incorrect') : ''}`}
          >
            <span className="text-lg font-medium">Verdadero</span>
          </button>
          <button
            onClick={() => handleTrueFalse(false)}
            disabled={hasAnswered}
            className={`option-btn justify-center ${hasAnswered && currentAnswer === false ? (currentQuestion.correct_answer === false ? 'correct' : 'incorrect') : ''}`}
          >
            <span className="text-lg font-medium">Falso</span>
          </button>
        </div>
      );
    }

    if (currentQuestion.type === 'open_question') {
      return (
        <div className="space-y-4">
          <textarea
            value={openAnswer}
            onChange={(e) => setOpenAnswer(e.target.value)}
            placeholder="Escribe tu respuesta aquí..."
            disabled={hasAnswered}
            className="input-field min-h-[120px] resize-none"
          />
          {!hasAnswered && (
            <button
              onClick={handleOpenAnswer}
              disabled={!openAnswer.trim()}
              className="btn-primary w-full"
            >
              Enviar Respuesta
            </button>
          )}
          {hasAnswered && currentQuestion.reference_answer && (
            <div className="p-4 rounded-xl" style={{ background: 'rgba(212, 168, 67, 0.05)', border: '1px solid rgba(212, 168, 67, 0.2)' }}>
              <p className="text-sm text-slate-400 mb-1">Respuesta de referencia:</p>
              <p className="text-white font-medium">{currentQuestion.reference_answer}</p>
            </div>
          )}
        </div>
      );
    }

    // Multiple choice
    return (
      <div className="space-y-3">
        {currentQuestion.options.map((option, index) => {
          const isSelected = hasAnswered && currentAnswer === index;
          const isCorrect = index === currentQuestion.correct_option;
          const showCorrect = hasAnswered && isCorrect;
          
          let className = 'option-btn';
          if (showCorrect) className += ' correct';
          else if (isSelected && !isCorrect) className += ' incorrect';
          else if (isSelected) className += ' selected';

          return (
            <button
              key={index}
              onClick={() => handleMultipleChoice(index)}
              disabled={hasAnswered}
              className={className}
            >
              <div className="option-letter">
                {showCorrect ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : isSelected && !isCorrect ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  String.fromCharCode(65 + index)
                )}
              </div>
              <span className="flex-1">
                <MarkdownMath content={option} />
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen relative z-10">
      <Header showBack onBack={() => router.push('/')} title="Quiz" />
      <div className="max-w-3xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBack}
              disabled={activeQuiz.currentQuestionIndex === 0}
              className="btn-secondary text-sm px-4 py-2"
              style={{ opacity: activeQuiz.currentQuestionIndex === 0 ? 0.3 : 1 }}
            >
              ← Atrás
            </button>
            <span className="text-sm text-slate-400 font-medium" style={{ fontFamily: 'var(--font-display)' }}>
              {activeQuiz.currentQuestionIndex + 1} / {activeQuiz.questions.length}
            </span>
            <span className="badge badge-gold">{activeQuiz.topic}</span>
          </div>

          {/* Progress Bar */}
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="card p-6 md:p-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="mb-4">
            <span className="badge badge-emerald">
              {currentQuestion.type === 'multiple_choice' ? 'Opción Múltiple' :
               currentQuestion.type === 'true_false' ? 'Verdadero / Falso' :
               'Respuesta Abierta'}
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-semibold text-white mb-8 leading-relaxed" style={{ fontFamily: 'var(--font-display)' }}>
            <MarkdownMath content={currentQuestion.question} />
          </h2>

          {/* Answer Input */}
          {renderQuestion()}

          {/* Explanation */}
          {hasAnswered && showExplanation && (
            <div className="mt-8 p-5 rounded-xl animate-fade-in" style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <h3 className="text-sm font-semibold text-emerald-400 mb-2 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Explicación
              </h3>
              <span className="text-sm text-slate-300 leading-relaxed"><MarkdownMath content={currentQuestion.explanation} /></span>
            </div>
          )}
        </div>

        {/* Continue Button */}
        {hasAnswered && (
          <div className="mt-8 text-center animate-fade-in">
            <button
              onClick={handleNext}
              disabled={submitting}
              className="btn-primary text-base px-10 py-4"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Calificando...
                </span>
              ) : (
                isLastQuestion ? 'Ver Resultados' : 'Continuar →'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
