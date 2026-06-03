'use client';

import { useRouter } from 'next/navigation';
import { useQuizStore } from '@/store/quiz';

export default function QuizList() {
  const router = useRouter();
  const { history, activeQuiz, resetQuiz } = useQuizStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Mis Quizzes
          </h1>
          <p className="text-gray-400 text-lg">Gestiona tus quizzes y compite por el liderazgo</p>
        </div>

        {/* Active Quiz Section */}
        {activeQuiz && (
          <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-2xl p-8 mb-8 border border-blue-500/30">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Quiz Activo
            </h2>
            <p className="text-blue-300 mb-4">
              Continúa tu quiz donde lo dejaste
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => router.push(`/quiz/${activeQuiz.id}`)}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all transform hover:-translate-y-1 active:scale-95"
              >
                Continuar Quiz
              </button>
              <button
                onClick={() => resetQuiz()}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Quiz History */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Historial de Quizzes</h2>
          
          {history.length === 0 ? (
            <div className="text-center py-12 bg-gray-800 rounded-2xl border border-gray-700">
              <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <p className="text-gray-400">No tienes quizzes guardados.</p>
              <p className="text-gray-500 mt-2">¡Crea uno nuevo para empezar!</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {history.map((quiz) => (
                <div 
                  key={quiz.id} 
                  className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-green-500 transition-all transform hover:-translate-y-1 shadow-lg"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{quiz.topic}</h3>
                      <div className="flex gap-2 mb-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          quiz.difficulty === 'easy' ? 'bg-green-600/20 text-green-400' :
                          quiz.difficulty === 'medium' ? 'bg-yellow-600/20 text-yellow-400' :
                          'bg-red-600/20 text-red-400'
                        }`}>
                          {quiz.difficulty === 'easy' ? 'Fácil' : quiz.difficulty === 'medium' ? 'Medio' : 'Difícil'}
                        </span>
                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-600/20 text-blue-400">
                          {quiz.questions.length} preguntas
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/quiz/${quiz.id}`)}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-bold rounded-xl transition-all transform hover:-translate-y-1 active:scale-95"
                    >
                      Comenzar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}