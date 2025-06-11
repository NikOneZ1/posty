import React, { useState, useEffect } from "react"
import { Idea } from "@/types/Idea"

interface IdeaFilterModalProps {
  open: boolean
  onClose: () => void
  initialStatus: Idea['status'] | 'all'
  showArchived: boolean
  onApply: (status: Idea['status'] | 'all', showArchived: boolean) => void
}

export function IdeaFilterModal({ open, onClose, initialStatus, showArchived, onApply }: IdeaFilterModalProps) {
  const [status, setStatus] = useState<Idea['status'] | 'all'>(initialStatus)
  const [includeArchived, setIncludeArchived] = useState(showArchived)

  useEffect(() => {
    setStatus(initialStatus)
  }, [initialStatus])

  useEffect(() => {
    setIncludeArchived(showArchived)
  }, [showArchived])

  if (!open) return null

  const handleApply = () => {
    onApply(status, includeArchived)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-sm card bg-base-100 p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Filter Ideas</h3>
        <div className="space-y-4">
          <div>
            <label className="label-text" htmlFor="filter-status">Status</label>
            <select
              id="filter-status"
              className="select w-full"
              value={status}
              onChange={e => setStatus(e.target.value as Idea['status'] | 'all')}
            >
              <option value="all">All</option>
              <option value="new">New</option>
              <option value="content_generated">Content Generated</option>
              <option value="ready">Ready</option>
              <option value="posted">Posted</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="show-archived"
              type="checkbox"
              className="checkbox"
              checked={includeArchived}
              onChange={e => setIncludeArchived(e.target.checked)}
            />
            <label htmlFor="show-archived" className="label-text">Show archived ideas</label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button onClick={handleApply} className="btn btn-primary">Apply Filter</button>
          </div>
        </div>
      </div>
    </div>
  )
}
