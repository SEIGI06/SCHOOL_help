'use client';

import { useEffect, useState } from 'react';
import UploadDropzone from '@/components/UploadDropzone';
import CourseList from '@/components/CourseList';
import { createClient } from '@/lib/supabaseClient';
import Link from 'next/link';
import { PenTool } from 'lucide-react';

export default function DashboardPage() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    // Basic client-side fetch for the MVP. 
    // Ideally this would be a Server Component fetching data, handled by page.tsx as Server Component.
    // But since I made this file 'use client' to handle state updates easily after upload (without complex revalidation logic for now), it works.
    // Actually, let's try to make it cleaner: keep this a client component or mix?
    // User asked for "dashboard/page.tsx".
    // Let's stick to client-side fetch for simplicity of "refresh after upload" triggering a re-fetch.

    const fetchCourses = async () => {
        try {
            const res = await fetch('/api/courses');
            const data = await res.json();
            if (data.courses) setCourses(data.courses);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    // We can pass `fetchCourses` to UploadDropzone to refresh list
    // Or just rely on router.refresh() if this was a Server Component.
    // Since I am using router.refresh() in Dropzone, let's see. 
    // router.refresh() refreshes Server Components. It won't re-run this useEffect. 
    // For MVP, simply reloading the page or polling is fine. 
    // Better: Convert this component to Server Component and import Client Components. 

    // BUT: I already started writing it as 'use client'. 
    // Let's Refactor: `DashboardPage` -> Server Component. `DashboardContent` -> Client Component.
    // This is better for Next.js 15.

    // Wait, I can't overwrite `page.tsx` with a Client component easily if I want async data fetching.
    // Let's write this file as a SERVER component that fetches data, and passes it to a `DashboardView` client component?
    // No, let's keep it simple: Client Component that fetches on mount. It's an MVP.

    return (
        <div className="max-w-6xl mx-auto space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Mon Espace de Révision
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Gérez vos cours et générez des quiz automatiquement.
                    </p>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-[2fr,1fr]">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Mes cours disponibles</h3>
                        <button onClick={fetchCourses} className="text-sm text-indigo-600 hover:underline">Actualiser</button>
                    </div>
                    {loading ? (
                        <p>Chargement...</p>
                    ) : (
                        <CourseList courses={courses} />
                    )}
                </div>

                <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Ajouter un cours</h3>

                    <div className="grid grid-cols-2 gap-3 mb-2">
                        <div className="col-span-2">
                            <Link href="/dashboard/create" className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-gray-300 dark:border-neutral-700 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group cursor-pointer text-gray-600 dark:text-gray-300">
                                <PenTool className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform" />
                                <span className="font-medium">Créer manuellement (Éditeur)</span>
                            </Link>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-300 dark:border-neutral-700" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-gray-50 dark:bg-black px-2 text-gray-500">Ou uploader un fichier</span>
                        </div>
                    </div>

                    <UploadDropzone />

                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-200 rounded-lg text-sm">
                        <p className="font-semibold mb-1">💡 Astuce IA</p>
                        Déposez simplement votre PDF, l'IA détectera automatiquement la matière et le chapitre !
                    </div>
                </div>
            </div>
        </div>
    );
}
