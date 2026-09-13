import type { OrderStatus } from '@/lib/types';

/**
 * Valid order status transitions. Pure and dependency-free so client
 * components can import it directly without pulling in the server-only data
 * layer (docs/DATABASE_SCHEMA.md §3.6).
 */
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  REQUESTED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['READY', 'CANCELLED', 'DISPUTED'],
  READY: ['COMPLETED', 'CANCELLED', 'DISPUTED'],
  COMPLETED: ['DISPUTED'],
  CANCELLED: [],
  DISPUTED: ['COMPLETED', 'CANCELLED'],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from].includes(to);
}
