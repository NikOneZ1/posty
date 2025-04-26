import React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
}

export function Button({ children, className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`bg-black text-white rounded-full px-5 py-2 text-sm font-medium shadow-sm hover:bg-gray-900 transition-colors disabled:opacity-60 cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </button>
  )
} 