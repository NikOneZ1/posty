'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { Idea } from '@/types/Idea';
import { getDraft, saveDraft } from '@/services/drafts';

type ContentFormat = 'twitter-thread' | 'instagram-carousel' | 'tiktok-caption';

export default function IdeaContentPage() {
  const params = useParams();
  const [format, setFormat] = useState<ContentFormat>('twitter-thread');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [idea, setIdea] = useState<Idea | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [draftLoading, setDraftLoading] = useState(true);

  useEffect(() => {
    const fetchIdea = async () => {
      const projectId = params?.id as string;
      const ideaId = params?.idea_id as string;

      if (!projectId || !ideaId) {
        toast.error('Invalid page parameters');
        setIsLoading(false);
        setDraftLoading(false);
        return;
      }

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          toast.error('Please sign in to view this page');
          setIsLoading(false);
          setDraftLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('ideas')
          .select('id, idea_text')
          .eq('id', ideaId)
          .eq('project_id', projectId)
          .eq('user_id', session.user.id)
          .single();

        if (error || !data) throw error;
        setIdea(data);
        // Fetch draft for this idea
        setDraftLoading(true);
        const draft = await getDraft(data.id, session.access_token);
        if (draft?.content) setGeneratedContent(draft.content);
      } catch (error) {
        toast.error('Failed to load idea');
      } finally {
        setIsLoading(false);
        setDraftLoading(false);
      }
    };

    fetchIdea();
  }, [params?.id, params?.idea_id]);

  const handleGenerate = async () => {
    if (!idea) return;
    setIsGenerating(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (sessionError || !accessToken) {
        toast.error('You must be signed in to generate content.');
        setIsGenerating(false);
        return;
      }
      const response = await fetch('/api/content/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          idea_text: idea.idea_text,
          format,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate content');
      }

      const data = await response.json();
      setGeneratedContent(data.content);
      // Auto-save draft after generation
      await saveDraft(idea.id, data.content, accessToken);
      toast.success('✅ Draft saved!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 max-w-4xl flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <Button className="mb-4" onClick={() => window.history.back()}>
          ← Back to Project
        </Button>
        
        <h1 className="text-2xl font-bold mb-4">💡 IDEA</h1>
        <Card className="p-6 mb-6">
          <p className="text-lg">{idea?.idea_text || 'No idea found'}</p>
        </Card>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Format:</label>
            <Select value={format} onValueChange={(value: ContentFormat) => setFormat(value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="twitter-thread">Twitter Thread</SelectItem>
                <SelectItem value="instagram-carousel" disabled>Instagram Carousel (Coming Soon)</SelectItem>
                <SelectItem value="tiktok-caption" disabled>TikTok Caption (Coming Soon)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || !idea}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Content'
            )}
          </Button>
        </div>
      </div>

      {draftLoading ? (
        <div className="mt-8 text-gray-400">Loading draft...</div>
      ) : generatedContent && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">✍️ Generated Content:</h2>
          <Card className="p-6 mb-4">
            <div className="whitespace-pre-wrap">{generatedContent}</div>
          </Card>
        </div>
      )}
    </div>
  );
} 