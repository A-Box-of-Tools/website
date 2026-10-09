/**
 * Appending batches preserves selection order even when reads finish at
 * different times. Reset starts a new queue immediately; a retired read may
 * settle later but cannot append, report an error or clear the new busy state.
 */
// complete takes ownership of current items. Resource-owning readers may supply
// a synchronous discard callback for values that never reach that handoff.
export function orderedLoads({ read, complete, status, discard = () => {} }) {
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
        let transferred = false;
        try {
          for (const value of batch) {
            if (owner !== generation) return;
            try {
              const item = await read(value);
              if (owner !== generation) {
                discard(item);
                return;
              }
              items.push(item);
            } catch (error) {
              if (owner !== generation) return;
              errors.push({ value, error });
            }
          }
          if (owner === generation) {
            transferred = true;
            complete({ items, errors });
          }
        } finally {
          if (!transferred && owner !== generation) for (const item of items) discard(item);
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
