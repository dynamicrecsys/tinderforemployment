// In-memory store for development (replaces Redis)
// Swap this out for real Redis in production

const store = new Map<string, { value: string; expiresAt: number | null }>();

// Cleanup expired keys periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.expiresAt && entry.expiresAt < now) {
      store.delete(key);
    }
  }
}, 30_000);

export const memoryStore = {
  async set(key: string, value: string, options?: { EX?: number }) {
    const expiresAt = options?.EX ? Date.now() + options.EX * 1000 : null;
    store.set(key, { value, expiresAt });
  },

  async get(key: string): Promise<string | null> {
    const entry = store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      store.delete(key);
      return null;
    }
    return entry.value;
  },

  async del(key: string) {
    store.delete(key);
  },
};

export async function connectStore() {
  console.log('In-memory store ready (no Redis)');
}
