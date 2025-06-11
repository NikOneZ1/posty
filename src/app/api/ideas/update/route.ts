import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { idea_id, idea_text, status } = await request.json();

    if (!idea_id || (!idea_text && !status)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (idea_text) updates.idea_text = idea_text;
    if (status) updates.status = status;

    const { error } = await supabase
      .from('ideas')
      .update(updates)
      .eq('id', idea_id)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: 'Failed to update idea' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating idea:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 