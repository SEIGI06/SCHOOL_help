'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCw, Sparkles, Brain } from 'lucide-react';

interface Flashcard {
    id: string;
    front: string;
    back: string;
}

interface FlashcardViewProps {
    flashcards: Flashcard[];
}

export default function FlashcardView({ flashcards }: FlashcardViewProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const currentCard = flashcards[currentIndex];

    const nextCard = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % flashcards.length);
        }, 150);
    };

    const prevCard = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
        }, 150);
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    if (!flashcards || flashcards.length === 0) {
        return <div className="p-8 text-center text-gray-500">Aucune flashcard disponible.</div>;
    }

    return (
        <div className="flex flex-col items-center gap-8 py-8">
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <Brain className="w-4 h-4" />
                <span>Carte {currentIndex + 1} / {flashcards.length}</span>
            </div>

            {/* Card Container */}
            <div 
                className="relative w-full max-w-2xl h-80 cursor-pointer perspective-1000 group"
                onClick={handleFlip}
            >
                <div className={`relative w-full h-full transition-all duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                    {/* Front */}
                    <div className="absolute inset-0 w-full h-full bg-white dark:bg-neutral-800 rounded-2xl shadow-xl border-2 border-indigo-100 dark:border-neutral-700 flex flex-col items-center justify-center p-8 backface-hidden">
                        <span className="absolute top-4 left-4 text-xs font-bold text-indigo-500 uppercase tracking-wider">Question</span>
                        <div className="text-xl md:text-2xl text-center font-medium text-gray-800 dark:text-gray-100">
                            {currentCard.front}
                        </div>
                        <div className="absolute bottom-4 text-gray-400 text-xs flex items-center gap-1">
                            <RotateCw className="w-3 h-3" /> Cliquer pour retourner
                        </div>
                    </div>

                    {/* Back */}
                    <div className="absolute inset-0 w-full h-full bg-indigo-600 dark:bg-indigo-900 rounded-2xl shadow-xl flex flex-col items-center justify-center p-8 backface-hidden rotate-y-180">
                        <span className="absolute top-4 left-4 text-xs font-bold text-white/70 uppercase tracking-wider">Réponse</span>
                        <div className="text-lg md:text-xl text-center text-white font-medium">
                            {currentCard.back}
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={(e) => { e.stopPropagation(); prevCard(); }}
                    className="p-4 rounded-full bg-white dark:bg-neutral-800 shadow-md hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors border border-gray-200 dark:border-neutral-700"
                >
                    <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); nextCard(); }}
                    className="p-4 rounded-full bg-indigo-600 shadow-md hover:bg-indigo-700 transition-colors text-white"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>
            
            <style jsx>{`
                .perspective-1000 { perspective: 1000px; }
                .transform-style-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
            `}</style>
        </div>
    );
}
