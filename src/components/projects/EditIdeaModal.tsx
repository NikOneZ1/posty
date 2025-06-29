import React from 'react'

interface EditIdeaModalProps {
  open: boolean
  value: string
  onChange: (v: string) => void
  onClose: () => void
  onSave: () => void
  loading?: boolean
}

export function EditIdeaModal({ open, value, onChange, onClose, onSave, loading }: EditIdeaModalProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-base-100 rounded-lg shadow-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Edit Idea</h3>
            <button
              type="button"
              className="btn btn-text btn-circle btn-sm"
              aria-label="Close"
              onClick={onClose}
            >
              <span className="icon-[tabler--x] size-4"></span>
            </button>
          </div>
          <textarea
            className="textarea w-full min-h-32 mb-4"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Edit your idea here..."
          />
          <div className="flex justify-end gap-2">
            <button type="button" className="btn btn-soft btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={onSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

