'use client';

import { useActionState, useState } from 'react';
import { Checkbox, Field, FormError, FormSuccess, Input, Select, Textarea } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { FARMING_METHODS, type FarmProfile, type Region, type Community, type User } from '@/lib/types';
import { humanise } from '@/lib/utils';
import { updateFarmProfileAction } from '../actions';
import { initialFormState } from '@/lib/forms';

export function FarmProfileForm({
  farm,
  user,
  regions,
  communities,
}: {
  farm: FarmProfile | null;
  user: User;
  regions: Region[];
  communities: Community[];
}) {
  const [state, formAction, pending] = useActionState(updateFarmProfileAction, initialFormState);
  const [regionId, setRegionId] = useState(farm?.regionId ?? '');
  const [methods, setMethods] = useState<Set<string>>(new Set(farm?.methods ?? []));

  return (
    <form action={formAction} className="space-y-5">
      <FormError message={state.status === 'error' ? state.message : undefined} />
      {state.status === 'idle' && state.message === 'saved' ? <FormSuccess message="Saved." /> : null}

      <Field label="Farm name" required error={state.fields?.name}>
        {({ id, describedBy, invalid }) => (
          <Input id={id} name="name" defaultValue={farm?.name} required aria-describedby={describedBy} invalid={invalid} />
        )}
      </Field>

      <Field label="Tagline" hint="One line buyers see first." error={state.fields?.tagline}>
        {({ id }) => <Input id={id} name="tagline" defaultValue={farm?.tagline} maxLength={140} />}
      </Field>

      <Field label="Your farm's story" error={state.fields?.story}>
        {({ id }) => <Textarea id={id} name="story" defaultValue={farm?.story} rows={5} maxLength={4000} />}
      </Field>

      <Field label="Parish" required error={state.fields?.regionId}>
        {({ id, describedBy, invalid }) => (
          <Select
            id={id}
            name="regionId"
            required
            value={regionId}
            onChange={(e) => setRegionId(e.target.value)}
            aria-describedby={describedBy}
            invalid={invalid}
          >
            <option value="" disabled>
              Choose your parish
            </option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </Select>
        )}
      </Field>

      {communities.length > 0 && communities.some((c) => c.id.startsWith(regionId)) ? (
        <Field label="Community" hint="Optional.">
          {({ id }) => (
            <Select id={id} name="communityId" defaultValue={farm?.communityId ?? ''}>
              <option value="">Not specified</option>
              {communities
                .filter((c) => c.id.startsWith(regionId))
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </Select>
          )}
        </Field>
      ) : null}

      <div className="grid grid-cols-2 gap-4">
        <Field label="Years farming">
          {({ id }) => (
            <Input id={id} name="yearsFarming" type="number" min={0} max={100} defaultValue={farm?.yearsFarming} />
          )}
        </Field>
        <Field label="Farm size (acres)">
          {({ id }) => (
            <Input id={id} name="farmSizeAcres" type="number" min={0} step="0.1" defaultValue={farm?.farmSizeAcres} />
          )}
        </Field>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-ink-800">Farming methods</legend>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {FARMING_METHODS.map((method) => (
            <Checkbox
              key={method}
              label={humanise(method)}
              name="methods"
              value={method}
              checked={methods.has(method)}
              onChange={(e) =>
                setMethods((prev) => {
                  const next = new Set(prev);
                  if (e.target.checked) next.add(method);
                  else next.delete(method);
                  return next;
                })
              }
            />
          ))}
        </div>
      </fieldset>

      <Field label="Specialties" hint="One per line — what you grow or raise.">
        {({ id }) => <Textarea id={id} name="specialties" defaultValue={farm?.specialties?.join('\n')} rows={4} />}
      </Field>

      <div className="space-y-2">
        <Checkbox label="I accept pickup at the farm" name="acceptsPickup" defaultChecked={farm?.acceptsPickup ?? true} />
        <Checkbox label="I offer delivery" name="acceptsDelivery" defaultChecked={farm?.acceptsDelivery ?? false} />
      </div>

      <Field label="Delivery notes" hint="Optional — areas covered, minimum order, etc.">
        {({ id }) => <Textarea id={id} name="deliveryNotes" defaultValue={farm?.deliveryNotes} rows={2} maxLength={280} />}
      </Field>

      <Field label="WhatsApp" hint="Optional — lets buyers reach you directly.">
        {({ id }) => <Input id={id} name="whatsapp" defaultValue={user.whatsapp} maxLength={24} />}
      </Field>

      <Button type="submit" disabled={pending}>
        {pending ? 'Saving…' : 'Save farm profile'}
      </Button>
    </form>
  );
}
