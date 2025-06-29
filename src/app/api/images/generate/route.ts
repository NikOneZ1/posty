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
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { idea_id, idea_text, content, project_id } = await request.json();
    if (!idea_id || !idea_text || !project_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', project_id)
      .eq('user_id', user.id)
      .single();
    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const base64 = await generateImageFromIdea(idea_text, content || '', project);

    const buffer = Buffer.from(base64, 'base64');
    const filePath = `${idea_id}/${Date.now()}.png`;
    const { error: uploadError } = await supabase.storage
      .from('idea-images')
      .upload(filePath, buffer, { contentType: 'image/png' });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('idea-images').getPublicUrl(filePath);
    const imageUrl = data.publicUrl;

    const { error: updateError } = await supabase
      .from('ideas')
      .update({ image_url: imageUrl })
      .eq('id', idea_id)
      .eq('user_id', user.id);
    if (updateError) throw updateError;

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
  }
}
