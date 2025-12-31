'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';
import { FileText, Wand2, BookOpen, CheckCircle, BrainCircuit } from 'lucide-react';
import QuizView from '@/components/QuizView';

export default function CoursePage() {
    const params = useParams();
    const id = params?.id as string;
    const supabase = createClient();

    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'content' | 'quiz' | 'explain'>('content');
    const [explanation, setExplanation] = useState('');
    const [loadingExplain, setLoadingExplain] = useState(false);
    const [quiz, setQuiz] = useState<any>(null);
    const [generatingQuiz, setGeneratingQuiz] = useState(false);

    useEffect(() => {
        async function fetchCourse() {
            const { data } = await supabase.from('courses').select('*').eq('id', id).single();
            setCourse(data);
            if (data) fetchQuiz(data.id);
            setLoading(false);
        }
        fetchCourse();
    }, [id]);

    async function fetchQuiz(courseId: string) {
        const { data } = await supabase.from('quizzes').select('*').eq('course_id', courseId).order('created_at', { ascending: false }).limit(1).single();
        if (data) setQuiz(data);
    }

    const handleGenerateQuiz = async () => {
        setGeneratingQuiz(true);
        setTab('quiz');
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch('/api/generate-quiz', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ courseId: id })
            });
            const data = await res.json();
            if (data.quiz) setQuiz(data.quiz);
        } catch (e) {
            alert('Erreur génération quiz');
        } finally {
            setGeneratingQuiz(false);
        }
    };

    const handleSimplify = async () => {
        setLoadingExplain(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch('/api/simplify-course', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ courseId: id })
            });
            const data = await res.json();
            if (data.content) setExplanation(data.content);
        } catch (e) {
            alert('Erreur simplification');
        } finally {
            setLoadingExplain(false);
        }
    };

    if (loading) return <div className="p-8">Chargement...</div>;
    if (!course) return <div className="p-8">Cours introuvable</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{course.matiere}</span>
                    <h1 className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">{course.chapitre}</h1>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => { setTab('explain'); if (!explanation) handleSimplify(); }}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                        <BrainCircuit className="h-4 w-4" />
                        Simplifier
                    </button>
                    <button
                        onClick={handleGenerateQuiz}
                        className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-80 transition-opacity"
                    >
                        <Wand2 className="h-4 w-4" />
                        {quiz ? 'Nouveau Quiz' : 'Générer Quiz'}
                    </button>
                </div>
            </div>

            <div className="flex border-b border-gray-200 dark:border-neutral-800">
                <button
                    onClick={() => setTab('content')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${tab === 'content' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Cours Original
                </button>
                <button
                    onClick={() => setTab('explain')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${tab === 'explain' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Explication Simplifiée
                </button>
                <button
                    onClick={() => setTab('quiz')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${tab === 'quiz' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Quiz {quiz && '(1)'}
                </button>
            </div>

            <div className="min-h-[400px]">
                {tab === 'content' && (
                    <div className="prose dark:prose-invert max-w-none bg-white dark:bg-neutral-900 p-8 rounded-xl border border-gray-200 dark:border-neutral-800 whitespace-pre-wrap">
                        {course.content_text}
                    </div>
                )}

                {tab === 'explain' && (
                    <div className="bg-white dark:bg-neutral-900 p-8 rounded-xl border border-gray-200 dark:border-neutral-800">
                        {loadingExplain ? (
                            <div className="flex items-center gap-3 text-gray-500">
                                <BrainCircuit className="h-5 w-5 animate-pulse" />
                                L'IA reformule le cours pour toi...
                            </div>
                        ) : (
                            <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                                {explanation || "Cliquez sur 'Simplifier' pour obtenir une version reformulée."}
                            </div>
                        )}
                    </div>
                )}

                {tab === 'quiz' && (
                    <div className="">
                        {generatingQuiz ? (
                            <div className="p-12 text-center text-gray-500">
                                <Wand2 className="h-8 w-8 mx-auto mb-4 animate-spin text-indigo-500" />
                                Génération des questions en cours...
                            </div>
                        ) : quiz ? (
                            <QuizView quizData={quiz.data} courseId={id} />
                        ) : (
                            <div className="p-12 text-center border-2 border-dashed rounded-xl">
                                <p className="text-gray-500">Aucun quiz généré pour ce cours.</p>
                                <button onClick={handleGenerateQuiz} className="mt-4 text-indigo-600 font-medium hover:underline">Générer maintenant</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
