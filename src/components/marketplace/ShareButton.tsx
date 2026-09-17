'use client';

import { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Check, Share2 } from 'lucide-react';
import { IconButton } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

/**
 * Inside the Android app shell, uses Capacitor's native share sheet
 * (`@capacitor/share`) — the same JS bundle runs there since AgriLoop's
 * native shell loads the live site remotely rather than a bundled build
 * (see capacitor.config.ts), so `Capacitor.isNativePlatform()` correctly
 * tells the two apart at runtime. On the plain web app, behaviour is
 * unchanged: the Web Share API where supported, else copy-link with an
 * inline "copied" confirmation. Never fails silently — a copy failure just
 * leaves the button unchanged rather than claiming success.
 */
export function ShareButton({ title, className }: { title: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    const url = window.location.href;

    if (Capacitor.isNativePlatform()) {
      try {
        await Share.share({ title, url });
      } catch {
        // The user cancelled the native share sheet — not an error.
      }
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // The user cancelled the native share sheet — not an error.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access denied; nothing to fall back to short of showing
      // the raw link, which would be more confusing than a no-op here.
    }
  }

  return (
    <IconButton
      label={copied ? 'Link copied' : 'Share'}
      onClick={handleClick}
      className={cn('border border-line-strong', className)}
    >
      {copied ? <Check className="h-5 w-5 text-positive" aria-hidden /> : <Share2 className="h-5 w-5" aria-hidden />}
    </IconButton>
  );
}
