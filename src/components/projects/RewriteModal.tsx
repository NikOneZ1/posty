import React from 'react'
import { Modal } from '@/components/ui/Modal'
import { RewriteAction } from '@/services/content'

type RewriteActionState =
  | RewriteAction
  | 'tone_professional'
  | 'tone_empathetic'
  | 'tone_casual'
  | 'tone_neutral'
  | 'tone_educational'

interface RewriteModalProps {
  open: boolean
  onClose: () => void
  customPrompt: string
  setCustomPrompt: (v: string) => void
  isRewriting: boolean
  rewriteAction: RewriteActionState | null
  onCustomRewrite: () => void
  onShorten: () => void
  onExpand: () => void
  onFix: () => void
  onTone: (tone: 'professional'|'empathetic'|'casual'|'neutral'|'educational') => void
}

export function RewriteModal({
  open,
  onClose,
  customPrompt,
  setCustomPrompt,
  isRewriting,
  rewriteAction,
  onCustomRewrite,
  onShorten,
  onExpand,
  onFix,
  onTone,
}: RewriteModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Rewrite Options">
      <div className="space-y-3 text-sm">
        <input
          type="text"
          placeholder="write with ai or select from below"
          className="input input-bordered input-sm w-full"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
        />
        <button
          onClick={onCustomRewrite}
          className="btn btn-primary btn-sm w-full"
          disabled={isRewriting}
        >
          {isRewriting && rewriteAction === 'custom' ? 'Rewriting...' : 'Rewrite'}
        </button>
        <ul className="menu p-0">
          <li>
            <button onClick={onShorten} disabled={isRewriting}>
              {isRewriting && rewriteAction === 'shorten' ? 'Shortening...' : 'Shorten'}
            </button>
          </li>
          <li>
            <button onClick={onExpand} disabled={isRewriting}>
              {isRewriting && rewriteAction === 'expand' ? 'Expanding...' : 'Expand'}
            </button>
          </li>
          <li>
            <button onClick={onFix} disabled={isRewriting}>
              {isRewriting && rewriteAction === 'fix' ? 'Fixing...' : 'Fix Grammar'}
            </button>
          </li>
          <li className="mt-2 font-medium">Change tone to:</li>
          <li>
            <button onClick={() => onTone('professional')} disabled={isRewriting}>
              {isRewriting && rewriteAction === 'tone_professional' ? 'Changing...' : 'Professional'}
            </button>
          </li>
          <li>
            <button onClick={() => onTone('empathetic')} disabled={isRewriting}>
              {isRewriting && rewriteAction === 'tone_empathetic' ? 'Changing...' : 'Empathetic'}
            </button>
          </li>
          <li>
            <button onClick={() => onTone('casual')} disabled={isRewriting}>
              {isRewriting && rewriteAction === 'tone_casual' ? 'Changing...' : 'Casual'}
            </button>
          </li>
          <li>
            <button onClick={() => onTone('neutral')} disabled={isRewriting}>
              {isRewriting && rewriteAction === 'tone_neutral' ? 'Changing...' : 'Neutral'}
            </button>
          </li>
          <li>
            <button onClick={() => onTone('educational')} disabled={isRewriting}>
              {isRewriting && rewriteAction === 'tone_educational' ? 'Changing...' : 'Educational'}
            </button>
          </li>
        </ul>
      </div>
    </Modal>
  )
}
