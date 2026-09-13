import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { type DataSet } from './dataset';
import { buildReferenceDataSet, buildSeedDataSet } from './seed';

/**
 * Data source binding.
 *
 * The MVP ships `MemoryDataSource`: a process-local store hydrated from the
 * seed modules and, in development, persisted to a git-ignored JSON file so
 * signups and listings survive a restart.
 *
 * It is NOT production-safe — no durability guarantees, no cross-instance
 * consistency — and says so at startup. Production requires the Prisma adapter
 * described in docs/DATABASE_SCHEMA.md § Migration path. Everything above the
 * repository layer is unaffected by which adapter is bound.
 */

export interface DataSource {
  readonly kind: 'memory' | 'prisma';
  /** Read-only view of the data. Callers must not mutate the result. */
  read(): DataSet;
  /** Apply a mutation and persist it. */
  mutate<T>(fn: (data: DataSet) => T): T;
}

const PERSIST_PATH = join(process.cwd(), '.data', 'agriloop.json');

class MemoryDataSource implements DataSource {
  readonly kind = 'memory' as const;

  private data: DataSet;
  private readonly persist: boolean;

  constructor() {
    this.persist = process.env.NODE_ENV === 'development';
    this.data = this.load();
  }

  private load(): DataSet {
    if (this.persist) {
      try {
        const raw = readFileSync(PERSIST_PATH, 'utf8');
        return JSON.parse(raw) as DataSet;
      } catch {
        // No persisted file yet — fall through to a fresh seed.
      }
    }

    const seedDemo = process.env.AGRILOOP_SEED_DEMO_DATA !== 'false';
    const isProduction = process.env.NODE_ENV === 'production';
    const allowInProduction = process.env.ALLOW_SEED_IN_PRODUCTION === 'true';

    if (seedDemo && (!isProduction || allowInProduction)) {
      return buildSeedDataSet();
    }
    return buildReferenceDataSet();
  }

  private save(): void {
    if (!this.persist) return;
    try {
      mkdirSync(dirname(PERSIST_PATH), { recursive: true });
      writeFileSync(PERSIST_PATH, JSON.stringify(this.data), 'utf8');
    } catch (error) {
      console.warn('[agriloop] could not persist development data:', error);
    }
  }

  read(): DataSet {
    return this.data;
  }

  mutate<T>(fn: (data: DataSet) => T): T {
    const result = fn(this.data);
    this.save();
    return result;
  }
}

/**
 * Next.js re-evaluates modules across hot reloads, so the instance is parked on
 * globalThis to keep one store per process in development.
 */
const globalForData = globalThis as unknown as { __agriloopDataSource?: DataSource };

function createDataSource(): DataSource {
  const configured = process.env.AGRILOOP_DATA_SOURCE ?? 'memory';

  if (configured === 'prisma') {
    throw new Error(
      'AGRILOOP_DATA_SOURCE=prisma is not implemented yet. The Postgres schema is ready at ' +
        'prisma/schema.prisma; implementing PrismaDataSource against the repository interfaces ' +
        'is the first post-MVP task (docs/MVP_ROADMAP.md). Set AGRILOOP_DATA_SOURCE=memory to ' +
        'run the MVP.',
    );
  }

  if (process.env.NODE_ENV === 'production') {
    console.warn(
      '[agriloop] Running on the in-memory data source in production. Data is not durable and ' +
        'is not shared between instances. See docs/DATABASE_SCHEMA.md § Migration path.',
    );
  }

  return new MemoryDataSource();
}

export function dataSource(): DataSource {
  globalForData.__agriloopDataSource ??= createDataSource();
  return globalForData.__agriloopDataSource;
}

/** Read-only access to the dataset. Mutations must go through `mutate`. */
export function data(): DataSet {
  return dataSource().read();
}

export function mutate<T>(fn: (data: DataSet) => T): T {
  return dataSource().mutate(fn);
}
