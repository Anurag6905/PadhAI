import { motion } from 'motion/react';
import { BookOpen, Plus, Search } from 'lucide-react';
import { Deck } from './types';

interface FlashcardsViewProps {
  decks: Deck[];
}

export default function FlashcardsView({ decks }: FlashcardsViewProps) {
  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h2 className="text-3xl font-extrabold flex items-center gap-3">
          <BookOpen className="text-primary" /> My Flashcards
        </h2>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search decks..." 
              className="bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:border-primary outline-none transition-all w-full md:w-64"
            />
          </div>
          <button className="bg-primary p-3 rounded-xl hover:scale-105 active:scale-95 transition-all text-white font-bold flex items-center gap-2">
            <Plus size={20} /> <span className="hidden md:inline">New Deck</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {decks.map(deck => (
          <motion.div 
            key={deck.id}
            whileHover={{ y: -5 }}
            className="glass p-8 rounded-[32px] space-y-6 group cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
            
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
                <BookOpen size={24} />
              </div>
              <span className="text-slate-500 text-sm font-bold uppercase tracking-widest">{deck.subject}</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">{deck.name}</h3>
              <p className="text-slate-400 font-medium">{deck.cards.length} cards in this deck</p>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-[#1A1A2E] flex items-center justify-center text-[10px] font-bold">
                    {i}
                  </div>
                ))}
              </div>
              <button className="text-primary font-bold text-sm hover:underline">View Cards →</button>
            </div>
          </motion.div>
        ))}

        {/* Empty State / Create New */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="border-2 border-dashed border-white/10 rounded-[32px] p-8 flex flex-col items-center justify-center space-y-4 hover:border-primary/50 transition-colors cursor-pointer group"
        >
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
            <Plus size={32} />
          </div>
          <p className="text-slate-500 font-bold">Create New Deck</p>
        </motion.div>
      </div>
    </div>
  );
}
