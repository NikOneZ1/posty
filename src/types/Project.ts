export interface Project {
  id: string
  name: string
  niche: string | null
  description: string | null
  tone: string | null
  platform: 'twitter' | 'linkedin' | 'telegram'
  created_at: string
  user_id: string
} 