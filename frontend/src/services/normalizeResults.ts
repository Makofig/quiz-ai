/** Normalize backend snake_case to frontend camelCase */
export const normalizeResults = (backendResult: {
  total_questions: number;
  correct: number;
  wrong: number;
  percentage: number;
  correct_answers: Array<{ question: string; selected_answer: number; correct_answer: number }>;
  wrong_answers: Array<{ question: string; user_answer: number; correct_answer: number }>;
  explanation: string;
}) => ({
  totalQuestions: backendResult.total_questions,
  correct: backendResult.correct,
  wrong: backendResult.wrong,
  percentage: backendResult.percentage,
  correctAnswers: backendResult.correct_answers.map(a => ({
    question: a.question,
    selectedAnswer: a.selected_answer,
    correctAnswer: a.correct_answer,
  })),
  wrongAnswers: backendResult.wrong_answers.map(a => ({
    question: a.question,
    userAnswer: a.user_answer,
    correctAnswer: a.correct_answer,
  })),
  explanation: backendResult.explanation,
});

export type FrontendResults = ReturnType<typeof normalizeResults>;
