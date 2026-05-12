import { Deck, QuizAttempt } from './types';

export const MOCK_DECKS: Deck[] = [
  {
    id: 'deck-1',
    name: 'Neuroanatomy Basics',
    subject: 'Biology',
    cards: [
      { id: 'c1', question: 'What is the primary function of the occipital lobe?', answer: 'Visual processing', rating: 'medium' },
      { id: 'c2', question: 'Which part of the brain controls balance and coordination?', answer: 'Cerebellum', rating: 'easy' },
      { id: 'c3', question: 'The "Amgydala" is primarily involved in which process?', answer: 'Emotional processing and fear', rating: 'hard' },
      { id: 'c4', question: 'What is the largest part of the human brain?', answer: 'Cerebrum', rating: 'easy' },
      { id: 'c5', question: 'Which neurotransmitter is primarily associated with reward and pleasure?', answer: 'Dopamine', rating: 'medium' }
    ]
  },
  {
    id: 'deck-2',
    name: 'Macroeconomics 101',
    subject: 'Economics',
    cards: [
      { id: 'c6', question: 'What does GDP stand for?', answer: 'Gross Domestic Product', rating: 'easy' },
      { id: 'c7', question: 'What is the term for a general increase in prices?', answer: 'Inflation', rating: 'easy' },
      { id: 'c8', question: 'Who is often called the father of modern economics?', answer: 'Adam Smith', rating: 'medium' },
      { id: 'c9', question: 'What is the point where supply and demand curves intersect called?', answer: 'Equilibrium', rating: 'easy' }
    ]
  }
];

export const MOCK_HISTORY: QuizAttempt[] = [
  {
    id: 'q-1',
    deckId: 'deck-1',
    deckName: 'Neuroanatomy Basics',
    score: 4,
    total: 5,
    percentage: 80,
    date: new Date(Date.now() - 86400000).toISOString(),
    timeTaken: 120,
    breakdown: { correct: 4, wrong: 1, skipped: 0 },
    details: [] // Simplified for mock
  }
];
