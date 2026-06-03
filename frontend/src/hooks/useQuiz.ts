import { useState, useCallback } from 'react';
import { generateQuiz } from '@/services/quiz';

export interface QuizFormState {
  topic: string;
  quiz_type: 'theoretical' | 'practical' | 'mixed';
  difficulty: 'easy' | 'medium' | 'hard';
  question_count: number;
  model: string;
}

export function useQuiz() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (form: QuizFormState) => {
    setIsGenerating(true);
    setError(null);
    try {
      const quiz = await generateQuiz({
        topic: form.topic || 'Conocimiento General',
        quiz_type: form.quiz_type,
        difficulty: form.difficulty,
        question_count: form.question_count,
        model: form.model,
      });
      return quiz;
    } catch (err: any) {
      setError(err.message || 'Error al generar el quiz');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { generate, isGenerating, error, clearError: () => setError(null) };
}
