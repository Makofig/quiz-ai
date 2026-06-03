import { api } from '@/lib/api';

export interface GenerateQuizRequest {
  topic?: string;
  quiz_type: 'theoretical' | 'practical' | 'mixed';
  difficulty: 'easy' | 'medium' | 'hard';
  question_count: number;
  model?: string;
}

export interface QuizResponse {
  questions: Array<{
    question_number: number;
    question: string;
    options: Array<{ text: string; score: number }>;
    correct_answer: number;
    explanation?: string;
  }>;
  topic: string;
}

export interface QuizResultRequest {
  quiz_id: string;
  answers: Record<number, number>;
  score: number;
}

export interface QuizResult {
  quiz_id: string;
  score: number;
  total_questions: number;
  answers: Record<number, number>;
}

export async function generateQuiz(data: GenerateQuizRequest) {
  const res = await api.post<QuizResponse>('/quiz/generate', data);
  return res.data;
}

export async function saveQuizResult(data: QuizResultRequest) {
  const res = await api.post<QuizResult>('/results/save', data);
  return res.data;
}

export async function getUserResults() {
  const res = await api.get<QuizResult[]>('/results/my-results');
  return res.data;
}
