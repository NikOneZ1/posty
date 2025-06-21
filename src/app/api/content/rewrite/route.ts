import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { rewriteContent } from '@/lib/ai/rewriteContent';

function getAccessToken(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.replace('Bearer ', '');
}

export async function POST(request: Request) {
  try {
    const accessToken = getAccessToken(request);
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const supabase = createSupabaseServerClient(accessToken);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, action, prompt } = await request.json();
    if (
      typeof text !== 'string' ||
      ![
        'shorten',
        'expand',
        'fix',
        'custom',
        'professional',
        'empathetic',
        'casual',
        'neutral',
        'educational',
      ].includes(action)
    ) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const rewritten = await rewriteContent(text, action, prompt);
    return NextResponse.json({ text: rewritten });
  } catch (error) {
    console.error('Rewrite error:', error);
    return NextResponse.json({ error: 'Failed to rewrite content' }, { status: 500 });
  }
}
