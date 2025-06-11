import React, { useState } from "react"
import { Idea } from "@/types/Idea"
import { useRouter } from "next/navigation"

interface Props {
  ideas: Idea[]
  onDelete?: (idea: Idea) => void
  projectId: string
}

export function GeneratedIdeasList({ ideas, onDelete, projectId }: Props) {
  const router = useRouter()
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<Idea['status'] | 'all'>('all')
  const [showArchived, setShowArchived] = useState(false)

  if (!ideas.length) return null

  const filteredIdeas = ideas.filter((idea) => {
    if (!showArchived && idea.status === 'archived') return false
    if (statusFilter !== 'all' && idea.status !== statusFilter) return false
    return true
  })

  const handleIdeaClick = (idea: Idea) => {
    router.push(`/project/${projectId}/idea/${idea.id}`)
  }

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Generated Ideas</h2>
        <button
          className="btn btn-sm"
          onClick={() => setFilterModalOpen(true)}
        >
          Filter
        </button>
      </div>
      {filteredIdeas.length ? (
        <ul className="space-y-3">
          {filteredIdeas.map((idea) => (
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
      ) : (
        <p className="text-sm text-base-content/60">No ideas to display.</p>
      )}

      {filterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setFilterModalOpen(false)}
          />
          <div className="relative w-full max-w-sm card bg-base-100 p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Filter Ideas</h3>
            <div className="space-y-4">
              <div>
                <label className="label-text" htmlFor="status-filter">Status</label>
                <select
                  id="status-filter"
                  className="select w-full"
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as Idea['status'] | 'all')
                  }
                >
                  <option value="all">All</option>
                  <option value="new">New</option>
                  <option value="content_generated">Content Generated</option>
                  <option value="ready">Ready</option>
                  <option value="posted">Posted</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="show-archived"
                  type="checkbox"
                  className="checkbox"
                  checked={showArchived}
                  onChange={(e) => setShowArchived(e.target.checked)}
                />
                <label htmlFor="show-archived" className="label-text">
                  Show archived ideas
                </label>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  className="btn btn-primary"
                  onClick={() => setFilterModalOpen(false)}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
