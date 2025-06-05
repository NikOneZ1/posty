import React, { useState } from "react"
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"

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
    } catch {
      setError("Failed to create project, try again.")
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New Project">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          name="name"
          type="text"
          required
          placeholder="Project name"
          className="border p-3 rounded"
          value={form.name}
          onChange={handleChange}
          autoFocus
        />
        <div>
          <label className="block text-sm font-medium mb-2">Platform:</label>
          <Select 
            value={form.platform} 
            onValueChange={(value: Platform) => 
              setForm(prev => ({ ...prev, platform: value }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="twitter">Twitter</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="telegram">Telegram</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <input
          name="niche"
          type="text"
          placeholder="Niche (optional)"
          className="border p-3 rounded"
          value={form.niche}
          onChange={handleChange}
        />
        <textarea
          name="description"
          placeholder="Description (optional)"
          className="border p-3 rounded"
          value={form.description}
          onChange={handleChange}
        />
        <input
          name="tone"
          type="text"
          placeholder="Tone (optional)"
          className="border p-3 rounded"
          value={form.tone}
          onChange={handleChange}
        />
        <Button type="submit" disabled={creating} className="mt-2">
          {creating ? "Creating..." : "Create Project"}
        </Button>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      </form>
    </Modal>
  )
} 