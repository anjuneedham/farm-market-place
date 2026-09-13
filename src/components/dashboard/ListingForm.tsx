'use client';

import { useActionState, useState } from 'react';
import { Field, FormError, Input, Select, Textarea } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { AVAILABILITIES, PRICING_MODES } from '@/lib/types';
import { humanise } from '@/lib/utils';
import { initialFormState } from '@/lib/forms';
import type { Category, Listing, PriceTier, Product, Region } from '@/lib/types';

type Action = (prevState: import('@/lib/forms').FormState, formData: FormData) => Promise<import('@/lib/forms').FormState>;

export function ListingForm({
  action,
  categories,
  products,
  regions,
  defaultCountryLabel,
  listing,
  tiers = [],
  submitLabel,
}: {
  action: Action;
  categories: Category[];
  products: Product[];
  regions: Region[];
  defaultCountryLabel: string;
  listing?: Listing;
  tiers?: PriceTier[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialFormState);
  const [pricingMode, setPricingMode] = useState(listing?.pricingMode ?? 'FIXED');
  const [categoryId, setCategoryId] = useState(listing?.categoryId ?? '');
  type TierRow = { id: string; minQuantity: number; unitPrice: number; label?: string };
  const [tierRows, setTierRows] = useState<TierRow[]>(
    tiers.length > 0 ? tiers : [{ id: 'new-0', minQuantity: 0, unitPrice: 0, label: '' }],
  );

  const filteredProducts = products.filter((p) => p.categoryId === categoryId);

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      <FormError message={state.status === 'error' ? state.message : undefined} />

      <Field label="Title" required error={state.fields?.title}>
        {({ id, describedBy, invalid }) => (
          <Input
            id={id}
            name="title"
            required
            defaultValue={listing?.title}
            placeholder="e.g. Fresh Scotch Bonnet Pepper"
            aria-describedby={describedBy}
            invalid={invalid}
          />
        )}
      </Field>

      <Field label="Description" required error={state.fields?.description}>
        {({ id, describedBy, invalid }) => (
          <Textarea
            id={id}
            name="description"
            required
            rows={5}
            defaultValue={listing?.description}
            aria-describedby={describedBy}
            invalid={invalid}
          />
        )}
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Category" required error={state.fields?.categoryId}>
          {({ id, describedBy, invalid }) => (
            <Select
              id={id}
              name="categoryId"
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              aria-describedby={describedBy}
              invalid={invalid}
            >
              <option value="" disabled>
                Choose a category
              </option>
              {categories
                .filter((c) => c.level === 1)
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </Select>
          )}
        </Field>

        <Field label="Product (optional)" hint="Matching a catalogue product helps buyers find you in search.">
          {({ id }) => (
            <Select id={id} name="productId" defaultValue={listing?.productId ?? ''}>
              <option value="">Not in catalogue / other</option>
              {filteredProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Parish" required error={state.fields?.regionId} hint={defaultCountryLabel}>
          {({ id, describedBy, invalid }) => (
            <Select id={id} name="regionId" required defaultValue={listing?.regionId ?? ''} aria-describedby={describedBy} invalid={invalid}>
              <option value="" disabled>
                Choose a parish
              </option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <Field label="Unit" required error={state.fields?.unit}>
          {({ id, describedBy, invalid }) => (
            <Input id={id} name="unit" required defaultValue={listing?.unit ?? 'lb'} aria-describedby={describedBy} invalid={invalid} />
          )}
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Pricing mode" required>
          {({ id }) => (
            <Select
              id={id}
              name="pricingMode"
              required
              value={pricingMode}
              onChange={(e) => setPricingMode(e.target.value as typeof pricingMode)}
            >
              {PRICING_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {humanise(mode)}
                </option>
              ))}
            </Select>
          )}
        </Field>

        {pricingMode !== 'CONTACT_FOR_PRICE' ? (
          <Field label="Price (minor units)" hint="e.g. 85000 = $850.00" error={state.fields?.priceMinor}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                name="priceMinor"
                type="number"
                min={0}
                step={1}
                defaultValue={listing?.priceMinor}
                aria-describedby={describedBy}
                invalid={invalid}
              />
            )}
          </Field>
        ) : (
          <div />
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Quantity available">
          {({ id }) => <Input id={id} name="quantity" type="number" min={0} step="any" defaultValue={listing?.quantity} />}
        </Field>
        <Field label="Minimum order">
          {({ id }) => <Input id={id} name="minOrder" type="number" min={0} step="any" defaultValue={listing?.minOrder} />}
        </Field>
        <Field label="Availability" required>
          {({ id }) => (
            <Select id={id} name="availability" required defaultValue={listing?.availability ?? 'IN_STOCK'}>
              {AVAILABILITIES.map((availability) => (
                <option key={availability} value={availability}>
                  {humanise(availability)}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>

      <div className="flex items-center gap-2 rounded-[10px] border border-line-strong px-3 py-2.5">
        <input
          type="checkbox"
          id="wholesaleAvailable"
          name="wholesaleAvailable"
          value="true"
          defaultChecked={listing?.wholesaleAvailable}
          className="h-5 w-5 accent-brand-600"
        />
        <label htmlFor="wholesaleAvailable" className="text-sm text-ink-800">
          Wholesale pricing available
        </label>
      </div>

      <fieldset className="rounded-lg border border-line p-4">
        <legend className="px-1 text-sm font-medium text-ink-800">Bulk / wholesale price tiers (optional)</legend>
        <div className="space-y-3">
          {tierRows.map((tier, index) => (
            <div key={tier.id} className="grid grid-cols-3 gap-2">
              <Input
                name="tierMinQuantity"
                type="number"
                min={0}
                step="any"
                placeholder="Min qty"
                defaultValue={tier.minQuantity || undefined}
                aria-label={`Tier ${index + 1} minimum quantity`}
              />
              <Input
                name="tierUnitPrice"
                type="number"
                min={0}
                step={1}
                placeholder="Price (minor units)"
                defaultValue={tier.unitPrice || undefined}
                aria-label={`Tier ${index + 1} price`}
              />
              <Input
                name="tierLabel"
                placeholder="Label (optional)"
                defaultValue={tier.label}
                aria-label={`Tier ${index + 1} label`}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setTierRows((rows) => [...rows, { id: `new-${rows.length}`, minQuantity: 0, unitPrice: 0, label: '' }])}
          className="mt-3 text-sm font-medium text-brand-600 hover:underline"
        >
          + Add another tier
        </button>
      </fieldset>

      <Button type="submit" disabled={pending}>
        {pending ? 'Saving…' : submitLabel}
      </Button>
    </form>
  );
}
