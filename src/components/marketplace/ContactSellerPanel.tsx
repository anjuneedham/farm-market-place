'use client';

import { useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormError, FormSuccess, Textarea } from '@/components/ui/Field';
import { contactSellerAction, QUICK_MESSAGES } from '@/app/market/actions';
import { initialFormState } from '@/lib/forms';
import type { ListingView } from '@/lib/types';

export function ContactSellerPanel({ listing, signedIn }: { listing: ListingView; signedIn: boolean }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(contactSellerAction, initialFormState);
  const [body, setBody] = useState('');

  if (!signedIn) {
    return (
      <Button
        fullWidth
        onClick={() => router.push(`/signin?next=${encodeURIComponent(`/market/listing/${listing.slug}`)}`)}
      >
        <MessageCircle className="h-4 w-4" aria-hidden />
        Contact Seller
      </Button>
    );
  }

  if (state.status === 'idle' && state.message === 'sent') {
    return (
      <div>
        <FormSuccess message="Message sent — check your inbox to continue the conversation." />
        <Button fullWidth variant="secondary" className="mt-3" onClick={() => router.push('/messages')}>
          Go to messages
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="recipientId" value={listing.sellerId} />
      <input type="hidden" name="listingId" value={listing.id} />
      <FormError message={state.status === 'error' ? state.message : undefined} />

      <div className="flex flex-wrap gap-1.5">
        {QUICK_MESSAGES.map((quick) => (
          <button
            key={quick.key}
            type="button"
            onClick={() => setBody(quick.body)}
            className="rounded-full border border-line-strong px-3 py-1 text-xs font-medium text-ink-600 hover:border-brand-300 hover:bg-brand-50"
          >
            {quick.label}
          </button>
        ))}
      </div>

      <Textarea
        name="body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={`Ask ${listing.sellerName} about this listing…`}
        rows={3}
        required
        aria-label="Message to seller"
      />

      <Button type="submit" fullWidth disabled={pending}>
        <MessageCircle className="h-4 w-4" aria-hidden />
        {pending ? 'Sending…' : 'Send message'}
      </Button>
    </form>
  );
}
