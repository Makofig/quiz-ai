/** Quiz service */
import { apiClient } from '@/lib/api-client';
import { Quiz, QuizResult } from '@/types';

/** Grade quiz and save results */
export const gradeQuiz = async (
  topic: string,
  answers: Array<{ question_number: number; selected_answer: number }>,
  questions: Array<{ number: number; question: string; correct_answer: number }>
): Promise<QuizResult> => {
  const response = await apiClient.post('/results/grade', {
    topic,
    answers,
    questions,
  });

  return response.data;
};

/** Get leaderboard */
export const getLeaderboard = async (
  limit: number = 10,
  offset: number = 0
): Promise<{
  leaderboard: any[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}> => {
  const response = await apiClient.get('/leaderboard/', {
    params: { limit, offset },
  });
  return response.data;
};

/** Get user ranking */
export const getUserRanking = async (user_id: number) => {
  const response = await apiClient.get(`/leaderboard/user/${user_id}`);
  return response.data;
};
