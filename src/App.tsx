import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, X, BookOpen, Brain, Sparkles, LayoutDashboard, BrainCircuit, 
  ChevronRight, CheckCircle2, History, TrendingUp, Plus, Search, 
  Settings, LogOut, LayoutGrid, Zap
} from 'lucide-react';
import { MOCK_DECKS, MOCK_HISTORY } from './mockData';
import { Deck, QuizAttempt } from './types';
import QuizMode from './QuizMode';
import FlashcardsView from './FlashcardsView';

type AppView = 'landing' | 'dashboard' | 'flashcards' | 'quiz';

export default function App() {
  const [view, setView] = useState<AppView>('landing');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // App Data State
  const [decks, setDecks] = useState<Deck[]>(MOCK_DECKS);
  const [quizHistory, setQuizHistory] = useState<QuizAttempt[]>(MOCK_HISTORY);

  const launchApp = () => setView('dashboard');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Testimonials', href: '#testimonials' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A2E] via-[#1A1A2E] to-[#2D1B4D] selection:bg-primary/30 relative text-white">
      <div className="absolute top-[-100px] right-[-100px] w-96 h-96 bg-primary opacity-20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-100px] left-[-100px] w-96 h-96 bg-accent opacity-10 blur-[120px] rounded-full"></div>
      
      {view === 'landing' ? (
        <LandingPage 
          isScrolled={isScrolled} 
          isMenuOpen={isMenuOpen} 
          setIsMenuOpen={setIsMenuOpen} 
          onLaunch={launchApp}
        />
      ) : (
        <AppInterface 
          view={view} 
          setView={setView} 
          decks={decks} 
          quizHistory={quizHistory}
          onQuizFinish={(attempt) => setQuizHistory([attempt, ...quizHistory])}
        />
      )}
    </div>
  );
}

// --- APP INTERFACE COMPONENT ---

interface AppInterfaceProps {
  view: AppView;
  setView: (v: AppView) => void;
  decks: Deck[];
  quizHistory: QuizAttempt[];
  onQuizFinish: (a: QuizAttempt) => void;
}

