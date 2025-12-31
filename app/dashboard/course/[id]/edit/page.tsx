'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';
import CourseEditor from '@/components/CourseEditor';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function EditCoursePage() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();
    const supabase = createClient();
    
    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCourse() {
            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .eq('id', id)
                .single();
            
            if (error) {
                alert("Erreur chargement cours");
                router.push('/dashboard');
                return;
            }
            setCourse(data);
            setLoading(false);
        }
        fetchCourse();
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
             <div className="flex items-center gap-4 mb-8">
                <Link href={`/dashboard/course/${id}`} className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full">
                    <ArrowLeft className="h-6 w-6" />
                </Link>
                <h1 className="text-2xl font-bold">Modifier le cours</h1>
            </div>

            <CourseEditor 
                initialData={course} 
                onSave={() => {
                    // Cache invalidation could happen here
                }} 
            />
        </div>
    );
}
