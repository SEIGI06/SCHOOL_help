'use client';

import { FileText, ChevronRight, BrainCircuit } from 'lucide-react';
import Link from 'next/link';

type Course = {
    id: string;
    matiere: string;
    chapitre: string;
    created_at: string;
};

export default function CourseList({ courses }: { courses: Course[] }) {
    if (!courses || courses.length === 0) {
        return (
            <div className="text-center py-12 bg-white dark:bg-neutral-900 rounded-xl border border-dashed border-gray-300 dark:border-neutral-800">
                <p className="text-gray-500 dark:text-gray-400">Aucun cours pour le moment. Commencez par en ajouter un !</p>
            </div>
        );
    }

    // Group by Subject
    const grouped = courses.reduce((acc, course) => {
        if (!acc[course.matiere]) acc[course.matiere] = [];
        acc[course.matiere].push(course);
        return acc;
    }, {} as Record<string, Course[]>);

    return (
        <div className="space-y-8">
            {Object.entries(grouped).map(([matiere, subjectCourses]) => (
                <div key={matiere} className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                        {matiere}
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {subjectCourses.map((course) => (
                            <div
                                key={course.id}
                                className="group relative bg-white dark:bg-neutral-900 p-5 rounded-xl border border-gray-200 dark:border-neutral-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all shadow-sm hover:shadow-md"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-100 dark:bg-neutral-800 rounded-lg group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors">
                                            <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-1 pr-4">
                                                {course.chapitre}
                                            </h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Ajouté le {new Date(course.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-neutral-800 flex justify-between items-center">
                                    <Link
                                        href={`/dashboard/course/${course.id}`} // We need to create this page next
                                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1"
                                    >
                                        Etudier <ChevronRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
