'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { Idea } from '@/types/Idea';
import { getDraft, saveDraft } from '@/services/drafts';
import { CopyButton } from '@/components/ui/CopyButton';

export default function IdeaContentPage() {
  const params = useParams();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [idea, setIdea] = useState<Idea | null>(null);
  const [project, setProject] = useState<{ platform: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [draftLoading, setDraftLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

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
          .select('id, idea_text, projects!inner(platform)')
          .eq('id', ideaId)
          .eq('project_id', projectId)
          .eq('user_id', session.user.id)
          .single();

        if (error || !data) throw error;
        setIdea(data);
        setEditedText(data.idea_text);
        setProject(data.projects[0]);
        // Fetch draft for this idea
        setDraftLoading(true);
        const draft = await getDraft(data.id, session.access_token);
        if (draft?.content) setGeneratedContent(draft.content);
      } catch (error) {
        console.error('Error fetching idea:', error);
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
          project_id: params?.id,
          regenerate: !!generatedContent,
          platform: project?.platform || 'twitter',
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
      toast.success('✅ Draft updated!');
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!idea || !generatedContent) return;
    setIsSaving(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (sessionError || !accessToken) {
        toast.error('You must be signed in to save content.');
        return;
      }

      const response = await fetch('/api/drafts/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          idea_id: idea.id,
          content: generatedContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save content');
      }

      toast.success('✅ Draft saved successfully!');
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateIdea = async () => {
    if (!idea || !editedText) return;
    setIsUpdating(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (sessionError || !accessToken) {
        toast.error('You must be signed in to update the idea.');
        return;
      }

      const response = await fetch('/api/ideas/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          idea_id: idea.id,
          idea_text: editedText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update idea');
      }

      setIdea({ ...idea, idea_text: editedText });
      setIsEditing(false);
      toast.success('✅ Idea updated successfully!');
    } catch (error) {
      console.error('Error updating idea:', error);
      toast.error('Failed to update idea. Please try again.');
    } finally {
      setIsUpdating(false);
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
        <h1 className="text-2xl font-bold mb-4">💡 IDEA</h1>
        <Card className="p-6 mb-6">
          {isEditing ? (
            <div className="space-y-4">
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="w-full min-h-[100px] p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Edit your idea here..."
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleUpdateIdea}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedText(idea?.idea_text || '');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-start">
              <p className="text-lg">{idea?.idea_text || 'No idea found'}</p>
              <Button
                className="text-black px-3 py-1"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
            </div>
          )}
        </Card>

        <div className="space-y-4">
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || !idea}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {generatedContent ? 'Regenerating...' : 'Generating...'}
              </>
            ) : (
              generatedContent ? 'Regenerate Content' : 'Generate Content'
            )}
          </Button>
        </div>
      </div>

      {draftLoading ? (
        <div className="mt-8 text-gray-400">Loading draft...</div>
      ) : generatedContent && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">✍️ Generated Content:</h2>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
              <CopyButton text={generatedContent} />
            </div>
          </div>
          <Card className="p-6 mb-4">
            <textarea
              value={generatedContent}
              onChange={(e) => setGeneratedContent(e.target.value)}
              className="w-full min-h-[200px] p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Edit your content here..."
            />
          </Card>
        </div>
      )}
    </div>
  );
} 