'use client';

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { Idea } from '@/types/Idea';
import { getDraft, saveDraft } from '@/services/drafts';
import { IdeasService } from '@/services/ideas';
import { generateContent, rewriteContent, RewriteAction } from '@/services/content';
import { CopyButton } from '@/components/ui/CopyButton';

interface IdeaEditModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (text: string, status: Idea['status']) => void;
  loading: boolean;
  text: string;
  status: Idea['status'];
  setText: (t: string) => void;
  setStatus: (s: Idea['status']) => void;
}

function IdeaEditModal({
  open,
  onClose,
  onSave,
  loading,
  text,
  status,
  setText,
  setStatus,
}: IdeaEditModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-base-100 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Edit Idea</h3>
          <button
            type="button"
            className="btn btn-text btn-circle btn-sm"
            onClick={onClose}
            aria-label="Close"
          >
            <span className="icon-[tabler--x] size-4" />
          </button>
        </div>
        <div className="space-y-4">
          <textarea
            className="textarea w-full"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <select
            className="select w-full"
            value={status}
            onChange={(e) => setStatus(e.target.value as Idea['status'])}
          >
            <option value="new">New</option>
            <option value="content_generated">Content Generated</option>
            <option value="ready">Ready</option>
            <option value="posted">Posted</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button className="btn btn-soft btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={() => onSave(text, status)}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

type RewriteActionState =
  | RewriteAction
  | 'tone_professional'
  | 'tone_empathetic'
  | 'tone_casual'
  | 'tone_neutral'
  | 'tone_educational';

export default function IdeaContentPage() {
  const params = useParams();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [idea, setIdea] = useState<Idea | null>(null);
  const [project, setProject] = useState<{ platform: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [draftLoading, setDraftLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [editedStatus, setEditedStatus] = useState<Idea['status']>('new');
  const [activeTab, setActiveTab] = useState<'content' | 'image'>('content');
  const [isUpdating, setIsUpdating] = useState(false);
  const [rewriteMenuOpen, setRewriteMenuOpen] = useState(false);
  const [toneMenuOpen, setToneMenuOpen] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [rewriteAction, setRewriteAction] = useState<RewriteActionState | null>(
    null,
  );
  const [uploading, setUploading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          .select('id, idea_text, status, image_url, projects!inner(platform)')
          .eq('id', ideaId)
          .eq('project_id', projectId)
          .eq('user_id', session.user.id)
          .single();

        if (error || !data) throw error;
        setIdea({
          id: data.id,
          idea_text: data.idea_text,
          status: data.status,
          image_url: data.image_url ?? undefined,
        });
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

  const getAccessToken = async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error || !session?.access_token) return null;
    return session.access_token;
  };

  const performRewrite = async (
    action: RewriteAction,
    opts: { prompt?: string; uiAction?: string; success?: string } = {},
  ) => {
    if (!generatedContent) return;
    setRewriteAction((opts.uiAction || action) as RewriteActionState);
    setIsRewriting(true);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        toast.error('You must be signed in to rewrite content.');
        return;
      }
      const { text } = await rewriteContent({
        text: generatedContent,
        action,
        prompt: opts.prompt,
        accessToken,
      });
      setGeneratedContent(text);
      if (opts.success) toast.success(opts.success);
      else toast.success('✅ Content updated!');
      if (action === 'custom') setCustomPrompt('');
    } catch (error) {
      console.error('Error rewriting content:', error);
      toast.error('Failed to rewrite content.');
    } finally {
      setIsRewriting(false);
      setRewriteAction(null);
      setRewriteMenuOpen(false);
      setToneMenuOpen(false);
    }
  };

  const handleGenerate = async () => {
    if (!idea) return;
    setIsGenerating(true);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        toast.error('You must be signed in to generate content.');
        return;
      }
      const { content } = await generateContent({
        ideaText: idea.idea_text,
        projectId: params?.id as string,
        regenerate: !!generatedContent,
        platform: project?.platform || 'twitter',
        accessToken,
      });
      setGeneratedContent(content);
      await saveDraft(idea.id, content, accessToken);
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
      const accessToken = await getAccessToken();
      if (!accessToken) {
        toast.error('You must be signed in to save content.');
        return;
      }
      await saveDraft(idea.id, generatedContent, accessToken);
      toast.success('✅ Draft saved successfully!');
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShorten = () =>
    performRewrite('shorten', { success: '✅ Content shortened!' });

  const handleExpand = async () => {
    performRewrite('expand', { success: '✅ Content expanded!' });
  };

  const handleFix = async () => {
    performRewrite('fix', { success: '✅ Grammar fixed!' });
  };

  const handleCustomRewrite = async () => {
    if (!customPrompt.trim()) return;
    performRewrite('custom', {
      prompt: customPrompt.trim(),
      success: '✅ Content updated!',
    });
  };

  const handleTone = (
    tone: 'professional' | 'empathetic' | 'casual' | 'neutral' | 'educational',
  ) => {
    performRewrite(tone as RewriteAction, {
      uiAction: `tone_${tone}`,
      success: `✅ Tone updated to ${tone.charAt(0).toUpperCase() + tone.slice(1)}!`,
    });
  };

  const handleSaveIdea = async (text: string, status: Idea['status']) => {
    if (!idea) return;
    setIsUpdating(true);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        toast.error('You must be signed in to update the idea.');
        return;
      }
      await IdeasService.update({
        ideaId: idea.id,
        ideaText: text,
        status,
        accessToken,
      });

      setIdea({ ...idea, idea_text: text, status });
      toast.success('✅ Idea updated successfully!');
    } catch (error) {
      console.error('Error updating idea:', error);
      toast.error('Failed to update idea. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !idea) return;
    setUploading(true);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        toast.error('You must be signed in to upload images.');
        return;
      }
      const ext = file.name.split('.').pop();
      const filePath = `${idea.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('idea-images')
        .upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('idea-images').getPublicUrl(filePath);
      const imageUrl = data.publicUrl;
      await IdeasService.update({ ideaId: idea.id, imageUrl, accessToken });
      setIdea({ ...idea, image_url: imageUrl });
      toast.success('✅ Image uploaded!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleGenerateImage = async () => {
    if (!idea) return;
    setIsGeneratingImage(true);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        toast.error('You must be signed in to generate images.');
        return;
      }
      const { image_url } = await IdeasService.generateImage({
        ideaId: idea.id,
        accessToken,
      });
      setIdea({ ...idea, image_url });
      toast.success('✅ Image generated!');
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Failed to generate image.');
    } finally {
      setIsGeneratingImage(false);
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
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 space-y-2">
                <p className="text-lg break-words">{idea?.idea_text || 'No idea found'}</p>
                {idea && (
                  <span className="badge badge-sm">
                    {idea.status.replace('_', ' ')}
                  </span>
                )}
              </div>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => {
                  if (idea) {
                    setEditedText(idea.idea_text);
                    setEditedStatus(idea.status);
                  }
                  setEditModalOpen(true);
                }}
              >
                Edit
              </button>
            </div>
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

      <div className="mt-8">
        <div className="mb-4 flex gap-2">
          <button
            className={`flex-1 px-4 py-2 rounded-full text-sm font-medium ${activeTab === 'content' ? 'bg-primary text-primary-content' : 'bg-base-200'}`}
            onClick={() => setActiveTab('content')}
          >
            Content
          </button>
          <button
            className={`flex-1 px-4 py-2 rounded-full text-sm font-medium ${activeTab === 'image' ? 'bg-primary text-primary-content' : 'bg-base-200'}`}
            onClick={() => setActiveTab('image')}
          >
            Image
          </button>
        </div>

        {activeTab === 'content' && (
          <>
            {draftLoading ? (
              <div className="text-base-content/60">Loading draft...</div>
            ) : generatedContent ? (
              <div>
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
                    <div
                      className="relative inline-block mt-2"
                      tabIndex={0}
                      onBlur={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                          setRewriteMenuOpen(false);
                        }
                      }}
                    >
                      <button
                        onClick={() => setRewriteMenuOpen((v) => !v)}
                        className="btn btn-ghost btn-sm"
                        aria-label="Rewrite options"
                      >
                        <span className="icon-[tabler--wand] size-4" />
                      </button>
                      {rewriteMenuOpen && (
                        <div className="absolute z-10 bottom-full mb-1 w-56 bg-base-100 rounded-box shadow-md p-2 text-sm space-y-2">
                          <input
                            type="text"
                            placeholder="write with ai or select from below"
                            className="input input-bordered input-sm w-full"
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                          />
                          <button
                            onClick={handleCustomRewrite}
                            className="btn btn-primary btn-sm w-full"
                            disabled={isRewriting}
                          >
                            {isRewriting && rewriteAction === 'custom' ? 'Rewriting...' : 'Rewrite'}
                          </button>
                          <ul className="menu p-0">
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
                            <li>
                              <button onClick={handleFix} disabled={isRewriting}>
                                {isRewriting && rewriteAction === 'fix' ? 'Fixing...' : 'Fix Grammar'}
                              </button>
                            </li>
                            <li
                              className="relative"
                              tabIndex={0}
                              onBlur={(e) => {
                                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                  setToneMenuOpen(false);
                                }
                              }}
                            >
                              <button
                                onClick={() => setToneMenuOpen((v) => !v)}
                                className="flex items-center justify-between w-full"
                                disabled={isRewriting}
                              >
                                Change tone to...
                                <span className="icon-[tabler--chevron-right] size-4" />
                              </button>
                              {toneMenuOpen && (
                                <ul className="absolute left-full top-0 ml-2 menu p-2 bg-base-100 rounded-box shadow-md w-40 text-sm">
                                  <li>
                                    <button onClick={() => handleTone('professional')} disabled={isRewriting}>
                                      {isRewriting && rewriteAction === 'tone_professional' ? 'Changing...' : 'Professional'}
                                    </button>
                                  </li>
                                  <li>
                                    <button onClick={() => handleTone('empathetic')} disabled={isRewriting}>
                                      {isRewriting && rewriteAction === 'tone_empathetic' ? 'Changing...' : 'Empathetic'}
                                    </button>
                                  </li>
                                  <li>
                                    <button onClick={() => handleTone('casual')} disabled={isRewriting}>
                                      {isRewriting && rewriteAction === 'tone_casual' ? 'Changing...' : 'Casual'}
                                    </button>
                                  </li>
                                  <li>
                                    <button onClick={() => handleTone('neutral')} disabled={isRewriting}>
                                      {isRewriting && rewriteAction === 'tone_neutral' ? 'Changing...' : 'Neutral'}
                                    </button>
                                  </li>
                                  <li>
                                    <button onClick={() => handleTone('educational')} disabled={isRewriting}>
                                      {isRewriting && rewriteAction === 'tone_educational' ? 'Changing...' : 'Educational'}
                                    </button>
                                  </li>
                                </ul>
                              )}
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </>
        )}

        {activeTab === 'image' && idea && (
          <div className="space-y-2">
            {idea.image_url && (
              <img src={idea.image_url} alt="Idea" className="w-full rounded-lg" />
            )}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleImageUpload}
            />
            <button
              className="btn btn-secondary w-full"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : idea.image_url ? 'Change Image' : 'Upload Image'}
            </button>
            <button
              className="btn btn-primary w-full"
              onClick={handleGenerateImage}
              disabled={isGeneratingImage}
            >
              {isGeneratingImage ? 'Generating...' : idea.image_url ? 'Regenerate Image' : 'Generate Image'}
            </button>
          </div>
        )}
      </div>

      <IdeaEditModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={(text, status) => handleSaveIdea(text, status)}
        loading={isUpdating}
        text={editedText}
        status={editedStatus}
        setText={setEditedText}
        setStatus={setEditedStatus}
      />
    </div>
  );
}
