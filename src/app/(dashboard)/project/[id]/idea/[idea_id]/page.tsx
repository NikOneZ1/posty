'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
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
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [rewriteMenuOpen, setRewriteMenuOpen] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [rewriteAction, setRewriteAction] = useState<"shorten" | "expand" | null>(null);

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
          .select('id, idea_text, status, projects!inner(platform)')
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

  const handleShorten = async () => {
    if (!generatedContent) return;
    setRewriteAction('shorten');
    setIsRewriting(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (sessionError || !accessToken) {
        toast.error('You must be signed in to rewrite content.');
        return;
      }

      const response = await fetch('/api/content/rewrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ text: generatedContent, action: 'shorten' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to rewrite content');
      }

      const data = await response.json();
      setGeneratedContent(data.text);
      toast.success('✅ Content shortened!');
    } catch (error) {
      console.error('Error rewriting content:', error);
      toast.error('Failed to rewrite content.');
    } finally {
      setIsRewriting(false);
      setRewriteAction(null);
      setRewriteMenuOpen(false);
    }
  };

  const handleExpand = async () => {
    if (!generatedContent) return;
    setRewriteAction('expand');
    setIsRewriting(true);
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (sessionError || !accessToken) {
        toast.error('You must be signed in to rewrite content.');
        return;
      }

      const response = await fetch('/api/content/rewrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ text: generatedContent, action: 'expand' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to rewrite content');
      }

      const data = await response.json();
      setGeneratedContent(data.text);
      toast.success('✅ Content expanded!');
    } catch (error) {
      console.error('Error rewriting content:', error);
      toast.error('Failed to rewrite content.');
    } finally {
      setIsRewriting(false);
      setRewriteAction(null);
      setRewriteMenuOpen(false);
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

  const handleStatusChange = async (newStatus: Idea['status']) => {
    if (!idea) return;
    setStatusUpdating(true);
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
          status: newStatus,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update idea');
      }

      setIdea({ ...idea, status: newStatus });
      toast.success('✅ Status updated!');
    } catch (error) {
      console.error('Error updating idea status:', error);
      toast.error('Failed to update status. Please try again.');
    } finally {
      setStatusUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-3xl py-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <span className="icon-[tabler--bulb] size-6"></span>
          Idea Details
        </h1>
        <div className="card bg-base-100 border border-base-200 rounded-xl shadow-sm mb-6">
          <div className="card-body p-6 space-y-4">
          {isEditing ? (
            <div className="space-y-4">
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="textarea textarea-bordered w-full min-h-32"
                placeholder="Edit your idea here..."
              />
              <div className="flex gap-2">
                <button
                  className="btn btn-primary"
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
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedText(idea?.idea_text || '');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-start gap-4">
              <p className="text-lg flex-1 break-words">{idea?.idea_text || 'No idea found'}</p>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </button>
            </div>
          )}
          {idea && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Status:</span>
              <select
                className="select select-sm"
                value={idea.status}
                onChange={(e) => handleStatusChange(e.target.value as Idea['status'])}
                disabled={statusUpdating}
              >
                <option value="new">New</option>
                <option value="content_generated">Content Generated</option>
                <option value="ready">Ready</option>
                <option value="posted">Posted</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          )}
          </div>
        </div>

        <div className="space-y-4">
          <button
            className="btn btn-primary w-full"
            onClick={handleGenerate}
            disabled={isGenerating || !idea}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {generatedContent ? 'Regenerating...' : 'Generating...'}
              </>
            ) : (
              generatedContent ? 'Regenerate Content' : 'Generate Content'
            )}
          </button>
        </div>
      </div>

      {draftLoading ? (
        <div className="mt-8 text-base-content/60">Loading draft...</div>
      ) : generatedContent && (
        <div className="mt-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span className="icon-[tabler--edit] size-5"></span>
              Generated Content:
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <button
                className="btn btn-primary"
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
              </button>
              <CopyButton text={generatedContent} className="btn" />
            </div>
          </div>
          <div className="card bg-base-100 border border-base-200 rounded-xl shadow-sm mb-4">
            <div className="card-body p-6">
                <textarea
                  value={generatedContent}
                  onChange={(e) => setGeneratedContent(e.target.value)}
                  className="textarea textarea-bordered w-full min-h-[250px]"
                  placeholder="Edit your content here..."
                />
                <div className="relative inline-block mt-2" tabIndex={0} onBlur={() => setRewriteMenuOpen(false)}>
                  <button
                    onClick={() => setRewriteMenuOpen((v) => !v)}
                    className="btn btn-ghost btn-sm"
                    aria-label="Rewrite options"
                  >
                    <span className="icon-[tabler--wand] size-4" />
                  </button>
                  {rewriteMenuOpen && (
                    <ul className="absolute z-10 mt-1 menu p-2 bg-base-100 rounded-box shadow-md w-32 text-sm">
                      <li>
                        <button onClick={handleShorten} disabled={isRewriting}>
                          {isRewriting && rewriteAction === 'shorten' ? 'Shortening...' : 'Shorten'}
                        </button>
                      </li>
                      <li>
                        <button onClick={handleExpand} disabled={isRewriting}>
                          {isRewriting && rewriteAction === 'expand' ? 'Expanding...' : 'Expand'}
                        </button>
                      </li>
                    </ul>
                  )}
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
