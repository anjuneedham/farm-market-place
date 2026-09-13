/**
 * Shared form-state shape for useActionState. Kept out of any "use server"
 * file — a Server Actions module may only export async functions.
 */
export type FormState = {
  status: 'idle' | 'error';
  message?: string;
  fields?: Record<string, string>;
};

export const initialFormState: FormState = { status: 'idle' };
