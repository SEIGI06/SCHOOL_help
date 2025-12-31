'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';
import { FileText, Wand2, BookOpen, CheckCircle, BrainCircuit, PenSquare, Layers, Bot, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import QuizView from '@/components/QuizView';
import FlashcardView from '@/components/FlashcardView';
import ChatInterface from '@/components/ChatInterface';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function CoursePage() {
    const params = useParams();
    const id = params?.id as string;
    const supabase = createClient();

    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    
    // Tab State
    const [tab, setTab] = useState<'content' | 'explain' | 'quiz' | 'flashcards' | 'chat'>('content');

    // Feature States
    const [explanation, setExplanation] = useState('');
    const [loadingExplain, setLoadingExplain] = useState(false);
    
    const [quiz, setQuiz] = useState<any>(null);
    const [generatingQuiz, setGeneratingQuiz] = useState(false);

    const [flashcards, setFlashcards] = useState<any[]>([]);
    const [loadingFlashcards, setLoadingFlashcards] = useState(false);
    const [generatingFlashcards, setGeneratingFlashcards] = useState(false);

    useEffect(() => {
        async function fetchCourse() {
            const { data } = await supabase.from('courses').select('*').eq('id', id).single();
            setCourse(data);
            if (data) {
                if (data.simplified_content) setExplanation(data.simplified_content);
                fetchQuiz(data.id);
                fetchFlashcards(data.id);
            }
            setLoading(false);
        }
        if (id) fetchCourse();
    }, [id]);

    async function fetchQuiz(courseId: string) {
        const { data } = await supabase.from('quizzes').select('*').eq('course_id', courseId).order('created_at', { ascending: false }).limit(1).single();
        if (data) setQuiz(data);
    }

    async function fetchFlashcards(courseId: string) {
        const { data } = await supabase.from('flashcards').select('*').eq('course_id', courseId);
        if (data) setFlashcards(data);
    }

    const handleGenerateQuiz = async () => {
        setGeneratingQuiz(true);
        // Ensure tab switch feels responsive
        setTab('quiz'); 
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch('/api/generate-quiz', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ courseId: id, content: course.content_text })
            });
            const data = await res.json();
            if (data.quiz) setQuiz(data.quiz);
        } catch (e) {
            alert('Erreur génération quiz');
        } finally {
            setGeneratingQuiz(false);
        }
    };

    const handleGenerateFlashcards = async () => {
        setGeneratingFlashcards(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch('/api/generate-flashcards', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ courseId: id, content: course.content_text })
            });
            const data = await res.json();
            if (data.success) {
                await fetchFlashcards(id);
            }
        } catch (e) {
            alert('Erreur génération flashcards');
        } finally {
            setGeneratingFlashcards(false);
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

    if (loading) return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>;
    if (!course) return <div className="p-8 text-center text-gray-500">Cours introuvable</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                     <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 mb-2 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Retour
                    </Link>
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium text-sm uppercase tracking-wide">
                        <BookOpen className="w-4 h-4" />
                        {course.matiere}
                    </div>
                    <h1 className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">{course.chapitre}</h1>
                </div>
                <div className="flex gap-2">
                    <Link
                        href={`/dashboard/course/${id}/edit`}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                    >
                        <PenSquare className="h-4 w-4" />
                        Modifier
                    </Link>
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

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200 dark:border-neutral-800 overflow-x-auto no-scrollbar">
                {[
                    { id: 'content', label: 'Cours Original', icon: FileText },
                    { id: 'explain', label: 'Résumé Simplifié', icon: BrainCircuit },
                    { id: 'flashcards', label: 'Flashcards', icon: Layers }, 
                    { id: 'quiz', label: 'Quiz QCM', icon: CheckCircle },
                    { id: 'chat', label: 'Assistant IA', icon: Bot },
                ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setTab(item.id as any)}
                        className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                            tab === item.id
                                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                {tab === 'content' && (
                    <div className="bg-white dark:bg-neutral-900 p-8 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm animate-in fade-in">
                        <ReactMarkdown 
                            className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200"
                            remarkPlugins={[remarkGfm]}
                            components={{
                                img: ({node, ...props}) => <img {...props} className="rounded-lg max-w-full h-auto my-4 border border-gray-100 dark:border-neutral-800" />
                            }}
                        >
                            {course.content_text}
                        </ReactMarkdown>
                    </div>
                )}

                {tab === 'explain' && (
                    <div className="bg-white dark:bg-neutral-900 p-8 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm animate-in fade-in">
                        {loadingExplain ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-500 gap-4">
                                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                                <p>L'IA analyse le cours pour le simplifier...</p>
                            </div>
                        ) : explanation ? (
                            <ReactMarkdown className="prose dark:prose-invert max-w-none">
                                {explanation}
                            </ReactMarkdown>
                        ) : (
                            <div className="text-center py-12">
                                <BrainCircuit className="w-12 h-12 text-indigo-200 mx-auto mb-4" />
                                <p className="text-gray-500 mb-4">Obtenez une version simplifiée et résumée de ce cours.</p>
                                <button onClick={handleSimplify} className="text-indigo-600 font-medium hover:underline">Générer le résumé</button>
                            </div>
                        )}
                    </div>
                )}

                {tab === 'flashcards' && (
                    <div className="space-y-6 animate-in fade-in">
                        {flashcards.length > 0 ? (
                            <FlashcardView flashcards={flashcards} />
                        ) : (
                             <div className="text-center py-20 bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800">
                                <Layers className="w-12 h-12 text-indigo-200 mx-auto mb-4" />
                                <h3 className="text-lg font-medium mb-2">Aucune Flashcard</h3>
                                <p className="text-gray-500 mb-6 max-w-md mx-auto">L'IA peut générer des cartes de révision pour vous aider à mémoriser les points clés.</p>
                                <button
                                    onClick={handleGenerateFlashcards}
                                    disabled={generatingFlashcards}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 mx-auto"
                                >
                                    {generatingFlashcards ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                                    {generatingFlashcards ? 'Génération...' : 'Générer les Flashcards'}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {tab === 'quiz' && (
                    <div className="bg-white dark:bg-neutral-900 p-8 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm animate-in fade-in">
                        {generatingQuiz ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-500 gap-4">
                                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                                <p>Création d'un QCM sur mesure...</p>
                            </div>
                        ) : quiz ? (
                            <QuizView quizData={quiz.data} courseId={id} />
                        ) : (
                            <div className="text-center py-12">
                                <CheckCircle className="w-12 h-12 text-indigo-200 mx-auto mb-4" />
                                <p className="text-gray-500 mb-4">Aucun quiz disponible pour le moment.</p>
                                <button onClick={handleGenerateQuiz} className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-80">Générer un Quiz</button>
                            </div>
                        )}
                    </div>
                )}

                {tab === 'chat' && (
                    <div className="animate-in fade-in">
                        <ChatInterface courseContent={course.content_text} />
                    </div>
                )}
            </div>
        </div>
    );
}
