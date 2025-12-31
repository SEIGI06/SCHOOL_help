'use client';

import { useState } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UploadDropzone() {
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [matiere, setMatiere] = useState('');
    const [chapitre, setChapitre] = useState('');
    const router = useRouter();

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) handleUpload(files[0]);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleUpload(e.target.files[0]);
        }
    };

    const handleUpload = async (file: File) => {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        // Add manual metadata if present
        if (matiere) formData.append('matiere', matiere);
        if (chapitre) formData.append('chapitre', chapitre);

        try {
            const res = await fetch('/api/courses', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const err = await res.json();
                alert(`Erreur: ${err.error || 'Upload échoué'}`);
                return;
            }

            router.refresh(); // Refresh server components
            // Clear fields on success
            setMatiere('');
            setChapitre('');
            alert('Cours ajouté avec succès !');
        } catch (error) {
            console.error(error);
            alert('Erreur réseau');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Manual Inputs */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Matière (Optionnel)</label>
                    <input
                        type="text"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm dark:bg-neutral-800 dark:border-neutral-700 px-3 py-2"
                        placeholder="Ex: Maths"
                        value={matiere}
                        onChange={(e) => setMatiere(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chapitre (Optionnel)</label>
                    <input
                        type="text"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm dark:bg-neutral-800 dark:border-neutral-700 px-3 py-2"
                        placeholder="Ex: Algèbre"
                        value={chapitre}
                        onChange={(e) => setChapitre(e.target.value)}
                    />
                </div>
            </div>

            <div
                className={`relative border-2 border-dashed rounded-xl p-8 transition-colors ${isDragOver ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-300 dark:border-neutral-700'
                    }`}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
            >
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 rounded-full">
                        {uploading ? (
                            <Loader2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400 animate-spin" />
                        ) : (
                            <Upload className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        )}
                    </div>
                    <div>
                        <p className="font-medium text-gray-700 dark:text-gray-200">
                            {uploading ? 'Traitement en cours...' : 'Glisser-déposer votre cours (PDF, TXT)'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            ou cliquez pour parcourir
                        </p>
                    </div>
                </div>
                <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    onChange={handleChange}
                    accept=".pdf,.txt,.md,.png,.jpg,.jpeg"
                    disabled={uploading}
                />
            </div>

            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                Si les champs Matière/Chapitre sont vides, l'IA tentera de les détecter automatiquement.
            </p>
        </div>
    );
}
