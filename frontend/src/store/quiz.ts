import { create } from 'zustand';
import { Quiz, QuizState } from '@/types';

export const useQuizStore = create<QuizState>((set, get) => ({
  activeQuiz: null,
  generating: false,
  generatingError: null,
  history: [],

  setGenerating: (value: boolean) =>
    set({ generating: value }),

  setGeneratingError: (value: string | null) =>
    set({ generatingError: value }),

  setQuiz: (quiz: Quiz) => {
    set({ activeQuiz: quiz });
    get().addToHistory(quiz);
  },

  addAnswer: (questionNumber: number, answer: number | boolean | string) =>
    set((state) => ({
      activeQuiz: state.activeQuiz
        ? {
            ...state.activeQuiz,
            answers: {
              ...state.activeQuiz.answers,
              [questionNumber]: answer,
            },
          }
        : null,
    })),

  nextQuestion: () =>
    set((state) => ({
      activeQuiz:
        state.activeQuiz &&
        state.activeQuiz.currentQuestionIndex <
          state.activeQuiz.questions.length - 1
          ? {
              ...state.activeQuiz,
              currentQuestionIndex:
                state.activeQuiz.currentQuestionIndex + 1,
            }
          : state.activeQuiz,
    })),

  prevQuestion: () =>
    set((state) => ({
      activeQuiz:
        state.activeQuiz && state.activeQuiz.currentQuestionIndex > 0
          ? {
              ...state.activeQuiz,
              currentQuestionIndex:
                state.activeQuiz.currentQuestionIndex - 1,
            }
          : state.activeQuiz,
    })),

  resetQuiz: () =>
    set({
      activeQuiz: null,
      generatingError: null,
    }),

  setResult: (result) =>
    set((state) => ({
      activeQuiz: state.activeQuiz
        ? {
            ...state.activeQuiz,
            isSubmitted: true,
            result,
          }
        : null,
    })),

  addToHistory: (quiz) =>
    set((state) => ({
      history: [...state.history, quiz],
    })),

  clearResult: () =>
    set((state) => ({
      activeQuiz: state.activeQuiz
        ? {
            ...state.activeQuiz,
            isSubmitted: false,
            result: undefined,
          }
        : null,
    })),
}));