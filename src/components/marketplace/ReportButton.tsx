'use client';

import { useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Flag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormError, FormSuccess, Select, Textarea } from '@/components/ui/Field';
import { reportContentAction } from '@/app/market/actions';
import { initialFormState } from '@/lib/forms';
import type { ReportTargetType } from '@/lib/types';

const REASONS = ['Misleading listing', 'Prohibited item', 'Suspected scam', 'Offensive content', 'Other'];

export function ReportButton({
  targetType,
  targetId,
  signedIn,
}: {
  targetType: ReportTargetType;
  targetId: string;
  signedIn: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(reportContentAction, initialFormState);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() =>
          signedIn ? setOpen(true) : router.push(`/signin?next=${encodeURIComponent(window.location.pathname)}`)
        }
        className="flex items-center gap-1.5 text-xs text-ink-400 hover:text-danger"
      >
        <Flag className="h-3.5 w-3.5" aria-hidden />
        Report
      </button>
    );
  }

  if (state.status === 'idle' && state.message === 'reported') {
    return <FormSuccess message="Thanks — our team will review this." />;
  }

  return (
    <form action={formAction} className="w-full max-w-sm space-y-2 rounded-lg border border-line bg-surface p-4">
      <input type="hidden" name="targetType" value={targetType} />
      <input type="hidden" name="targetId" value={targetId} />
      <FormError message={state.status === 'error' ? state.message : undefined} />
      <Select name="reason" required defaultValue="">
        <option value="" disabled>
          Reason for report
        </option>
        {REASONS.map((reason) => (
          <option key={reason} value={reason}>
            {reason}
          </option>
        ))}
      </Select>
      <Textarea name="details" placeholder="Additional details (optional)" rows={2} />
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? 'Submitting…' : 'Submit report'}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
