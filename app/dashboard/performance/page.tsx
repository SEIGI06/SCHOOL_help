'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import PerfChart from '@/components/PerfChart';
import { PlusCircle } from 'lucide-react';

export default function PerformancePage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    // Form state
    const [note, setNote] = useState('');
    const [matiere, setMatiere] = useState('');
    const [adding, setAdding] = useState(false);

    const fetchData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: perfs, error } = await supabase
            .from('performances')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false });

        if (perfs) setData(perfs);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setAdding(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase.from('performances').insert({
            user_id: user.id,
            matiere,
            note: parseFloat(note),
            date: new Date().toISOString()
        });

        if (!error) {
            setNote('');
            setMatiere('');
            fetchData(); // refresh
        } else {
            alert('Erreur: ' + error.message);
        }
        setAdding(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mes Performances</h1>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 bg-white dark:bg-neutral-900 p-6 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm">
                    <h2 className="text-lg font-semibold mb-6">Évolution des notes</h2>
                    {loading ? <p>Chargement...</p> : <PerfChart data={data} />}
                </div>

                <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Ajouter une note</h2>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Matière</label>
                            <input
                                type="text"
                                value={matiere}
                                onChange={(e) => setMatiere(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm dark:bg-neutral-800 dark:border-neutral-700"
                                placeholder="Ex: Maths"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Note (/20)</label>
                            <input
                                type="number"
                                step="0.5"
                                max="20"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm dark:bg-neutral-800 dark:border-neutral-700"
                                placeholder="15"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={adding}
                            className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {adding ? 'Ajout...' : <><PlusCircle className="h-4 w-4" /> Ajouter</>}
                        </button>
                    </form>
                </div>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-800">
                    <thead className="bg-gray-50 dark:bg-neutral-800">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matière</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-neutral-900 divide-y divide-gray-200 dark:divide-neutral-800">
                        {data.map((perf) => (
                            <tr key={perf.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(perf.date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                    {perf.matiere}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-bold">
                                    {perf.note}/20
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
