'use client';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';

type Performance = {
    matiere: string;
    note: number;
    date: string;
};

export default function PerfChart({ data }: { data: Performance[] }) {
    if (!data || data.length === 0) {
        return <div className="text-center p-10 text-gray-500">Aucune note pour le moment.</div>;
    }

    // Format data for chart: Group by date or just display in sequence?
    // Let's just display raw points for MVP simplicity, maybe filtered by subject in future.
    // For now, let's just plot all notes chronologically.

    // Transform date
    const formattedData = data.map(d => ({
        ...d,
        dateFormatted: new Date(d.date).toLocaleDateString()
    })).reverse(); // Assuming input is newest first

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis
                        dataKey="dateFormatted"
                        stroke="#9ca3af"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#9ca3af"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        domain={[0, 20]} // French grading system usually /20
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="note"
                        stroke="#4f46e5"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#4f46e5' }}
                        activeDot={{ r: 6 }}
                        name="Note (/20)"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
