import { ButtonLink } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="text-micro text-brand-600">404</p>
      <h1 className="text-h1 mt-2">We couldn&apos;t find that.</h1>
      <p className="mt-3 text-ink-600">
        The page you&apos;re looking for may have moved, or the link might be out of date.
      </p>
      <div className="mt-6 flex gap-3">
        <ButtonLink href="/">Go home</ButtonLink>
        <ButtonLink href="/market" variant="secondary">
          Explore the market
        </ButtonLink>
      </div>
    </div>
  );
}
