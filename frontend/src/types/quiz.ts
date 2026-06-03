export interface Quiz {
  id: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'theoretical' | 'practical' | 'mixed';
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<number, number | boolean | string>;
  isSubmitted: boolean;
  result?: QuizResult;
  createdAt: string;
  completedAt?: string;
}

export interface Question {
  number: number;
  type: 'multiple_choice' | 'true_false' | 'open_question';
  question: string;
  options: string[];
  correct_option?: number;
  correct_answer?: number | boolean | string;
  reference_answer?: string;
  explanation: string;
}

export interface QuizResult {
  totalQuestions: number;
  correct: number;
  wrong: number;
  percentage: number;
  correctAnswers: Array<{ question: string; selectedAnswer: number | boolean | string; correctAnswer: number | boolean | string }>;
  wrongAnswers: Array<{ question: string; userAnswer: number | boolean | string; correctAnswer: number | boolean | string }>;
  time_spent: number;
  explanation: string;
}

export interface QuizState {
  activeQuiz: Quiz | null;
  generating: boolean;
  generatingError: string | null;
  history: Quiz[];
  setGenerating: (value: boolean) => void;
  setGeneratingError: (value: string | null) => void;
  setQuiz: (quiz: Quiz) => void;
  addAnswer: (questionNumber: number, answer: number | boolean | string) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  resetQuiz: () => void;
  setResult: (result: QuizResult) => void;
  addToHistory: (quiz: Quiz) => void;
  clearResult: () => void;
}