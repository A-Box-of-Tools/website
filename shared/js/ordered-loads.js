/**
 * Appending batches preserves selection order even when reads finish at
 * different times. Reset starts a new queue immediately; a retired read may
 * settle later but cannot append, report an error or clear the new busy state.
 */
export function orderedLoads({ read, complete, status }) {
  let generation = 0;
  let pending = 0;
  let tail = Promise.resolve();
  return {
    get pending() { return pending; },
    add(values) {
      const batch = Array.from(values);
      if (!batch.length) return Promise.resolve();
      const owner = generation;
      pending += batch.length;
      status(pending);
      const work = tail.then(async () => {
        const items = [], errors = [];
        try {
          for (const value of batch) {
            if (owner !== generation) return;
            try {
              const item = await read(value);
              if (owner !== generation) return;
              items.push(item);
            } catch (error) {
              if (owner !== generation) return;
              errors.push({ value, error });
            }
          }
          if (owner === generation) complete({ items, errors });
        } finally {
          if (owner === generation) {
            pending -= batch.length;
            status(pending);
          }
        }
      });
      tail = work.catch(() => {});
      return work;
    },
    reset() {
      generation += 1;
      pending = 0;
      tail = Promise.resolve();
      status(0);
    },
  };
}
