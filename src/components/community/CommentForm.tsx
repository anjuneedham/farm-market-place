'use client';

import { useActionState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { FormError, Textarea } from '@/components/ui/Field';
import { initialFormState } from '@/lib/forms';
import { addCommentAction } from '@/app/community/actions';

export function CommentForm({ postId, signedIn }: { postId: string; signedIn: boolean }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(addCommentAction, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);

  if (!signedIn) {
    return (
      <button
        type="button"
        onClick={() => router.push(`/signin?next=${encodeURIComponent(window.location.pathname)}`)}
        className="w-full rounded-lg border border-dashed border-line-strong p-4 text-center text-sm text-ink-500 hover:border-brand-300"
      >
        Sign in to join the conversation.
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await formAction(formData);
        formRef.current?.reset();
        router.refresh();
      }}
      className="space-y-2"
    >
      <input type="hidden" name="postId" value={postId} />
      <FormError message={state.status === 'error' ? state.message : undefined} />
      <Textarea name="body" required rows={3} placeholder="Add to the conversation…" aria-label="Comment" />
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? 'Posting…' : 'Post comment'}
        </Button>
      </div>
    </form>
  );
}
