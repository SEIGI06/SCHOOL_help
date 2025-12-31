'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';
import { Save, Image as ImageIcon, Loader2, type LucideIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface CourseEditorProps {
    initialData?: {
        id?: string;
        matiere: string;
        chapitre: string;
        content_text: string;
    };
    onSave?: () => void; // Optional callback
}

export default function CourseEditor({ initialData, onSave }: CourseEditorProps) {
    const [matiere, setMatiere] = useState(initialData?.matiere || '');
    const [chapitre, setChapitre] = useState(initialData?.chapitre || '');
    const [content, setContent] = useState(initialData?.content_text || '');
    
    const [saving, setSaving] = useState(false);
    const [uploadingImg, setUploadingImg] = useState(false);
    const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
    
    const router = useRouter();
    const supabase = createClient();

    const handleSave = async () => {
        if (!matiere || !chapitre) {
            alert('Veuillez remplir la matière et le chapitre.');
            return;
        }
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Non connecté');

            if (initialData?.id) {
                // UPDATE existing course
                const { error } = await supabase
                    .from('courses')
                    .update({
                        matiere,
                        chapitre,
                        content_text: content,
                    })
                    .eq('id', initialData.id);
                if (error) throw error;
                // Redirect back to course page
                router.push(`/dashboard/course/${initialData.id}`);
            } else {
                // CREATE new course
                const { error } = await supabase.from('courses').insert({
                    user_id: user.id,
                    matiere,
                    chapitre,
                    content_text: content,
                    file_url: null,
                });
                if (error) throw error;
                router.push('/dashboard');
            }

            if (onSave) onSave();
            router.refresh();
        } catch (e: any) {
            alert('Erreur: ' + e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        setUploadingImg(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload-image', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (data.url) {
                const imageMarkdown = `\n![${file.name}](${data.url})\n`;
                setContent(prev => prev + imageMarkdown);
            } else {
                alert('Erreur upload: ' + data.error);
            }
        } catch (e) {
            alert('Erreur upload image');
        } finally {
            setUploadingImg(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium mb-2">Matière</label>
                    <input
                        value={matiere}
                        onChange={e => setMatiere(e.target.value)}
                        className="w-full border rounded-lg p-2 dark:bg-neutral-900 dark:border-neutral-700"
                        placeholder="Ex: Histoire-Géo"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Titre du chapitre</label>
                    <input
                        value={chapitre}
                        onChange={e => setChapitre(e.target.value)}
                        className="w-full border rounded-lg p-2 dark:bg-neutral-900 dark:border-neutral-700"
                        placeholder="Ex: La Guerre Froide"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-neutral-800 mb-4">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('write')}
                            className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'write' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500'}`}
                        >
                            Écrire
                        </button>
                        <button
                            onClick={() => setActiveTab('preview')}
                            className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'preview' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500'}`}
                        >
                            Aperçu
                        </button>
                    </div>

                    {activeTab === 'write' && (
                        <div className="relative bottom-1">
                            <input
                                type="file"
                                id="editor-img-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={uploadingImg}
                            />
                            <label
                                htmlFor="editor-img-upload"
                                className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-md cursor-pointer bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors ${uploadingImg ? 'opacity-50 cursor-wait' : ''}`}
                            >
                                {uploadingImg ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                                Insérer une image
                            </label>
                        </div>
                    )}
                </div>

                {activeTab === 'write' ? (
                    <>
                        <textarea
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            className="w-full h-[500px] p-4 font-mono text-sm border rounded-xl dark:bg-neutral-900 dark:border-neutral-700 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                            placeholder="# Mon Cours...&#10;&#10;Commencez à écrire ici. Vous pouvez utiliser du Markdown."
                        />
                         <p className="text-xs text-gray-500">
                           Supporte les titres (#), gras (**text**), italique (*text*), listes (- item) et plus.
                        </p>
                    </>
                ) : (
                    <div className="w-full h-[500px] overflow-y-auto p-8 border rounded-xl dark:border-neutral-700 bg-white dark:bg-neutral-900">
                        <ReactMarkdown
                            className="prose dark:prose-invert max-w-none"
                            remarkPlugins={[remarkGfm]}
                            components={{
                                img: ({ node, ...props }) => <img {...props} className="rounded-lg max-w-full h-auto my-4 border border-gray-100 dark:border-neutral-800" />
                            }}
                        >
                            {content || '*Aucun contenu à afficher*'}
                        </ReactMarkdown>
                    </div>
                )}
            </div>

            <div className="flex justify-end pt-4">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium disabled:opacity-50"
                >
                    {saving ? 'Enregistrement...' : <><Save className="h-5 w-5" /> {initialData?.id ? 'Mettre à jour' : 'Enregistrer le cours'}</>}
                </button>
            </div>
        </div>
    );
}
