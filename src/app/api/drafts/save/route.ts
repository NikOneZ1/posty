import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { v4 as uuidv4 } from 'uuid';
import { isValidUUID } from '@/lib/validation';
import { Draft } from '@/types/Draft';

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
    const { idea_id, content } = await request.json();
    if (!isValidUUID(idea_id)) {
      return NextResponse.json({ error: 'Invalid idea_id' }, { status: 400 });
    }
    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ error: 'Content must be non-empty' }, { status: 400 });
    }

    // 3. Check idea ownership & get project_id
    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select('id, project_id')
      .eq('id', idea_id)
      .eq('user_id', user.id)
      .single();
    if (ideaError || !idea) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const project_id = idea.project_id;

    // 4. Get project platform (if needed for future use)
    const { data: project } = await supabase
      .from('projects')
      .select('platform')
      .eq('id', project_id)
      .single();
    // platform is available as project?.platform

    // 5. Upsert draft (update if exists, insert if not)
    const { data: existingDraft } = await supabase
      .from('drafts')
      .select('id')
      .eq('idea_id', idea_id)
      .single();

    let draft: Draft;
    if (existingDraft) {
      // Update
      const { data: updated, error: updateError } = await supabase
        .from('drafts')
        .update({ content })
        .eq('id', existingDraft.id)
        .select()
        .single();
      if (updateError || !updated) {
        return NextResponse.json({ error: 'Failed to update draft' }, { status: 500 });
      }
      draft = updated as Draft;
    } else {
      // Insert
      const newDraft: Draft = {
        id: uuidv4(),
        content,
        idea_id,
        project_id,
        user_id: user.id,
        created_at: new Date().toISOString(),
      };
      const { data: inserted, error: insertError } = await supabase
        .from('drafts')
        .insert(newDraft)
        .select()
        .single();
      if (insertError || !inserted) {
        return NextResponse.json({ error: 'Failed to save draft' }, { status: 500 });
      }
      draft = inserted as Draft;
    }

    return NextResponse.json({ draft });
  } catch (error) {
    console.error('Draft save error:', error);
    return NextResponse.json({ error: 'Failed to save draft' }, { status: 500 });
  }
} 