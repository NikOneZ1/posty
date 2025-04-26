import React, { useEffect, useRef } from "react"

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [open, onClose])

  useEffect(() => {
    if (open && ref.current) {
      ref.current.focus()
    }
  }, [open])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20" tabIndex={-1}>
      <div
        ref={ref}
        className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 relative animate-fade-in outline-none"
        tabIndex={0}
      >
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl cursor-pointer"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        {title && <h2 className="text-xl font-bold mb-6">{title}</h2>}
        {children}
      </div>
    </div>
  )
} 