import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { generateImageFromIdea } from '@/lib/ai/generateImage';

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
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { idea_id } = await request.json();
    if (!idea_id) {
      return NextResponse.json({ error: 'Missing idea_id' }, { status: 400 });
    }

    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select('id, idea_text, project_id')
      .eq('id', idea_id)
      .eq('user_id', user.id)
      .single();
    if (ideaError || !idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
    }

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', idea.project_id)
      .eq('user_id', user.id)
      .single();
    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const { data: draft, error: draftError } = await supabase
      .from('drafts')
      .select('*')
      .eq('idea_id', idea_id)
      .eq('user_id', user.id)
      .single();
    if (draftError || !draft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }

    const imageBuffer = await generateImageFromIdea(draft.content, project);

    const filePath = `${idea_id}/${Date.now()}.png`;
    const { error: uploadError } = await supabase.storage
      .from('idea-images')
      .upload(filePath, imageBuffer, { contentType: 'image/png' });
    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload image' },
        { status: 500 },
      );
    }

    const { data: publicData } = supabase.storage
      .from('idea-images')
      .getPublicUrl(filePath);
    const image_url = publicData.publicUrl;

    const { error: updateError } = await supabase
      .from('ideas')
      .update({ image_url })
      .eq('id', idea_id)
      .eq('user_id', user.id);
    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to save image' },
        { status: 500 },
      );
    }

    return NextResponse.json({ image_url });
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
  }
}
