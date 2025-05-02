import { Draft } from '@/types/Draft';

export async function getDraft(idea_id: string, accessToken: string): Promise<Draft | null> {
  const response = await fetch('/api/drafts/get', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ idea_id }),
  });
  if (!response.ok) return null;
  const data = await response.json();
  return data.draft || null;
}

export async function saveDraft(idea_id: string, content: string, accessToken: string): Promise<boolean> {
  const response = await fetch('/api/drafts/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ idea_id, content }),
  });
  return response.ok;
} 