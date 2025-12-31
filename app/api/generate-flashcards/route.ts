import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { xai } from '@/lib/ai';
import { generateObject } from 'ai';
import { z } from 'zod';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { courseId, content } = await req.json();

        if (!courseId || !content) {
            return NextResponse.json({ error: 'Missing courseId or content' }, { status: 400 });
        }

        // Generate flashcards using AI
        const { object } = await generateObject({
            model: xai('grok-beta'),
            schema: z.object({
                flashcards: z.array(z.object({
                    front: z.string().describe('The question or term on the front of the card'),
                    back: z.string().describe('The answer or definition on the back of the card')
                })).min(5).max(15)
            }),
            prompt: `Generate 10 flashcards for active recall study based on the following course content. 
            Focus on key concepts, dates, definitions, and important relationships.
            Keep the front concise (question) and the back clear (answer).
            
            Course Content:
            ${content.substring(0, 10000)}` 
        });

        // Save to Supabase
        const flashcardsToInsert = object.flashcards.map(card => ({
            course_id: courseId,
            front: card.front,
            back: card.back
        }));

        const { error } = await supabase.from('flashcards').insert(flashcardsToInsert);

        if (error) {
            console.error('Error inserting flashcards:', error);
            throw error;
        }

        return NextResponse.json({ success: true, count: flashcardsToInsert.length });

    } catch (error: any) {
        console.error('Flashcard generation error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
