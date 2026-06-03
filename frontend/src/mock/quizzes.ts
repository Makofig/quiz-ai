import { Quiz } from '@/types';

const QUIZZES: Quiz[] = [
  {
    id: 'quiz-1',
    topic: 'Historia del Arte',
    difficulty: 'medium',
    type: 'theoretical',
    currentQuestionIndex: 0,
    questions: Array.from({ length: 5 }, (_, i) => ({
      number: i + 1,
      type: 'multiple',
      question: `Pregunta ${i + 1}: ¿Cuál es la respuesta correcta para Historia del Arte?`,
      options: ['Opción correcta', 'Opción incorrecta 1', 'Opción incorrecta 2', 'Opción incorrecta 3'],
      correct_answer: 0,
      explanation: 'Esta es una explicación demostrativa.',
    })),
    answers: {},
    isSubmitted: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'quiz-2',
    topic: 'Programación Web',
    difficulty: 'hard',
    type: 'practical',
    currentQuestionIndex: 0,
    questions: Array.from({ length: 10 }, (_, i) => ({
      number: i + 1,
      type: 'multiple',
      question: `Pregunta ${i + 1}: ¿Cuál es la respuesta correcta para Programación?`,
      options: ['Opción correcta', 'Opción incorrecta 1', 'Opción incorrecta 2', 'Opción incorrecta 3'],
      correct_answer: 0,
      explanation: 'Esta es una explicación demostrativa.',
    })),
    answers: {},
    isSubmitted: false,
    createdAt: new Date().toISOString(),
  },
];

export function getQuiz(id: string): Quiz | undefined {
  return QUIZZES.find(quiz => quiz.id === id);
}

export function getAllQuizzes(): Quiz[] {
  return QUIZZES;
}

export function createQuiz(quiz: Quiz): void {
  QUIZZES.push(quiz);
}

export function updateQuiz(quiz: Quiz): void {
  const index = QUIZZES.findIndex(q => q.id === quiz.id);
  if (index !== -1) {
    QUIZZES[index] = quiz;
  }
}

export function deleteQuiz(id: string): void {
  const index = QUIZZES.findIndex(q => q.id === id);
  if (index !== -1) {
    QUIZZES.splice(index, 1);
  }
}

export function generateQuiz(topic: string, difficulty: string): Quiz {
  const questionsCount = 5;
  const quizId = `quiz-${Date.now()}`;
  
  const newQuiz: Quiz = {
    id: quizId,
    topic: topic || 'General Knowledge',
    difficulty: difficulty as 'easy' | 'medium' | 'hard' | 'easy',
    type: 'theoretical',
    currentQuestionIndex: 0,
    questions: Array.from({ length: questionsCount }, (_, i) => ({
      number: i + 1,
      type: 'multiple',
      question: `Pregunta ${i + 1}: ¿Cuál es la respuesta correcta para ${topic || 'esto'}?`,
      options: [
        'Opción correcta',
        'Opción incorrecta 1',
        'Opción incorrecta 2',
        'Opción incorrecta 3',
      ],
      correct_answer: 0,
      explanation: 'Esta es una explicación demostrativa.',
    })),
    answers: {},
    isSubmitted: false,
    createdAt: new Date().toISOString(),
  };

  createQuiz(newQuiz);
  return newQuiz;
}