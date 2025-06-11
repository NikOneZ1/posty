import React from "react"
import { Idea } from "@/types/Idea"
import { useRouter } from "next/navigation"

interface Props {
  ideas: Idea[]
  onDelete?: (idea: Idea) => void
  projectId: string
  onFilterClick?: () => void
}

export function GeneratedIdeasList({ ideas, onDelete, projectId, onFilterClick }: Props) {
  const router = useRouter()

  if (!ideas.length) return null

  const statusLabels: Record<Idea['status'], string> = {
    new: 'New',
    content_generated: 'Content Generated',
    ready: 'Ready',
    posted: 'Posted',
    archived: 'Archived',
  }

  const statusClasses: Record<Idea['status'], string> = {
    new: 'badge-info',
    content_generated: 'badge-primary',
    ready: 'badge-success',
    posted: 'badge-secondary',
    archived: 'badge-error',
  }

  const handleIdeaClick = (idea: Idea) => {
    router.push(`/project/${projectId}/idea/${idea.id}`)
  }

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Generated Ideas</h2>
        {onFilterClick && (
          <button
            onClick={onFilterClick}
            className="btn btn-ghost btn-sm flex items-center gap-1"
          >
            <span className="icon-[tabler--filter] size-4" />
            Filter
          </button>
        )}
      </div>
      <ul className="space-y-3">
        {ideas.map((idea) => (
          <li
            key={`${idea.id}-${idea.idea_text}`}
            className="bg-base-100 border border-base-200 rounded-xl p-4 flex items-center justify-between hover:shadow-md transition cursor-pointer"
            onClick={() => handleIdeaClick(idea)}
          >
            <div className="flex flex-col">
              <span className="mb-1">{idea.idea_text}</span>
              <span className={`badge badge-sm ${statusClasses[idea.status]}`}>
                {statusLabels[idea.status]}
              </span>
            </div>
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(idea)
                }}
                className="p-1 text-base-content/50 hover:text-error"
                title="Archive idea"
                aria-label="Archive idea"
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
