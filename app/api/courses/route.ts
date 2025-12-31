import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { extractTextFromFile } from '@/lib/extractText';
import { generateText } from 'ai';
import { grokModel } from '@/lib/ai';

// Initialize Supabase Admin client for service-role operations if needed, 
// OR better: use the user's session for RLS. 
// However, Route Handlers don't automatically have the user session without cookies.
// The standard pattern with @supabase/ssr in App Router is to create a server client.
// BUT for file upload + processing, we often just need the user ID. 
// Let's use standard supabase-js with the user's access token passed in headers OR 
// safer: use createServerClient from @supabase/ssr if we had it set up.
// For MVP speed and clean code, we'll assume the client sends the session token or we use the service role 
// if we trust the protection (but we want RLS). 
// Let's stick to using `createClient` from `@supabase/supabase-js` with the ANON key 
// and relying on the `Authorization: Bearer <token>` header automatically passed by the client or manually.

// Actually, to read the user from the server side properly with RLS, we should use @supabase/ssr.
// Let's create a quick server-side client helper or just do it inline here.
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
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
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

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // 1. Upload file to Storage (optional for MVP but good practice)
        const fileExt = file.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;

        // Convert to ArrayBuffer for storage upload
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { error: uploadError } = await supabase.storage
            .from('course-files')
            .upload(filePath, buffer, {
                contentType: file.type,
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            // We continue even if storage fails? No, better to fail.
            // But for MVP, maybe we just want the text. Let's try to proceed extracting text anyway.
        }

        const fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/course-files/${filePath}`;

        // 2. Extract Text
        let extractedText = '';
        try {
            extractedText = await extractTextFromFile(buffer, file.type);
        } catch (e: any) {
            console.error('Text extraction failed:', e);
            return NextResponse.json({ error: 'Failed to extract text from file' }, { status: 500 });
        }

        if (!extractedText || extractedText.length < 50) {
            return NextResponse.json({ error: 'Not enough text extracted.' }, { status: 400 });
        }

        // 3. AI Categorization (Subject & Chapter)
        const { text: metadataText } = await generateText({
            model: grokModel,
            prompt: `Analyse le texte de cours suivant et extrais : 1) La matière scolaire (ex: Mathématiques, Français, Histoire). 2) Le titre du chapitre ou le thème principal.
      Réponds UNIQUEMENT au format JSON : { "matiere": "...", "chapitre": "..." }
      
      Début du texte :
      ${extractedText.slice(0, 2000)}`
        });

        let metadata = { matiere: 'Autre', chapitre: 'Sans titre' };
        try {
            // Find JSON usage
            const jsonMatch = metadataText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                metadata = JSON.parse(jsonMatch[0]);
            }
        } catch (e) {
            console.error('AI Metadata parsing failed', e);
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
