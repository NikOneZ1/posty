import React, { useState } from "react"

interface Props {
  onSubmit: (ideaText: string) => Promise<void>
  disabled?: boolean
}

export function IdeaInputForm({ onSubmit, disabled }: Props) {
  const [ideaText, setIdeaText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ideaText.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onSubmit(ideaText.trim())
      setIdeaText("")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="idea-input" className="label-text mb-2 block text-sm">
            Add Your Own Idea
          </label>
          <textarea
            id="idea-input"
            value={ideaText}
            onChange={(e) => setIdeaText(e.target.value)}
            placeholder="Type your content idea here..."
            className="textarea w-full h-24"
            disabled={disabled || isSubmitting}
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!ideaText.trim() || disabled || isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add Idea"}
          </button>
        </div>
      </div>
    </form>
  )
}
