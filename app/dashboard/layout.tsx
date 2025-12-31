import Link from 'next/link';
import { BookOpen, BarChart2, LogOut, Plus } from 'lucide-react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient'; // Note: This is client-side, for server comp we might need cookie-based. 
// But for MVP simple layout, let's use a server-friendly verify if possible or just render. 
// Actually, Layout is RSC by default. We should check session here.

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-gray-50 dark:bg-black">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-800 hidden md:block">
                <div className="flex h-16 items-center border-b border-gray-200 dark:border-neutral-800 px-6">
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
                        RevisionAI
                    </h1>
                </div>
                <nav className="p-4 space-y-2">
                    <Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-neutral-800">
                        <BookOpen className="h-5 w-5" />
                        Mes Cours
                    </Link>
                    <Link href="/dashboard/performance" className="flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-neutral-800">
                        <BarChart2 className="h-5 w-5" />
                        Performances
                    </Link>
                </nav>
                <div className="absolute bottom-4 left-0 w-full px-4">
                    {/* Logout handled via client component usually, or just a link to home for MVP */}
                    <Link href="/" className="flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                        <LogOut className="h-5 w-5" />
                        Déconnexion
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
