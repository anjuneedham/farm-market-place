import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireSession } from '@/lib/auth/session';
import { db } from '@/lib/db/repositories';
import { NewMessageForm } from './NewMessageForm';

export const metadata: Metadata = { title: 'New Message' };

export default async function NewMessagePage({
  searchParams,
}: {
  searchParams: Promise<{ recipient?: string; listing?: string }>;
}) {
  const { user } = await requireSession('/messages/new');
  const { recipient, listing: listingId } = await searchParams;
  if (!recipient) notFound();

  const recipientUser = db.users.byId(recipient);
  if (!recipientUser || recipientUser.id === user.id) notFound();

  const display = db.profiles.displayFor(recipient);
  const listing = listingId ? db.listings.byId(listingId) : undefined;

  return (
    <div className="mx-auto max-w-md px-4 py-8 sm:px-6">
      <h1 className="text-h1">Message {display.label}</h1>
      {listing ? <p className="mt-1 text-sm text-brand-600">Re: {listing.title}</p> : null}
      <div className="mt-6">
        <NewMessageForm recipientId={recipient} recipientLabel={display.label} listingId={listing?.id} />
      </div>
    </div>
  );
}
