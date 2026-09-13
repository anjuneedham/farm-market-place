import { type AIContext, type AIService, type ServiceResult, notConfigured } from './types';

/**
 * AgriLoop AI is designed and deliberately not built.
 *
 * A farm assistant that answers "what is wrong with my tomato plant?" with a
 * plausible guess would do real harm — a wrong answer costs a farmer a crop.
 * The interface exists; the UI renders an explicit "not available yet" state
 * explaining what has to exist first (real farm records to ground answers).
 *
 * There is no simulated response anywhere in this codebase.
 */
export class UnavailableAIService implements AIService {
  isConfigured(): boolean {
    return false;
  }

  status(): string {
    return 'AgriLoop AI is not available yet. It will launch grounded in your own farm records and the Academy, and it will say when it does not know.';
  }

  async ask(_question: string, _context: AIContext): Promise<ServiceResult<{ answer: string }>> {
    return notConfigured('AgriLoop AI');
  }
}
