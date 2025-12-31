'use client';

import { useChat } from 'ai/react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface ChatInterfaceProps {
    courseContent: string;
}

export default function ChatInterface({ courseContent }: ChatInterfaceProps) {
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        api: '/api/chat-course',
        body: { courseContent },
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex flex-col h-[600px] border border-gray-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold">Assistant de Révision</h3>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 mt-20">
                        <p>👋 Bonjour ! Je connais ce cours par cœur.</p>
                        <p className="text-sm mt-2">Posez-moi une question comme :</p>
                        <ul className="text-sm mt-2 space-y-1">
                            <li>"Fais-moi un résumé en 3 points"</li>
                            <li>"Quelles sont les dates importantes ?"</li>
                            <li>"Explique-moi ce concept..."</li>
                        </ul>
                    </div>
                )}
                
                {messages.map(m => (
                    <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-gray-200 dark:bg-neutral-700' : 'bg-indigo-100 dark:bg-indigo-900/50'}`}>
                            {m.role === 'user' ? <User className="w-5 h-5 text-gray-600 dark:text-gray-300" /> : <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
                        </div>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                            m.role === 'user' 
                            ? 'bg-indigo-600 text-white rounded-br-none' 
                            : 'bg-gray-100 dark:bg-neutral-800 text-gray-800 dark:text-gray-200 rounded-bl-none'
                        }`}>
                            {m.content}
                        </div>
                    </div>
                ))}
                
                {isLoading && (
                    <div className="flex items-center gap-2 text-gray-400 text-sm ml-12">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>L'assistant réfléchit...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                <div className="relative">
                    <input
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Posez votre question sur le cours..."
                        className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button 
                        type="submit" 
                        disabled={isLoading || !input.trim()}
                        className="absolute right-2 top-2 p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </form>
        </div>
    );
}
