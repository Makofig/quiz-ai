import { create } from 'zustand';
import { LeaderboardEntry } from '@/types';

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    userId: 'user-3',
    username: 'MariaG',
    avatar: 'https://ui-avatars.com/api/?name=Maria+Gomez&background=random',
    xp: 2200,
    level: 10,
    streak: 25,
    completedQuizzes: 45,
    correctAnswers: 320,
    isCurrent: false,
  },
  {
    rank: 2,
    userId: 'user-1',
    username: 'Admin',
    avatar: 'https://ui-avatars.com/api/?name=Admin&background=random',
    xp: 1500,
    level: 8,
    streak: 12,
    completedQuizzes: 25,
    correctAnswers: 180,
    isCurrent: false,
  },
  {
    rank: 3,
    userId: 'user-2',
    username: 'JuanPerez',
    avatar: 'https://ui-avatars.com/api/?name=Juan+Perez&background=random',
    xp: 850,
    level: 5,
    streak: 7,
    completedQuizzes: 15,
    correctAnswers: 95,
    isCurrent: false,
  },
];

export const useLeaderboardStore = create<{
  entries: LeaderboardEntry[];
  currentRank: number | null;
  loading: boolean;
  loadLeaderboard: () => Promise<void>;
  updateCurrentPosition: (userId: string) => void;
}>((set) => ({
  entries: MOCK_LEADERBOARD,
  currentRank: null,
  loading: true,
  loadLeaderboard: async () => {
    set({ loading: true });
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    set({ 
      entries: MOCK_LEADERBOARD, 
      loading: false 
    });
  },
  updateCurrentPosition: (userId: string) => {
    const entry = MOCK_LEADERBOARD.find(u => u.userId === userId);
    if (entry) {
      set({ currentRank: entry.rank });
    } else {
      // Add current user to leaderboard if not present
      const rank = MOCK_LEADERBOARD.length + 1;
      set({ 
        currentRank: rank,
        entries: [...MOCK_LEADERBOARD, {
          rank,
          userId,
          username: 'Tu Usuario',
          avatar: 'https://ui-avatars.com/api/?name=Tu+Usuario&background=random',
          xp: 500,
          level: 3,
          streak: 3,
          completedQuizzes: 8,
          correctAnswers: 40,
          isCurrent: true,
        }],
      });
    }
  },
}));