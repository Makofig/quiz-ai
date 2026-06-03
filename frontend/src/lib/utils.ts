export function getQuestionType(type: string, difficulty: string): string {
  const typeLabel = {
    theoretical: 'teórico',
    practical: 'práctico',
    mixed: 'mixto',
  }[type] || 'mixto';

  const difficultyLabel = {
    easy: 'fácil',
    medium: 'medio',
    hard: 'difícil',
  }[difficulty] || 'medio';

  return `Quiz ${typeLabel} con dificultad ${difficultyLabel}`;
}

export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-green-400';
  if (score >= 70) return 'text-yellow-400';
  return 'text-red-400';
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
