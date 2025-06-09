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
      <h2 className="text-lg font-semibold mb-4">Generated Ideas</h2>
      <ul className="space-y-3">
        {ideas.map((idea) => (
          <li
            key={`${idea.id}-${idea.idea_text}`}
            className="bg-base-100 border border-base-200 rounded-xl p-4 flex items-center justify-between hover:shadow-md transition cursor-pointer"
            onClick={() => handleIdeaClick(idea)}
          >
            <span>{idea.idea_text}</span>
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(idea)
                }}
                className="p-1 text-base-content/50 hover:text-error"
                title="Delete idea"
                aria-label="Delete idea"
              >
                <span className="icon-[tabler--x] size-4" />
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
