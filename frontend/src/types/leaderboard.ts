export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar?: string;
  xp: number;
  level: number;
  completedQuizzes: number;
  streak: number;
  correctAnswers: number;
  isCurrent?: boolean;
}

export interface LeaderboardState {
  entries: LeaderboardEntry[];
  userRank?: number;
  isLoading: boolean;
  error: string | null;
}
