import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServerClient';

function isValidUUID(uuid: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

export async function POST(request: Request) {
  try {
    // 1. Auth
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const accessToken = authHeader.replace('Bearer ', '');
    const supabase = createSupabaseServerClient(accessToken);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Validate input
    const { idea_id } = await request.json();
    if (!isValidUUID(idea_id)) {
      return NextResponse.json({ error: 'Invalid idea_id' }, { status: 400 });
    }

    // 3. Check idea ownership
    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select('id')
      .eq('id', idea_id)
      .eq('user_id', user.id)
      .single();
    if (ideaError || !idea) {
      return NextResponse.json({ draft: null });
    }

    // 4. Fetch draft
    const { data: draft } = await supabase
      .from('drafts')
      .select('*')
      .eq('idea_id', idea_id)
      .single();

    return NextResponse.json({ draft: draft || null });
  } catch (error) {
    console.error('Draft get error:', error);
    return NextResponse.json({ error: 'Failed to fetch draft' }, { status: 500 });
  }
} 