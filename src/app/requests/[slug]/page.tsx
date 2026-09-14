import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Clock, MapPin } from 'lucide-react';
import { db } from '@/lib/db/repositories';
import { getCurrentUser } from '@/lib/auth/session';
import { canSell } from '@/lib/auth/permissions';
import { Money } from '@/components/ui/Money';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { RespondForm } from './RespondForm';
import { ResponseActions } from './ResponseActions';
import { humanise, timeAgo } from '@/lib/utils';

export const revalidate = 30;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const request = db.buyerRequests.viewBySlug(slug);
  if (!request) return {};
  return { title: request.title, description: request.description.slice(0, 160) };
}

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const request = db.buyerRequests.viewBySlug(slug);
  if (!request) notFound();

  const user = await getCurrentUser();
  const responses = db.buyerRequests.responsesFor(request.id);
  const isOwner = user?.id === request.buyerId;
  const canRespond = user ? canSell(user) && !isOwner : false;
  const myResponse = user ? responses.find((r) => r.responderId === user.id) : undefined;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="brand">{humanise(request.frequency)}</Badge>
        {request.status !== 'OPEN' ? <Badge tone="neutral">{humanise(request.status)}</Badge> : null}
      </div>

      <h1 className="text-h1 mt-3">{request.title}</h1>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-ink-500">
        <span className="flex items-center gap-1.5">
          <MapPin className="h-4 w-4" aria-hidden />
          {request.community ? `${request.community.name}, ` : ''}
          {request.region.name}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" aria-hidden />
          Posted {timeAgo(request.createdAt)}
        </span>
      </div>

      <p className="mt-6 whitespace-pre-wrap text-ink-700">{request.description}</p>

      <dl className="mt-6 grid grid-cols-2 gap-4 rounded-lg border border-line bg-surface p-5 sm:grid-cols-4">
        {request.quantity ? (
          <div>
            <dt className="text-micro text-ink-500">Quantity</dt>
            <dd className="mt-1 font-medium">{request.quantity} {request.unit}</dd>
          </div>
        ) : null}
        <div>
          <dt className="text-micro text-ink-500">Budget</dt>
          <dd className="mt-1 font-medium">
            {request.budgetMinor ? <Money minor={request.budgetMinor} currency={request.currency} /> : 'Negotiable'}
          </dd>
        </div>
        <div>
          <dt className="text-micro text-ink-500">Frequency</dt>
          <dd className="mt-1 font-medium">{humanise(request.frequency)}</dd>
        </div>
        <div>
          <dt className="text-micro text-ink-500">Posted by</dt>
          <dd className="mt-1 font-medium">{request.buyerName}</dd>
        </div>
      </dl>

      <div className="mt-8">
        <h2 className="text-h2 mb-4">
          Responses {responses.length > 0 ? `(${responses.length})` : ''}
        </h2>

        {request.status !== 'OPEN' ? (
          <p className="rounded-lg border border-line bg-canvas p-4 text-sm text-ink-500">
            This request is no longer open.
          </p>
        ) : !user ? (
          <ButtonLink href={`/signin?next=${encodeURIComponent(`/requests/${request.slug}`)}`}>
            Sign in to respond
          </ButtonLink>
        ) : canRespond ? (
          <RespondForm requestId={request.id} existing={myResponse} />
        ) : isOwner ? (
          <p className="text-sm text-ink-500">Farmers and businesses can respond to your request below.</p>
        ) : (
          <p className="text-sm text-ink-500">Only farmers and agricultural businesses can respond to buyer requests.</p>
        )}

        {isOwner && responses.length > 0 ? (
          <div className="mt-6 space-y-4">
            {responses.map((response) => (
              <div key={response.id} className="rounded-lg border border-line bg-surface p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink-900">
                    {db.profiles.displayFor(response.responderId).label}
                  </p>
                  <span className="text-xs text-ink-400">{timeAgo(response.createdAt)}</span>
                </div>
                <p className="mt-1.5 text-sm text-ink-700">{response.message}</p>
                {response.quotedPriceMinor ? (
                  <p className="mt-2 text-sm font-medium text-brand-700">
                    Quoted: <Money minor={response.quotedPriceMinor} currency={response.currency ?? request.currency} />
                    {response.quotedQuantity ? ` for ${response.quotedQuantity} ${request.unit ?? ''}` : ''}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <ButtonLink href="/messages" size="sm" variant="secondary">
                    View conversation
                  </ButtonLink>
                  <ResponseActions responseId={response.id} initialStatus={response.status} />
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
