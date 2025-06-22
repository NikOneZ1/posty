import React from "react"

export default function HeroScreenshot() {
  return (
    <div className="bg-base-100 border border-base-200 rounded-xl shadow-md p-6 w-full max-w-md">
      <ul className="space-y-3">
        <li className="flex items-center justify-between bg-base-200 rounded-lg p-3">
          <span className="text-sm">Launch new product campaign</span>
          <span className="badge badge-sm badge-info">New</span>
        </li>
        <li className="flex items-center justify-between bg-base-200 rounded-lg p-3">
          <span className="text-sm">Share behind-the-scenes video</span>
          <span className="badge badge-sm badge-primary">Generated</span>
        </li>
        <li className="flex items-center justify-between bg-base-200 rounded-lg p-3">
          <span className="text-sm">Customer testimonial highlight</span>
          <span className="badge badge-sm badge-success">Ready</span>
        </li>
      </ul>
      <div className="mt-6 flex justify-center gap-2">
        <button className="btn btn-sm btn-primary">Regenerate</button>
        <button className="btn btn-sm btn-outline">Rewrite</button>
        <button className="btn btn-sm btn-secondary">Schedule</button>
      </div>
    </div>
  )
}
