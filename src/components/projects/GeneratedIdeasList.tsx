import React from "react"
import { Idea } from "@/types/Idea"

export function GeneratedIdeasList({ ideas }: { ideas: Idea[] }) {
  if (!ideas.length) return null
  return (
    <div className="mb-12">
      <h2 className="text-xl font-bold mb-4">Generated Ideas</h2>
      <ul className="space-y-3">
        {ideas.map((idea) => (
          <li key={idea.id} className="bg-gray-50 border border-gray-100 rounded p-4 text-gray-800">
            {idea.idea_text}
          </li>
        ))}
      </ul>
    </div>
  )
} 