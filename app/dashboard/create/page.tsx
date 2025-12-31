'use client';

import CourseEditor from '@/components/CourseEditor';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateCoursePage() {
    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full">
                    <ArrowLeft className="h-6 w-6" />
                </Link>
                <h1 className="text-2xl font-bold">Créer un nouveau cours</h1>
            </div>
            
            <CourseEditor />
        </div>
    );
}