function AppInterface({ view, setView, decks, quizHistory, onQuizFinish }: AppInterfaceProps) {
  return (
    <div className="flex h-screen overflow-hidden relative z-10">
      {/* Sidebar */}
      <aside className="w-20 md:w-64 bg-[#1A1A2E]/50 backdrop-blur-xl border-r border-white/5 flex flex-col items-center md:items-stretch py-8 px-4">
        {/* Logo */}
        <div className="flex items-center gap-2 text-xl font-extrabold tracking-tight mb-12 px-2 cursor-pointer" onClick={() => setView('dashboard')}>
          <span className="bg-primary p-1.5 rounded-lg text-sm flex items-center justify-center shrink-0">🎓</span>
          <span className="hidden md:inline">Padh<span className="text-primary">AI</span></span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-2 w-full">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'flashcards', icon: BookOpen, label: 'Flashcards' },
            { id: 'quiz', icon: Brain, label: 'Quiz Mode' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id as AppView)}
              className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all font-bold group ${view === item.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}
            >
              <item.icon size={20} className="shrink-0" />
              <span className="hidden md:inline">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="pt-8 border-t border-white/5 space-y-2 w-full">
           <button className="w-full flex items-center gap-4 p-3 rounded-xl text-slate-500 hover:text-white transition-all font-bold">
            <Settings size={20} className="shrink-0" />
            <span className="hidden md:inline">Settings</span>
           </button>
           <button className="w-full flex items-center gap-4 p-3 rounded-xl text-red-500/50 hover:text-red-500 transition-all font-bold">
            <LogOut size={20} className="shrink-0" />
            <span className="hidden md:inline">Logout</span>
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-12 selection:bg-primary/30">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {view === 'dashboard' && <DashboardView decks={decks} quizHistory={quizHistory} setView={setView} />}
            {view === 'flashcards' && <FlashcardsView decks={decks} />}
            {view === 'quiz' && (
              <QuizMode 
                decks={decks} 
                history={quizHistory} 
                onFinish={onQuizFinish}
                onSwitchToFlashcards={() => setView('flashcards')}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

// --- LANDING PAGE COMPONENT ---

function LandingPage({ isScrolled, isMenuOpen, setIsMenuOpen, onLaunch }: any) {
  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Testimonials', href: '#testimonials' },
  ];

  return (
    <>
      <nav 
        className={`h-20 fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-white/5 ${
          isScrolled ? 'bg-[#1A1A2E]/80 backdrop-blur-xl shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto h-full px-12 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2 text-2xl font-extrabold tracking-tight hover:scale-105 transition-transform cursor-pointer">
            <span className="bg-primary p-1.5 rounded-lg text-xl flex items-center justify-center">🎓</span>
            <span className="text-white">Padh<span className="text-primary">AI</span></span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10 text-sm font-medium text-slate-400">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href}
                className="hover:text-white transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="hidden md:block">
            <button onClick={onLaunch} className="btn-primary">Get Started</button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-secondary border-b border-white/10 overflow-hidden"
            >
              <div className="flex flex-col p-6 space-y-4">
                {navLinks.map((link) => (
                  <a 
                    key={link.name} 
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-lg text-gray-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                ))}
                <button className="btn-purple w-full py-4 text-lg">Get Started</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h1 className="text-[64px] font-extrabold leading-[1.05] tracking-tight text-gradient">
                Study smarter,<br />not harder.
              </h1>
              <p className="text-lg text-slate-400 max-w-[480px] leading-relaxed">
                AI-powered flashcards, mock tests, and a personal tutor that actually explains things. 
                Paste your notes, and <span className="text-white font-semibold">PadhAI</span> does the rest.
              </p>
            </div>
            <div className="flex items-center gap-5">
              <button onClick={onLaunch} className="btn-hero">Start Studying</button>
              <a href="#how-it-works" className="btn-outline-hero flex items-center justify-center">See How It Works</a>
            </div>
          </motion.div>

          {/* Animated Illustration */}
          <div className="relative flex justify-center items-center">
            <motion.div 
              animate={{ 
                y: [0, -20, 0],
                rotate: [0, 2, 0]
              }}
              transition={{ 
                duration: 5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="relative w-72 h-96 bg-primary/10 rounded-2xl border-2 border-primary/30 flex items-center justify-center transform perspective-1000 rotate-y-12"
            >
              {/* Floating Book Shell */}
              <div className="absolute inset-0 bg-primary/5 rounded-2xl border-l-[12px] border-primary/40 shadow-2xl"></div>
              
              {/* Brain Icon with Glow */}
              <motion.div 
                animate={{ 
                  scale: [1, 1.1, 1],
                  filter: ['drop-shadow(0 0 10px #00CEFF)', 'drop-shadow(0 0 25px #00CEFF)', 'drop-shadow(0 0 10px #00CEFF)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="z-10"
              >
                <div className="w-32 h-32 bg-accent/20 rounded-full flex items-center justify-center border border-accent/50">
                  <BrainCircuit size={64} className="text-accent" />
                </div>
              </motion.div>

              {/* Decorative elements */}
              <div className="absolute top-4 left-16 w-32 h-1 bg-white/20 rounded-full"></div>
              <div className="absolute top-8 left-16 w-16 h-1 bg-white/20 rounded-full"></div>
              <div className="absolute bottom-4 right-4 w-12 h-12 border-2 border-accent/30 rounded-full"></div>
            </motion.div>

            {/* Floating Particles */}
            {[...Array(5)].map((_, i) => (
              <motion.div 
                key={i}
                animate={{
                  y: [0, -100],
                  x: [0, (i - 2) * 20],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 2 + i,
                  repeat: Infinity,
                  delay: i * 0.5
                }}
                className="absolute w-2 h-2 bg-accent rounded-full blur-sm"
                style={{
                  top: '50%',
                  left: '50%'
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-32 relative px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-accent font-semibold tracking-widest uppercase text-sm block"
            >
              Powerful AI Tools
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Unleash your potential.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
              icon="🎓"
              iconBg="bg-purple-500/20"
              title="Smart Flashcards"
              description="Paste your notes, get instant flashcards. Flip, rate, and repeat for mastery."
              delay={0.1}
            />
            <FeatureCard 
              icon="📝"
              iconBg="bg-cyan-500/20"
              title="Mock Quizzes"
              description="AI generates MCQs from your material. Timed. Scored. No mercy."
              delay={0.2}
            />
            <FeatureCard 
              icon="🤖"
              iconBg="bg-indigo-500/20"
              title="AI Tutor Chat"
              description="Ask anything. Get explanations in plain language. Powered by Gemini."
              delay={0.3}
              highlight
            />
            <FeatureCard 
              icon="📊"
              iconBg="bg-green-500/20"
              title="Progress Dashboard"
              description="Track streaks, see weak areas, know exactly where you stand daily."
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-32 px-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 space-y-4">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gradient">Master it in 3 steps</h2>
            <p className="text-slate-400 font-medium">From raw notes to exam-ready in minutes.</p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-20 left-1/4 right-1/4 h-0.5 border-t-2 border-dashed border-primary/30 -z-10"></div>

            {[
              { step: '1', emoji: '📄', title: 'Paste Your Notes', desc: 'Paste text or upload PDFs of your study material directly into PadhAI.' },
              { step: '2', emoji: '✨', title: 'AI Creates Study Material', desc: 'Our engine extracts key concepts and generates flashcards automatically.' },
              { step: '3', emoji: '🏆', title: 'Revise and Ace It', desc: 'Test yourself with mock quizzes and hit your target score every time.' }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="text-center group"
              >
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-3xl mx-auto mb-8 shadow-2xl shadow-primary/40 group-hover:scale-110 transition-transform duration-300">
                  {item.emoji}
                </div>
                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed max-w-xs mx-auto">{item.desc}</p>
                <div className="mt-6 text-primary/50 font-black text-sm tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  STEP 0{item.step}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF SECTION */}
      <section id="testimonials" className="py-32 px-12 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Loved by students</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Priya', role: '2nd Year', quote: "Used PadhAI for my economics midterm. Made 50 flashcards in 2 minutes.", stars: 5 },
              { name: 'Arjun', role: 'Engineering', quote: "The AI tutor explained derivatives better than my professor. No cap.", stars: 5 },
              { name: 'Sneha', role: 'BBA', quote: "I went from C's to A's. The quiz feature forces you to actually test yourself.", stars: 4 }
            ].map((t, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="glass p-8 relative rounded-3xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex text-yellow-500 mb-4 scale-75 origin-left">
                    {[...Array(t.stars)].map((_, j) => <span key={j}>★</span>)}
                  </div>
                  <p className="text-lg italic text-slate-300 mb-8 leading-relaxed">"{t.quote}"</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {t.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{t.name}, {t.role}</h4>
                    <div className="flex items-center space-x-1 text-accent text-xs font-bold uppercase tracking-widest mt-1">
                      <Sparkles size={12} />
                      <span>Verified User</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-24 px-6 md:px-12">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto rounded-[40px] p-12 md:p-20 text-center relative overflow-hidden bg-gradient-to-r from-primary to-accent shadow-2xl shadow-primary/20"
        >
          {/* Decorative Circles */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
          
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Your next exam is closer<br />than you think.
            </h2>
            <p className="text-xl md:text-2xl text-white/80 font-medium max-w-2xl mx-auto">
              Start studying smarter today and join 10,000+ students acing their courses.
            </p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLaunch}
              className="bg-white text-primary px-12 py-5 rounded-2xl text-xl font-bold shadow-2xl shadow-black/20 hover:bg-slate-50 transition-colors"
            >
              Launch PadhAI
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="py-16 border-t border-white/5 relative bg-[#1A1A2E]">
        <div className="max-w-7xl mx-auto px-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left flex flex-col items-center md:items-start space-y-4">
            <div className="flex items-center gap-2 text-xl font-extrabold tracking-tight mb-2">
              <span className="bg-primary p-1 rounded-md text-sm">🎓</span>
              <span>PadhAI</span>
            </div>
            <p className="text-slate-500 font-medium">Built by Your Name</p>
          </div>

          <div className="flex gap-8 text-slate-400 font-semibold text-sm">
            <a href="#" className="hover:text-primary transition-colors">GitHub</a>
            <a href="#" className="hover:text-primary transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-primary transition-colors">Twitch</a>
          </div>

          <p className="text-slate-600 text-sm">
            © {new Date().getFullYear()} PadhAI. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}

// --- DASHBOARD VIEW COMPONENT ---

function DashboardView({ decks, quizHistory, setView }: { decks: Deck[]; quizHistory: QuizAttempt[]; setView: (v: any) => void }) {
  const stats = useMemo(() => {
    const totalQuizzes = quizHistory.length;
    const avgScore = quizHistory.length > 0 ? Math.round(quizHistory.reduce((acc, h) => acc + h.percentage, 0) / quizHistory.length) : 0;
    const totalCards = decks.reduce((acc, d) => acc + d.cards.length, 0);
    return { totalQuizzes, avgScore, totalCards };
  }, [decks, quizHistory]);

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-white">Welcome back, Scholar!</h2>
          <p className="text-slate-400 font-medium italic">"The beautiful thing about learning is that no one can take it away from you."</p>
        </div>
        <button onClick={() => setView('flashcards')} className="btn-hero px-6 py-3 flex items-center gap-2 text-sm">
          <Plus size={18} /> New Study Set
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Brain, label: 'Quizzes Taken', val: stats.totalQuizzes, color: 'text-primary', bg: 'bg-primary/10' },
          { icon: TrendingUp, label: 'Average Score', val: `${stats.avgScore}%`, color: 'text-accent', bg: 'bg-accent/10' },
          { icon: BookOpen, label: 'Total Cards', val: stats.totalCards, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        ].map((stat, i) => (
          <div key={i} className="glass p-6 rounded-3xl flex items-center gap-6">
            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
              <stat.icon size={28} />
            </div>
            <div>
              <div className="text-3xl font-black text-white">{stat.val}</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Recent Activity */}
        <section className="glass rounded-[32px] p-8 space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <History size={20} className="text-accent" /> Recent Activity
          </h3>
          <div className="space-y-4">
            {quizHistory.length > 0 ? quizHistory.slice(0, 3).map(quiz => (
               <div key={quiz.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-xs font-bold">Q</div>
                    <div>
                      <div className="font-bold text-white">{quiz.deckName}</div>
                      <div className="text-xs text-slate-500">{new Date(quiz.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-white">{quiz.score}/{quiz.total}</div>
                    <div className="text-[10px] font-bold text-accent uppercase tracking-widest">{Math.round(quiz.percentage)}%</div>
                  </div>
               </div>
            )) : (
              <p className="text-slate-500 italic text-center py-10">No quizzes taken yet. Time to test your knowledge!</p>
            )}
          </div>
          <button onClick={() => setView('quiz')} className="w-full py-3 text-slate-500 hover:text-white font-bold transition-all text-sm">View All Activity →</button>
        </section>

        {/* Quick Launch */}
        <section className="space-y-6">
           <h3 className="text-xl font-bold flex items-center gap-2">
            <Zap size={20} className="text-yellow-400" /> Quick Start
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setView('flashcards')}
              className="glass p-6 rounded-2xl text-center space-y-3 hover:border-primary/50 transition-all group"
            >
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <BookOpen />
              </div>
              <div className="font-bold">Review Cards</div>
            </button>
            <button 
              onClick={() => setView('quiz')}
              className="glass p-6 rounded-2xl text-center space-y-3 hover:border-accent/50 transition-all group"
            >
              <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Brain />
              </div>
              <div className="font-bold">Take Quiz</div>
            </button>
          </div>

          <div className="glass p-8 rounded-3xl bg-gradient-to-br from-primary/20 to-transparent border-primary/20">
            <h4 className="font-bold text-lg mb-2">Weekly Goal</h4>
            <div className="flex justify-between text-xs font-bold text-slate-500 mb-2 uppercase tracking-tighter">
              <span>Quizzes: {quizHistory.length} / 5</span>
              <span>{Math.min(100, (quizHistory.length / 5 * 100))}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
               <div className="h-full bg-primary" style={{ width: `${Math.min(100, (quizHistory.length / 5 * 100))}%` }} />
            </div>
            <p className="mt-4 text-xs text-slate-400 font-medium">Keep going! You're {5 - quizHistory.length} quizzes away from your weekly target.</p>
          </div>
        </section>
      </div>
    </div>
  );
}

// REST OF COMPONENTS (FeatureCard, etc.)

function FeatureCard({ icon, iconBg, title, description, delay, highlight }: { icon: string, iconBg: string, title: string, description: string, delay: number, highlight?: boolean }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -10, transition: { duration: 0.2 } }}
      className={`glass p-6 rounded-3xl space-y-4 hover:border-white/30 transition-all relative overflow-hidden ${highlight ? 'border-primary/40 ring-1 ring-primary/20' : ''}`}
    >
      <div className={`w-12 h-12 ${iconBg} rounded-2xl flex items-center justify-center text-2xl mb-2`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed font-medium">
        {description}
      </p>
      
      {/* Subtle Glow effect on hover */}
      <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-primary/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </motion.div>
  );
}
