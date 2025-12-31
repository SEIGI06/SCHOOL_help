'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';
import { Save, Image as ImageIcon, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateCoursePage() {
    const [matiere, setMatiere] = useState('');
    const [chapitre, setChapitre] = useState('');
    const [content, setContent] = useState('');
    const [saving, setSaving] = useState(false);
    const [uploadingImg, setUploadingImg] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    // Create course manually
    const handleSave = async () => {
        if (!matiere || !chapitre) {
            alert('Veuillez remplir la matière et le chapitre.');
            return;
        }
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Non connecté');

            const { error } = await supabase.from('courses').insert({
                user_id: user.id,
                matiere,
                chapitre,
                content_text: content,
                file_url: null, // No source file, purely manual
            });

            if (error) throw error;
            router.push('/dashboard');
            router.refresh();
        } catch (e: any) {
            alert('Erreur: ' + e.message);
        } finally {
            setSaving(false);
        }
    };

    // Handle Image Upload for Editor
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
                // Insert markdown image syntax at cursor or at end
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
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full">
                    <ArrowLeft className="h-6 w-6" />
                </Link>
                <h1 className="text-2xl font-bold">Créer un nouveau cours</h1>
            </div>

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
                <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium">Contenu du cours (Markdown)</label>

                    <div className="relative">
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
                            className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-md cursor-pointer bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors ${uploadingImg ? 'opacity-50 cursor-wait' : ''}`}
                        >
                            {uploadingImg ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                            Insérer une image
                        </label>
                    </div>
                </div>

                <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    className="w-full h-[500px] p-4 font-mono text-sm border rounded-xl dark:bg-neutral-900 dark:border-neutral-700 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    placeholder="# Mon Cours...&#10;&#10;Commencez à écrire ici. Vous pouvez utiliser du Markdown."
                />
                <p className="text-xs text-gray-500">
                    Supporte les titres (#), gras (**text**), italique (*text*), listes (- item) et plus.
                </p>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium disabled:opacity-50"
                >
                    {saving ? 'Enregistrement...' : <><Save className="h-5 w-5" /> Enregistrer le cours</>}
                </button>
            </div>
        </div>
    );
}
