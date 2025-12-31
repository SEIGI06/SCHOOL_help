import { xai } from '@/lib/ai';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages, courseContent } = await req.json();

  const result = streamText({
    model: xai('grok-beta'),
    system: `You are a helpful study assistant. You are helping a student revise a specific course.
    
    Here is the content of the course:
    ---
    ${courseContent ? courseContent.substring(0, 20000) : 'No content available.'}
    ---

    Answer the student's questions based primarily on this content. 
    If the answer is not in the course, you can use your general knowledge but mention that it's not explicitly in the notes.
    Be encouraging, concise, and pedagogically helpful.`,
    messages,
  });

  return result.toDataStreamResponse();
}
