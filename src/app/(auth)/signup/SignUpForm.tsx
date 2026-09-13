'use client';

import { useActionState, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Field, FormError, Input, Select } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { BUSINESS_TYPES, BUYER_TYPES, type UserRole } from '@/lib/types';
import { humanise } from '@/lib/utils';
import { jamaicaRegions } from '@/lib/location';
import { signUpAction } from '../actions';
import { initialFormState } from '@/lib/forms';

const REGIONS = jamaicaRegions();

const ROLES: Array<{ value: UserRole; title: string; description: string }> = [
  { value: 'FARMER', title: "I'm a Farmer", description: 'List products, find buyers, grow your business.' },
  { value: 'BUYER', title: "I'm a Buyer", description: 'Source produce, post requests, save on Premium.' },
  { value: 'BUSINESS', title: 'Agricultural Business', description: 'Sell supplies, equipment or services.' },
];

export function SignUpForm() {
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role');
  const initialRole: UserRole =
    roleParam === 'FARMER' || roleParam === 'BUYER' || roleParam === 'BUSINESS' ? roleParam : 'FARMER';

  const [role, setRole] = useState<UserRole>(initialRole);
  const [state, formAction, pending] = useActionState(signUpAction, initialFormState);

  return (
    <form action={formAction} className="space-y-5">
      <FormError message={state.status === 'error' ? state.message : undefined} />

      <div role="radiogroup" aria-label="I am a…" className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {ROLES.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={role === option.value}
            onClick={() => setRole(option.value)}
            className={`rounded-lg border p-3 text-left transition-colors ${
              role === option.value
                ? 'border-brand-600 bg-brand-50'
                : 'border-line-strong hover:border-brand-300'
            }`}
          >
            <p className="text-sm font-semibold text-ink-900">{option.title}</p>
            <p className="mt-0.5 text-xs text-ink-500">{option.description}</p>
          </button>
        ))}
      </div>
      <input type="hidden" name="role" value={role} />

      <Field label="Full name" required error={state.fields?.name}>
        {({ id, describedBy, invalid }) => (
          <Input id={id} name="name" autoComplete="name" required aria-describedby={describedBy} invalid={invalid} />
        )}
      </Field>

      <Field label="Email address" required error={state.fields?.email}>
        {({ id, describedBy, invalid }) => (
          <Input id={id} name="email" type="email" autoComplete="email" required aria-describedby={describedBy} invalid={invalid} />
        )}
      </Field>

      <Field label="Password" hint="At least 10 characters." required error={state.fields?.password}>
        {({ id, describedBy, invalid }) => (
          <Input
            id={id}
            name="password"
            type="password"
            autoComplete="new-password"
            required
            aria-describedby={describedBy}
            invalid={invalid}
          />
        )}
      </Field>

      <Field label="Parish" required error={state.fields?.regionId}>
        {({ id, describedBy, invalid }) => (
          <Select id={id} name="regionId" required aria-describedby={describedBy} invalid={invalid} defaultValue="">
            <option value="" disabled>
              Choose your parish
            </option>
            {REGIONS.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </Select>
        )}
      </Field>

      {role === 'FARMER' ? (
        <Field label="Farm name" required error={state.fields?.farmName}>
          {({ id, describedBy, invalid }) => (
            <Input id={id} name="farmName" required aria-describedby={describedBy} invalid={invalid} />
          )}
        </Field>
      ) : null}

      {role === 'BUSINESS' ? (
        <>
          <Field label="Business name" required error={state.fields?.businessName}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} name="businessName" required aria-describedby={describedBy} invalid={invalid} />
            )}
          </Field>
          <Field label="Business type" required>
            {({ id }) => (
              <Select id={id} name="businessType" required defaultValue="">
                <option value="" disabled>
                  Choose a type
                </option>
                {BUSINESS_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {humanise(type)}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </>
      ) : null}

      {role === 'BUYER' ? (
        <>
          <Field label="Buyer type" required>
            {({ id }) => (
              <Select id={id} name="buyerType" required defaultValue="HOUSEHOLD">
                {BUYER_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {humanise(type)}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Organisation" hint="Optional — restaurant, hotel or business name.">
            {({ id }) => <Input id={id} name="organisation" />}
          </Field>
        </>
      ) : null}

      <Button type="submit" fullWidth disabled={pending}>
        {pending ? 'Creating your account…' : 'Create account'}
      </Button>

      <p className="text-center text-xs text-ink-400">
        By joining, you agree to AgriLoop's{' '}
        <a href="/guidelines" className="underline">
          Community Guidelines
        </a>
        .
      </p>
    </form>
  );
}
