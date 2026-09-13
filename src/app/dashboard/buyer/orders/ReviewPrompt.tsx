'use client';

import { useActionState, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FormError, FormSuccess, Textarea } from '@/components/ui/Field';
import { StarInput } from '@/components/ui/Rating';
import { initialFormState } from '@/lib/forms';
import { submitReviewAction } from '../reviews-actions';

export function ReviewPrompt({ orderId, sellerName }: { orderId: string; sellerName: string }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [state, formAction, pending] = useActionState(submitReviewAction, initialFormState);

  if (state.status === 'idle' && state.message === 'reviewed') {
    return <FormSuccess message="Thanks — your review was posted." />;
  }

  if (!open) {
    return (
      <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
        Leave a review
      </Button>
    );
  }

  return (
    <form action={formAction} className="w-full space-y-3 rounded-lg border border-line bg-canvas p-4">
      <input type="hidden" name="orderId" value={orderId} />
      <FormError message={state.status === 'error' ? state.message : undefined} />
      <p className="text-sm font-medium text-ink-800">Rate your experience with {sellerName}</p>
      <StarInput value={rating} onChange={setRating} name="rating" />
      <Textarea name="body" rows={2} placeholder="Optional written review" />
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? 'Submitting…' : 'Submit review'}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
