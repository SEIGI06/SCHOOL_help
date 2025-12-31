import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromFile } from '@/lib/extractText';
import { generateText } from 'ai';
import { grokModel } from '@/lib/ai';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function createSupabaseServerClient() {
    const cookieStore = await cookies();
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet: { name: string, value: string, options?: any }[]) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                    }
                },
            },
        }
    );
}

export async function POST(req: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient();

        // Check Auth
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;
        const manualMatiere = formData.get('matiere') as string;
        const manualChapitre = formData.get('chapitre') as string;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // 1. Upload file to Storage
        const fileExt = file.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { error: uploadError } = await supabase.storage
            .from('course-files')
            .upload(filePath, buffer, {
                contentType: file.type,
            });

        if (uploadError) console.error('Upload error:', uploadError);

        const fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/course-files/${filePath}`;

        // 2. Extract Text
        let extractedText = '';
        try {
            extractedText = await extractTextFromFile(buffer, file.type);
        } catch (e: any) {
            console.error('Text extraction failed:', e);
            return NextResponse.json({ error: 'Failed to extract text from file' }, { status: 500 });
        }

        // 3. Metadata (Manual OR AI)
        let metadata = { matiere: 'Autre', chapitre: 'Sans titre' };

        if (manualMatiere && manualChapitre) {
            // User provided both, skip AI
            metadata = { matiere: manualMatiere, chapitre: manualChapitre };
        } else {
            // Try AI if available, otherwise just use manual fields if partial, or fallback
            if (manualMatiere) metadata.matiere = manualMatiere;
            if (manualChapitre) metadata.chapitre = manualChapitre;

            // Only call AI if explicit XAI Key is set, to avoid crashing if user wants "NO AI"
            if (process.env.XAI_API_KEY || process.env.VERCEL_AI_API_KEY) {
                try {
                    const { text: metadataText } = await generateText({
                        model: grokModel,
                        prompt: `Analyse le texte de cours suivant et extrais : 1) La matière scolaire (ex: Mathématiques, Français, Histoire). 2) Le titre du chapitre ou le thème principal.
                        Réponds UNIQUEMENT au format JSON : { "matiere": "...", "chapitre": "..." }
                        
                        Début du texte :
                        ${extractedText.slice(0, 2000)}`
                    });

                    const jsonMatch = metadataText.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const aiMetadata = JSON.parse(jsonMatch[0]);
                        // Only overwrite if manual was not provided
                        if (!manualMatiere) metadata.matiere = aiMetadata.matiere;
                        if (!manualChapitre) metadata.chapitre = aiMetadata.chapitre;
                    }
                } catch (e) {
                    console.warn('AI Metadata parsing failed or skipped:', e);
                    // Fallback to filename if completely empty
                    if (!metadata.chapitre || metadata.chapitre === 'Sans titre') {
                        metadata.chapitre = file.name.replace(/\.[^/.]+$/, "");
                    }
                }
            } else {
                // No AI Key, just allow basic upload
                if (!metadata.chapitre || metadata.chapitre === 'Sans titre') {
                    metadata.chapitre = file.name.replace(/\.[^/.]+$/, "");
                }
            }
        }

        // 4. Save to Database
        const { data: course, error: dbError } = await supabase
            .from('courses')
            .insert({
                user_id: user.id,
                matiere: metadata.matiere,
                chapitre: metadata.chapitre,
                content_text: extractedText,
                file_url: fileUrl
            })
            .select()
            .single();

        if (dbError) {
            console.error('DB Insert error:', dbError);
            return NextResponse.json({ error: 'Failed to save course' }, { status: 500 });
        }

        return NextResponse.json({ course });
    } catch (err: any) {
        console.error('Unexpected error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: courses, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ courses });
}
