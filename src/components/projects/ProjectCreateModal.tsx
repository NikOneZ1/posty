import React, { useState } from "react"

type Platform = 'twitter' | 'linkedin' | 'telegram'

interface ProjectForm {
  name: string
  niche: string
  description: string
  tone: string
  platform: Platform
}

interface ProjectCreateModalProps {
  open: boolean
  onClose: () => void
  onCreate: (form: ProjectForm) => Promise<void>
  creating: boolean
}

export function ProjectCreateModal({ open, onClose, onCreate, creating }: ProjectCreateModalProps) {
  const [form, setForm] = useState<ProjectForm>({
    name: "",
    niche: "",
    description: "",
    tone: "",
    platform: 'twitter'
  })
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!form.name.trim()) {
      setError("Project name is required.")
      return
    }
    try {
      await onCreate(form)
      setForm({ name: "", niche: "", description: "", tone: "", platform: 'twitter' })
      onClose()
    } catch {
      setError("Failed to create project, try again.")
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-base-100 rounded-lg shadow-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Create New Project</h3>
            <button 
              type="button" 
              className="btn btn-text btn-circle btn-sm" 
              aria-label="Close" 
              onClick={onClose}
            >
              <span className="icon-[tabler--x] size-4"></span>
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="label-text" htmlFor="name">Project Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="input w-full"
                  placeholder="My Awesome Project"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="label-text" htmlFor="niche">Niche</label>
                <textarea
                  id="niche"
                  name="niche"
                  className="textarea w-full"
                  placeholder="e.g. Technology, Health, Finance"
                  value={form.niche}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="label-text" htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  className="textarea w-full"
                  placeholder="Brief description of your project"
                  value={form.description}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="label-text" htmlFor="tone">Content Tone</label>
                <textarea
                  id="tone"
                  name="tone"
                  className="textarea w-full"
                  placeholder="e.g. Professional, Casual, Humorous"
                  value={form.tone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="label-text" htmlFor="platform">Platform</label>
                <select
                  id="platform"
                  name="platform"
                  className="select w-full"
                  value={form.platform}
                  onChange={(e) => setForm(prev => ({ ...prev, platform: e.target.value as Platform }))}
                  required
                >
                  <option value="twitter">Twitter</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="telegram">Telegram</option>
                </select>
              </div>
              {error && <div className="text-error text-sm">{error}</div>}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button 
                type="button" 
                className="btn btn-soft btn-secondary" 
                onClick={onClose}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={creating}
              >
                {creating ? "Creating..." : "Create Project"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 