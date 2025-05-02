import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { OpenAI } from 'openai';
import { Idea } from '@/types/Idea';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper to extract access token from Authorization header
function getAccessToken(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.replace('Bearer ', '');
}

export async function POST(request: Request) {
  try {
    // 1. Auth: Get access token and user
    const accessToken = getAccessToken(request);
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const supabase = createSupabaseServerClient(accessToken);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse request body
    const { idea_text, format } = await request.json();
    if (!idea_text || !format) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 3. Get project tone if available
    const { data: project } = await supabase
      .from('projects')
      .select('tone')
      .eq('user_id', user.id)
      .single();
    const tone = project?.tone || 'friendly and actionable';

    // 4. Build GPT prompt
    let prompt = '';
    if (format === 'twitter-thread') {
      prompt = `You are a content creator specializing in high-performing Twitter threads.\n\nWrite a Twitter thread based on this idea:\n"${idea_text}"\n\nThe tone is ${tone}.\n\nFormat:\n- Hook\n- 3–5 short bullet points\n- 1 final CTA (call to engage)\n\nReturn the output as plain text.`;
    } else {
      return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
    }

    // 5. Call OpenAI
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4-turbo-preview',
      temperature: 0.7,
    });
    const content = completion.choices[0]?.message?.content || '';

    // 6. Return result
    return NextResponse.json({ content });
  } catch (error) {
    console.error('Content generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
} 