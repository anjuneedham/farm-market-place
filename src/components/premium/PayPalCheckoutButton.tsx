'use client';

import Script from 'next/script';
import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormError, FormSuccess } from '@/components/ui/Field';
import { Skeleton } from '@/components/ui/States';
import { capturePaypalOrderAction, createPaypalOrderAction } from '@/app/premium/actions';

// PayPal's JS SDK attaches itself to window; there is no @types package for
// the specific shape we use, so this is deliberately narrow rather than `any`.
type PayPalButtonsInstance = { render: (target: HTMLElement) => void };
type PayPalNamespace = {
  Buttons: (config: {
    style?: Record<string, string | number>;
    createOrder: () => Promise<string>;
    onApprove: (data: { orderID: string }) => Promise<void>;
    onError: (error: unknown) => void;
    onCancel?: () => void;
  }) => PayPalButtonsInstance;
};

declare global {
  interface Window {
    paypal?: PayPalNamespace;
  }
}

/**
 * Renders PayPal's own Smart Buttons (Express Checkout) for one plan.
 *
 * The client never decides what was purchased or for how much — it only
 * asks the server for an order id (createPaypalOrderAction, which looks up
 * the plan's admin-set PayPal price) and then tells the server which order
 * the buyer approved (capturePaypalOrderAction, which reads the paid amount
 * and plan back from PayPal's own response). See src/app/premium/actions.ts.
 */
export function PayPalCheckoutButton({
  planId,
  clientId,
  currency,
}: {
  planId: string;
  clientId: string;
  currency: string;
}) {
  const router = useRouter();
  const [sdkReady, setSdkReady] = useState(false);
  const [error, setError] = useState<string>();
  const [succeeded, setSucceeded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderedRef = useRef(false);

  const renderButtons = useCallback(() => {
    if (renderedRef.current || !containerRef.current || !window.paypal) return;
    renderedRef.current = true;

    window.paypal
      .Buttons({
        style: { layout: 'horizontal', color: 'gold', label: 'paypal', height: 45 },
        createOrder: async () => {
          setError(undefined);
          const result = await createPaypalOrderAction(planId);
          if (!result.ok) {
            setError(result.error.message);
            throw new Error(result.error.message);
          }
          return result.data.orderId;
        },
        onApprove: async (data) => {
          const result = await capturePaypalOrderAction(data.orderID);
          if (!result.ok) {
            setError(result.error.message);
            return;
          }
          setSucceeded(true);
          router.refresh();
        },
        onError: () => {
          setError('PayPal ran into a problem. Please try again.');
        },
      })
      .render(containerRef.current);
  }, [planId, router]);

  if (succeeded) {
    return <FormSuccess message="Payment received — your Premium subscription is active." />;
  }

  return (
    <div>
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=${encodeURIComponent(currency)}&intent=capture`}
        onLoad={() => {
          setSdkReady(true);
          renderButtons();
        }}
        strategy="lazyOnload"
      />
      <FormError message={error} />
      {!sdkReady ? <Skeleton className="h-11 w-full" /> : null}
      <div ref={containerRef} className="mt-2" />
    </div>
  );
}
