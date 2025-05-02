import React, { useState } from "react"
import { Button } from "@/components/ui/Button"

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
          <label htmlFor="idea-input" className="block text-sm font-medium text-gray-700 mb-2">
            Add Your Own Idea
          </label>
          <textarea
            id="idea-input"
            value={ideaText}
            onChange={(e) => setIdeaText(e.target.value)}
            placeholder="Type your content idea here..."
            className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
            disabled={disabled || isSubmitting}
          />
        </div>
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!ideaText.trim() || disabled || isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add Idea"}
          </Button>
        </div>
      </div>
    </form>
  )
} 