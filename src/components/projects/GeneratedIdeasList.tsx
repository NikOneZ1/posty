import React from "react"
import { Idea } from "@/types/Idea"
import { useRouter } from "next/navigation"

interface Props {
  ideas: Idea[]
  onDelete?: (idea: Idea) => void
  projectId: string
}

export function GeneratedIdeasList({ ideas, onDelete, projectId }: Props) {
  const router = useRouter()

  if (!ideas.length) return null

  const handleIdeaClick = (idea: Idea) => {
    router.push(`/project/${projectId}/idea/${idea.id}`)
  }

  return (
    <div className="mb-12">
      <h2 className="text-xl font-bold mb-4">Generated Ideas</h2>
      <ul className="space-y-3">
        {ideas.map((idea) => (
          <li 
            key={`${idea.id}-${idea.idea_text}`}
            className="bg-gray-50 border border-gray-100 rounded p-4 text-gray-800 flex items-center justify-between hover:bg-gray-100 transition-colors cursor-pointer"
            onClick={() => handleIdeaClick(idea)}
          >
            <span>{idea.idea_text}</span>
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(idea)
                }}
                className="ml-4 text-gray-400 hover:text-red-500 transition-colors"
                title="Delete idea"
                aria-label="Delete idea"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
} 