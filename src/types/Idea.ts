export interface Idea {
  id: string
  idea_text: string
  status: 'new' | 'content_generated' | 'ready' | 'posted' | 'archived'
}

