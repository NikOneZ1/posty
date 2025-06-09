import { useState } from 'react';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  text: string;
  className?: string;
}

export function CopyButton({ text, className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  return (
    <button onClick={handleCopy} className={cn('btn', className)}>
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}
