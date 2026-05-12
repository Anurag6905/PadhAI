import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  ChevronLeft, 
  Clock, 
  Trophy, 
  RotateCcw, 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  Timer,
  ChevronRight,
  TrendingUp,
  History as HistoryIcon,
  Play
} from 'lucide-react';
import { Deck, Flashcard, QuizAttempt, QuizQuestionReview } from './types';

interface QuizModeProps {
  decks: Deck[];
  history: QuizAttempt[];
  onFinish: (attempt: QuizAttempt) => void;
  onSwitchToFlashcards: () => void;
}

type QuizStep = 'home' | 'config' | 'active' | 'results';

export default function QuizMode({ decks, history, onFinish, onSwitchToFlashcards }: QuizModeProps) {
  const [step, setStep] = useState<QuizStep>('home');
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  
  // Config state
  const [config, setConfig] = useState({
    numQuestions: 10,
    timePerQuestion: 30, // seconds
    difficulty: 'all' as 'all' | 'hard' | 'medium-hard',
    shuffle: true,
    instantFeedback: true
  });

  // Active quiz state
  const [questions, setQuestions] = useState<{ card: Flashcard; options: string[] }[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);
  const [timesSpent, setTimesSpent] = useState<number[]>([]);
  const [timer, setTimer] = useState(30);
  const [isPaused, setIsPaused] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState(0);

  // Results state
  const [finalAttempt, setFinalAttempt] = useState<QuizAttempt | null>(null);

  // --- Handlers ---

  const handleSelectDeck = (deck: Deck) => {
    setSelectedDeck(deck);
    setConfig(prev => ({
      ...prev,
      numQuestions: Math.min(10, deck.cards.length)
    }));
    setStep('config');
  };

  const startQuiz = () => {
    if (!selectedDeck) return;

    let filteredCards = [...selectedDeck.cards];
    if (config.difficulty === 'hard') {
      filteredCards = filteredCards.filter(c => c.rating === 'hard');
    } else if (config.difficulty === 'medium-hard') {
      filteredCards = filteredCards.filter(c => c.rating !== 'easy');
    }

    if (config.shuffle) {
      filteredCards.sort(() => Math.random() - 0.5);
    }

    const selectedCards = filteredCards.slice(0, config.numQuestions);
    
    // Generate questions with distractors
    const quizQuestions = selectedCards.map(card => {
      const distractors = getDistractors(card.answer, selectedDeck.cards);
      const options = [card.answer, ...distractors].sort(() => Math.random() - 0.5);
      return { card, options };
    });

    setQuestions(quizQuestions);
    setCurrentIdx(0);
    setUserAnswers(new Array(quizQuestions.length).fill(null));
    setTimesSpent(new Array(quizQuestions.length).fill(0));
    setTimer(config.timePerQuestion === -1 ? 999 : config.timePerQuestion);
    setStep('active');
    setQuizStartTime(Date.now());
  };

  const handleAnswer = (answer: string | null) => {
    if (showFeedback) return;

    const newAnswers = [...userAnswers];
    newAnswers[currentIdx] = answer;
    setUserAnswers(newAnswers);

    if (config.instantFeedback) {
      setShowFeedback(true);
      setTimeout(() => {
        advanceQuestion();
      }, 1500);
    } else {
      advanceQuestion();
    }
  };

  const advanceQuestion = () => {
    setShowFeedback(false);
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setTimer(config.timePerQuestion === -1 ? 999 : config.timePerQuestion);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    if (!selectedDeck) return;
    
    const timeTaken = Math.floor((Date.now() - quizStartTime) / 1000);
    const details: QuizQuestionReview[] = questions.map((q, i) => ({
      question: q.card.question,
      correctAnswer: q.card.answer,
      userAnswer: userAnswers[i],
      isCorrect: userAnswers[i] === q.card.answer,
      timeSpent: timesSpent[i]
    }));

    const correctCount = details.filter(d => d.isCorrect).length;
    const skippedCount = details.filter(d => d.userAnswer === null).length;
    const wrongCount = details.length - correctCount - skippedCount;

    const attempt: QuizAttempt = {
      id: Math.random().toString(36).substr(2, 9),
      deckId: selectedDeck.id,
      deckName: selectedDeck.name,
      score: correctCount,
      total: questions.length,
      percentage: (correctCount / questions.length) * 100,
      date: new Date().toISOString(),
      timeTaken,
      breakdown: {
        correct: correctCount,
        wrong: wrongCount,
        skipped: skippedCount
      },
      details
    };

    setFinalAttempt(attempt);
    setStep('results');
    onFinish(attempt);
  };

  // --- Timer Effect ---
  useEffect(() => {
    if (step !== 'active' || isPaused || showFeedback) return;

    if (config.timePerQuestion === -1) return; // No timer

    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          handleAnswer(null); // Time out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step, isPaused, showFeedback, currentIdx]);

  // --- Helper: Distractor Generation ---
  const getDistractors = (correctAnswer: string, allCards: Flashcard[]) => {
    let others = allCards
      .filter(c => c.answer !== correctAnswer)
      .map(c => c.answer);
    
    if (others.length < 3) {
      return [
        correctAnswer + " (revised)",
        correctAnswer.split(' ').reverse().join(' '),
        "Technically incorrect version"
      ].slice(0, 3);
    }
    
    return others.sort(() => Math.random() - 0.5).slice(0, 3);
  };

  // --- Sub-components ---

  const renderHome = () => (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold flex items-center gap-3">
          <Brain className="text-primary" /> Quiz Mode
        </h2>
      </div>

      {decks.length === 0 ? (
        <div className="glass p-12 text-center rounded-3xl space-y-6">
          <div className="text-6xl text-slate-700">📭</div>
          <p className="text-xl text-slate-400 font-medium">Create some flashcard decks first!</p>
          <button 
            onClick={onSwitchToFlashcards}
            className="btn-hero"
          >
            Go to Flashcards
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map(deck => {
            const mastery = Math.round((deck.cards.filter(c => c.rating === 'easy').length / deck.cards.length) * 100) || 0;
            return (
              <motion.div 
                key={deck.id}
                whileHover={{ y: -5 }}
                className="glass p-6 rounded-3xl space-y-4 group cursor-pointer"
                onClick={() => handleSelectDeck(deck)}
              >
                <div className="flex justify-between items-start">
                  <span className="bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                    {deck.subject}
                  </span>
                  <span className="text-slate-500 text-sm font-medium">{deck.cards.length} cards</span>
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{deck.name}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-tighter">
                    <span>Mastery</span>
                    <span>{mastery}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${mastery}%` }}
                      className="h-full bg-primary"
                    />
                  </div>
                </div>
                <button className="w-full py-3 bg-white/5 hover:bg-primary text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                  <Play size={18} /> Start Quiz
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* History Section */}
      {history.length > 0 && (
        <div className="pt-12 border-t border-white/5 space-y-8">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <HistoryIcon className="text-accent" /> Past Quizzes
          </h3>
          <div className="space-y-4">
            {history.map(attempt => {
              const date = new Date(attempt.date).toLocaleDateString();
              const color = attempt.percentage >= 80 ? 'text-green-400' : attempt.percentage >= 50 ? 'text-yellow-400' : 'text-red-400';
              const bg = attempt.percentage >= 80 ? 'bg-green-400/10' : attempt.percentage >= 50 ? 'bg-yellow-400/10' : 'bg-red-400/10';
              
              return (
                <div key={attempt.id} className="glass p-4 rounded-2xl flex items-center justify-between border-l-4 border-l-primary hover:border-l-accent transition-all">
                  <div>
                    <h4 className="font-bold text-white">{attempt.deckName}</h4>
                    <p className="text-xs text-slate-500">{date} • {attempt.timeTaken}s taken</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-black text-white">{attempt.score}/{attempt.total}</div>
                      <div className={`text-xs font-bold px-2 py-0.5 rounded ${bg} ${color}`}>
                        {Math.round(attempt.percentage)}%
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-slate-700" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const renderConfig = () => (
    <div className="max-w-2xl mx-auto space-y-8">
      <button 
        onClick={() => setStep('home')}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <ChevronLeft size={20} /> Back to selection
      </button>

      <div className="glass p-10 rounded-3xl space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-gradient">{selectedDeck?.name}</h2>
          <p className="text-slate-400">Configure your quiz settings</p>
        </div>

        <div className="space-y-8">
          {/* Question Count */}
          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Number of Questions</label>
            <div className="flex gap-2">
              {Array.from(new Set([5, 10, 15, selectedDeck?.cards.length || 0]))
                .filter(n => n > 0)
                .sort((a, b) => a - b)
                .map(n => (
                  <button
                    key={n}
                    onClick={() => setConfig(prev => ({ ...prev, numQuestions: n }))}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${config.numQuestions === n ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                  >
                    {n === selectedDeck?.cards.length ? 'All' : n}
                  </button>
                ))}
            </div>
          </div>

          {/* Timer */}
          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Time per Question</label>
            <div className="flex gap-2">
              {[15, 30, 60, -1].map(s => (
                <button
                  key={s}
                  onClick={() => setConfig(prev => ({ ...prev, timePerQuestion: s }))}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all ${config.timePerQuestion === s ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                >
                  {s === -1 ? 'None' : `${s}s`}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Difficulty Filter</label>
            <div className="flex gap-2">
              {[
                { id: 'all', label: 'All' },
                { id: 'medium-hard', label: 'Medium +' },
                { id: 'hard', label: 'Hard Only' }
              ].map(d => (
                <button
                  key={d.id}
                  onClick={() => setConfig(prev => ({ ...prev, difficulty: d.id as any }))}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all ${config.difficulty === d.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setConfig(prev => ({ ...prev, shuffle: !prev.shuffle }))}
              className={`p-4 rounded-xl font-bold border-2 transition-all flex items-center justify-center gap-2 ${config.shuffle ? 'border-primary/50 bg-primary/5 text-white' : 'border-white/5 text-slate-500'}`}
            >
              Shuffle {config.shuffle ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={() => setConfig(prev => ({ ...prev, instantFeedback: !prev.instantFeedback }))}
              className={`p-4 rounded-xl font-bold border-2 transition-all flex items-center justify-center gap-2 ${config.instantFeedback ? 'border-primary/50 bg-primary/5 text-white' : 'border-white/5 text-slate-500'}`}
            >
              Feedback {config.instantFeedback ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        <button 
          onClick={startQuiz}
          className="btn-hero w-full py-5 text-xl"
        >
          Start Quiz
        </button>
      </div>
    </div>
  );

  const renderActive = () => {
    const question = questions[currentIdx];
    if (!question) return null;

    const progress = ((currentIdx + 1) / questions.length) * 100;
    const timerPerc = (timer / config.timePerQuestion) * 100;

    return (
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4">
          <div className="space-y-1">
            <div className="text-sm font-black text-slate-500 uppercase tracking-widest">Question</div>
            <div className="text-2xl font-black">{currentIdx + 1} <span className="text-slate-600">/ {questions.length}</span></div>
          </div>

          {/* Timer Circle */}
          {config.timePerQuestion !== -1 && (
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                <motion.circle 
                  cx="40" cy="40" r="34" fill="none" stroke="#6C5CE7" strokeWidth="6"
                  strokeDasharray="213.6"
                  animate={{ strokeDashoffset: 213.6 - (213.6 * timerPerc) / 100 }}
                  transition={{ duration: 1, ease: "linear" }}
                />
              </svg>
              <span className={`absolute text-xl font-black ${timer < 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                {timer}
              </span>
            </div>
          )}

          <div className="space-y-1 text-right">
            <div className="text-sm font-black text-slate-500 uppercase tracking-widest">Score</div>
            <div className="text-2xl font-black text-accent">{userAnswers.filter((a, i) => i < currentIdx && a === questions[i].card.answer).length} <span className="text-slate-600">points</span></div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-primary"
          />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass p-12 rounded-[40px] shadow-2xl relative"
          >
            <h3 className="text-3xl md:text-4xl font-extrabold text-center leading-tight mb-12">
              {question.card.question}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {question.options.map((opt, i) => {
                const isSelected = userAnswers[currentIdx] === opt;
                const isCorrect = opt === question.card.answer;
                
                let btnClass = "border-2 border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20";
                if (showFeedback) {
                  if (isCorrect) btnClass = "border-green-500/50 bg-green-500/20 text-green-400";
                  else if (isSelected) btnClass = "border-red-500/50 bg-red-500/20 text-red-400";
                  else btnClass = "opacity-50 grayscale border-white/5";
                }

                return (
                  <button
                    key={i}
                    disabled={showFeedback}
                    onClick={() => handleAnswer(opt)}
                    className={`p-6 rounded-2xl text-left font-bold text-lg transition-all flex items-center gap-4 ${btnClass}`}
                  >
                    <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm">
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                    {showFeedback && isCorrect && <CheckCircle2 className="ml-auto text-green-400" />}
                    {showFeedback && isSelected && !isCorrect && <XCircle className="ml-auto text-red-400" />}
                  </button>
                );
              })}
            </div>

            {showFeedback && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 text-center"
              >
                {userAnswers[currentIdx] === question.card.answer ? (
                  <span className="text-green-400 font-black text-2xl uppercase tracking-widest italic animate-bounce inline-block">Correct!</span>
                ) : (
                  <div className="space-y-1">
                    <span className="text-red-400 font-black text-2xl uppercase tracking-widest italic block">Incorrect</span>
                    <span className="text-slate-500 font-medium">The answer was: {question.card.answer}</span>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-end px-4">
          <button 
            disabled={showFeedback}
            onClick={() => handleAnswer(null)}
            className="text-slate-500 hover:text-white font-bold flex items-center gap-1 transition-colors"
          >
            Skip Question <ChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  };

  const renderResults = () => {
    if (!finalAttempt) return null;

    const getGrade = (per: number) => {
      if (per >= 90) return { l: 'A', c: 'text-green-400', msg: "Outstanding! You've mastered this material." };
      if (per >= 70) return { l: 'B', c: 'text-blue-400', msg: "Solid work! Review the ones you missed and you'll ace it." };
      if (per >= 50) return { l: 'C', c: 'text-yellow-400', msg: "Getting there! Spend more time with research and try again." };
      if (per >= 30) return { l: 'D', c: 'text-orange-400', msg: "Keep practicing. Consistency is the key to mastery." };
      return { l: 'F', c: 'text-red-400', msg: "No worries. Every expert was once a beginner. Hit the flashcards!" };
    };

    const grade = getGrade(finalAttempt.percentage);

    return (
      <div className="max-w-4xl mx-auto space-y-12 pb-20">
        <div className="text-center space-y-6">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`w-32 h-32 rounded-full border-4 border-current flex items-center justify-center mx-auto text-6xl font-black ${grade.c}`}
          >
            {grade.l}
          </motion.div>
          <h2 className="text-5xl font-extrabold text-gradient">{finalAttempt.score} / {finalAttempt.total}</h2>
          <p className="text-xl text-slate-400 font-medium max-w-lg mx-auto leading-relaxed">
            {grade.msg}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass p-8 rounded-3xl text-center space-y-4">
            <div className="text-green-400 font-black text-4xl">{finalAttempt.breakdown.correct}</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Correct</div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-green-400" style={{ width: `${(finalAttempt.breakdown.correct / finalAttempt.total) * 100}%` }} />
            </div>
          </div>
          <div className="glass p-8 rounded-3xl text-center space-y-4">
            <div className="text-red-400 font-black text-4xl">{finalAttempt.breakdown.wrong}</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Wrong</div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-red-400" style={{ width: `${(finalAttempt.breakdown.wrong / finalAttempt.total) * 100}%` }} />
            </div>
          </div>
          <div className="glass p-8 rounded-3xl text-center space-y-4">
            <div className="text-slate-400 font-black text-4xl">{finalAttempt.breakdown.skipped}</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Skipped</div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-slate-400" style={{ width: `${(finalAttempt.breakdown.skipped / finalAttempt.total) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Detailed Review */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold">Review Answers</h3>
          <div className="space-y-4">
            {finalAttempt.details.map((detail, i) => (
              <div key={i} className="glass p-6 rounded-2xl space-y-4 border-l-4 border-l-white/10">
                <div className="flex justify-between items-start gap-4">
                  <h4 className="font-bold text-lg leading-snug">{detail.question}</h4>
                  {detail.isCorrect ? (
                    <CheckCircle2 className="text-green-400 shrink-0" />
                  ) : detail.userAnswer === null ? (
                    <Clock className="text-slate-500 shrink-0" />
                  ) : (
                    <XCircle className="text-red-400 shrink-0" />
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-medium">
                  <div className="space-y-1">
                    <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Your Answer</span>
                    <div className={detail.isCorrect ? 'text-green-400' : 'text-red-400'}>
                      {detail.userAnswer || 'Skipped / Timed out'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Correct Answer</span>
                    <div className="text-white">
                      {detail.correctAnswer}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col md:flex-row gap-4">
          <button 
            onClick={startQuiz}
            className="btn-hero flex-1 flex items-center justify-center gap-2"
          >
            <RotateCcw size={20} /> Retake This Quiz
          </button>
          <button 
            onClick={() => setStep('home')}
            className="btn-outline-hero flex-1 flex items-center justify-center gap-2"
          >
            <TrendingUp size={20} /> Back to Quiz Home
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {step === 'home' && renderHome()}
          {step === 'config' && renderConfig()}
          {step === 'active' && renderActive()}
          {step === 'results' && renderResults()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
