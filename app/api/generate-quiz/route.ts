import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateText } from 'ai';
import { grokModel } from '@/lib/ai';

// Helper for server client
async function createSupabaseClient(token: string) {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            global: { headers: { Authorization: token } }
        }
    );
}

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const supabase = await createSupabaseClient(authHeader);
        const { courseId } = await req.json();

        if (!courseId) return NextResponse.json({ error: 'Missing courseId' }, { status: 400 });

        // 1. Fetch Course Text
        const { data: course, error: fetchError } = await supabase
            .from('courses')
            .select('content_text')
            .eq('id', courseId)
            .single();

        if (fetchError || !course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        // 2. Generate Quiz with AI
        const prompt = `Tu es un professeur expert. À partir du texte de cours suivant, génère 5 questions de type QCM (Choix Multiples) pour tester la compréhension d'un élève.
    
    Format de sortie JSON sctrict :
    [
      {
        "question": "L'intitulé de la question",
        "choices": ["Choix A", "Choix B", "Choix C", "Choix D"],
        "correctIndex": 0, // index du bon choix (0-3)
        "explanation": "Brève explication de la réponse"
      }
    ]

    Texte du cours :
    ${course.content_text.slice(0, 15000)}` // Limit context window if needed

        const { text: quizJSON } = await generateText({
            model: grokModel,
            prompt: prompt,
        });

        let quizData = [];
        try {
            // Cleanup json markdown if present
            const cleaned = quizJSON.replace(/```json/g, '').replace(/```/g, '').trim();
            quizData = JSON.parse(cleaned);
        } catch (e) {
            console.error('Quiz parsing failed', e);
            return NextResponse.json({ error: 'AI generation failed' }, { status: 500 });
        }

        // 3. Store Quiz
        const { data: quiz, error: insertError } = await supabase
            .from('quizzes')
            .insert({
                course_id: courseId,
                user_id: (await supabase.auth.getUser()).data.user?.id, // Optional if RLS uses auth()
                data: quizData
            })
            .select()
            .single();

        if (insertError) {
            console.error('Quiz Insert Error', insertError);
            // Return generated quiz anyway so user can see it? No, better to persist.
            return NextResponse.json({ error: 'Failed to save quiz' }, { status: 500 });
        }

        return NextResponse.json({ quiz });

    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
