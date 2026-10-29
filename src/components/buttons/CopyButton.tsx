import React, { useState } from 'react';
import { Button } from './Button';

interface CopyButtonProps {
  textToCopy: string;
  label?: string;
  copiedLabel?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md';
  className?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  textToCopy,
  label = 'Copy',
  copiedLabel = 'Copied!',
  variant = 'outline',
  size = 'sm',
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  return (
    <Button
      type="button"
      variant={copied ? 'secondary' : variant}
      size={size}
      icon={copied ? 'Check' : 'Copy'}
      onClick={handleCopy}
      className={className}
    >
      {copied ? copiedLabel : label}
    </Button>
  );
};
