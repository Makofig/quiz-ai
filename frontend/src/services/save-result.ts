import { useState, useEffect } from 'react';
import { useQuizStore } from '@/store/quiz';
import { gradeQuiz } from './quiz-service';

/**
 * Hook to save quiz results to backend
 */
export const useResultSaver = () => {
  const { activeQuiz, setResult, clearResult } = useQuizStore();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Save result when quiz is submitted
  useEffect(() => {
    if (activeQuiz?.isSubmitted && activeQuiz.questions && activeQuiz.answers && !saved) {
      saveResult();
    }
  }, [activeQuiz?.isSubmitted]);

  const saveResult = async () => {
    if (!activeQuiz || !activeQuiz.questions || !activeQuiz.answers) return;

    setSaving(true);

    try {
      // Prepare answers array
      const answers = Object.entries(activeQuiz.answers).map(([questionNumber, answerIndex]) => ({
        question_number: parseInt(questionNumber, 10),
        selected_answer: answerIndex,
      }));

      // Prepare questions array
      const questions = activeQuiz.questions.map((q, index) => ({
        number: index + 1,
        question: q.question,
        correct_answer: q.correctAnswer,
      }));

      // Send to backend
      const result = await gradeQuiz(
        activeQuiz.topic,
        answers,
        questions
      );

      setResult(result);
      setSaved(true);
    } catch (error) {
      console.error('Error saving result:', error);
    } finally {
      setSaving(false);
    }
  };

  return { saving, saved };
};
