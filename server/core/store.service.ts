import { Injectable, type OnModuleInit } from '@nestjs/common'
import {
  flushDb,
  getProjectId,
  getProjectRequirementIds,
  loadDb,
  mutate,
  persist,
  type DbState,
} from '../db/store.js'
import { seedIfEmpty } from '../db/seed.js'

/**
 * Injectable facade over the functional store layer. The store keeps a single
 * in-memory cache hydrated from MySQL (via Prisma); this service exposes it to
 * controllers through Nest DI. The underlying functions and the services that
 * import them directly all share the same singleton cache.
 */
@Injectable()
export class StoreService implements OnModuleInit {
  /** Hydrate from MySQL and seed on first boot, before any request is served. */
  async onModuleInit(): Promise<void> {
    await seedIfEmpty()
  }

  loadDb(): DbState {
    return loadDb()
  }

  mutate(fn: (state: DbState) => void): DbState {
    return mutate(fn)
  }

  persist(state: DbState): void {
    persist(state)
  }

  flushDb(): Promise<void> {
    return flushDb()
  }

  getProjectId(): string {
    return getProjectId()
  }

  getProjectRequirementIds(projectId: string): Set<string> {
    return getProjectRequirementIds(projectId)
  }
}
