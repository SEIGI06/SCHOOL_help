'use client';

import { createClient } from '@/lib/supabaseClient';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSignUp, setIsSignUp] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                alert('Compte créé ! Veuillez vérifier votre email (ou connectez-vous si email auto-confirmé).');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-black">
            <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-xl dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                        {isSignUp ? 'Créer un compte' : 'Connexion'}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        {isSignUp ? 'Rejoignez la plateforme de révision' : 'Accédez à vos cours et quiz'}
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleAuth}>
                    <div className="-space-y-px rounded-md shadow-sm">
                        <div>
                            <input
                                type="email"
                                required
                                className="relative block w-full rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                                placeholder="Adresse email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                required
                                className="relative block w-full rounded-b-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                                placeholder="Mot de passe"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-sm text-red-600 text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                            {loading ? 'Chargement...' : (isSignUp ? "S'inscrire" : 'Se connecter')}
                        </button>
                    </div>
                </form>
                <div className="text-center">
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                    >
                        {isSignUp
                            ? 'Déjà un compte ? Se connecter'
                            : "Pas encore de compte ? S'inscrire"}
                    </button>
                </div>
            </div>
        </div>
    );
}
