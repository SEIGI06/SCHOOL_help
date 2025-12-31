import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateText } from 'ai';
import { grokModel } from '@/lib/ai';

async function createSupabaseClient(token: string) {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: token } } }
    );
}

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const supabase = await createSupabaseClient(authHeader);
        const { courseId } = await req.json();

        const { data: course } = await supabase
            .from('courses')
            .select('content_text')
            .eq('id', courseId)
            .single();

        if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const { text: simplified } = await generateText({
            model: grokModel,
            prompt: `Tu es un tuteur pédagogique. Reformule le cours suivant de manière simplifiée, claire et structurée pour un élève qui a des difficultés à comprendre. Utilise des listes à puces et un ton encourageant.
      
      Cours :
      ${course.content_text.slice(0, 10000)}`
        });

        return NextResponse.json({ content: simplified });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
