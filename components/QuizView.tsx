'use client';

import { useState } from 'react';
import { Check, X, ArrowRight, RotateCcw } from 'lucide-react';

type Question = {
    question: string;
    choices: string[];
    correctIndex: number;
    explanation: string;
};

export default function QuizView({ quizData, courseId }: { quizData: Question[], courseId: string }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);

    const currentQuestion = quizData[currentIndex];

    const handleSelect = (index: number) => {
        if (isSubmitted) return;
        setSelectedAnswer(index);
    };

    const handleSubmit = () => {
        setIsSubmitted(true);
        if (selectedAnswer === currentQuestion.correctIndex) {
            setScore(s => s + 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < quizData.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setIsSubmitted(false);
        } else {
            setShowResults(true);
            // Here we could save the score to the DB 'performances' table
        }
    };

    if (showResults) {
        return (
            <div className="bg-white dark:bg-neutral-900 p-8 rounded-xl border border-gray-200 dark:border-neutral-800 text-center space-y-6">
                <h3 className="text-2xl font-bold">Quiz Terminé !</h3>
                <div className="text-5xl font-black text-indigo-600">
                    {score} / {quizData.length}
                </div>
                <p className="text-gray-500">
                    {score === quizData.length ? "Excellent travail ! 🌟" : "Beaucoup mieux la prochaine fois !"}
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
                >
                    <RotateCcw className="h-4 w-4" /> Recommencer
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Question {currentIndex + 1} / {quizData.length}</span>
                <span>Score: {score}</span>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white leading-relaxed">
                    {currentQuestion.question}
                </h3>

                <div className="space-y-3">
                    {currentQuestion.choices.map((choice, idx) => {
                        let style = "border-gray-200 dark:border-neutral-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-gray-50 dark:hover:bg-neutral-800";

                        if (isSubmitted) {
                            if (idx === currentQuestion.correctIndex) {
                                style = "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300";
                            } else if (idx === selectedAnswer) {
                                style = "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300";
                            }
                        } else if (selectedAnswer === idx) {
                            style = "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-600";
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => handleSelect(idx)}
                                disabled={isSubmitted}
                                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${style}`}
                            >
                                <div className="flex items-center justify-between">
                                    <span>{choice}</span>
                                    {isSubmitted && idx === currentQuestion.correctIndex && <Check className="h-5 w-5 text-green-600" />}
                                    {isSubmitted && idx === selectedAnswer && idx !== currentQuestion.correctIndex && <X className="h-5 w-5 text-red-600" />}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {isSubmitted && (
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-lg text-sm">
                        <span className="font-bold">Explication :</span> {currentQuestion.explanation}
                    </div>
                )}

                <div className="pt-4 flex justify-end">
                    {!isSubmitted ? (
                        <button
                            onClick={handleSubmit}
                            disabled={selectedAnswer === null}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 font-medium"
                        >
                            Valider
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-80 font-medium inline-flex items-center gap-2"
                        >
                            {currentIndex === quizData.length - 1 ? 'Voir résultats' : 'Suivant'} <ArrowRight className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
