import React from "react"

export function FolderIcon({ className = "w-12 h-12 text-gray-300" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 48 48"
      stroke="currentColor"
      strokeWidth={1.5}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="4" y="14" width="40" height="24" rx="4" fill="currentColor" opacity="0.1" />
      <path
        d="M4 18a4 4 0 014-4h10l4 4h18a4 4 0 014 4v12a4 4 0 01-4 4H8a4 4 0 01-4-4V18z"
        stroke="currentColor"
        strokeWidth={2}
        fill="none"
      />
    </svg>
  )
} 