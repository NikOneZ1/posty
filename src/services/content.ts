import { fetchApi } from './api'

export type RewriteAction =
  | 'shorten'
  | 'expand'
  | 'fix'
  | 'custom'
  | 'professional'
  | 'empathetic'
  | 'casual'
  | 'neutral'
  | 'educational'

export interface GenerateContentParams {
  ideaText: string
  projectId: string
  platform: string
  regenerate?: boolean
  accessToken: string
}

export interface RewriteContentParams {
  text: string
  action: RewriteAction
  prompt?: string
  accessToken: string
}

export async function generateContent({
  ideaText,
  projectId,
  platform,
  regenerate = false,
  accessToken,
}: GenerateContentParams) {
  return fetchApi<{ content: string }>('/api/content/generate', {
    method: 'POST',
    body: { idea_text: ideaText, project_id: projectId, platform, regenerate },
    accessToken,
  })
}

export async function rewriteContent({
  text,
  action,
  prompt,
  accessToken,
}: RewriteContentParams) {
  return fetchApi<{ text: string }>('/api/content/rewrite', {
    method: 'POST',
    body: { text, action, prompt },
    accessToken,
  })
}
