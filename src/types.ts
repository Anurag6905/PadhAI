export type Rating = 'easy' | 'medium' | 'hard';

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  rating: Rating;
}

export interface Deck {
  id: string;
  name: string;
  subject: string;
  cards: Flashcard[];
}

export interface QuizQuestionReview {
  question: string;
  correctAnswer: string;
  userAnswer: string | null;
  isCorrect: boolean;
  timeSpent: number;
}

export interface QuizAttempt {
  id: string;
  deckId: string;
  deckName: string;
  score: number;
  total: number;
  percentage: number;
  date: string; // ISO string
  timeTaken: number; // in seconds
  breakdown: {
    correct: number;
    wrong: number;
    skipped: number;
  };
  details: QuizQuestionReview[];
}
