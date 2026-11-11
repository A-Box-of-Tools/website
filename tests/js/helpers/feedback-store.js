import assert from 'node:assert/strict';
import { AsyncLocalStorage } from 'node:async_hooks';
import { FeedbackGate } from '../../../workers/feedback/gate.js';

// The queue models platform storage transactions and lets cases force failures
// without giving the public service a debug endpoint or a test-mail bypass.
export class FeedbackStorage {
  constructor() {
    this.rows = new Map();
    this.queue = Promise.resolve();
    this.alarmAt = null;
    this.transactionScope = new AsyncLocalStorage();
    this.retryNext = false;
    this.rejectAccepted = false;
  }

  transaction(callback) {
    const operation = this.queue.then(async () => {
      const execute = async commit => {
        const pending = structuredClone(this.rows);
        const oldAlarm = this.alarmAt;
        const txn = {
          get: async key => structuredClone(pending.get(key)),
          put: async (key, value) => {
            const entries = typeof key === 'string' ? [[key, value]] : Object.entries(key);
            for (const [name, record] of entries) {
              if (this.rejectAccepted && record.state === 'accepted') throw new Error('Storage failed');
              pending.set(name, structuredClone(record));
            }
          },
          list: async () => structuredClone(pending),
          delete: async keys => {
            for (const key of typeof keys === 'string' ? [keys] : keys) pending.delete(key);
          },
        };
        try {
          const value = await this.transactionScope.run(true, () => callback(txn));
          if (commit) this.rows = pending;
          else this.alarmAt = oldAlarm;
          return value;
        } catch (error) {
          this.alarmAt = oldAlarm;
          throw error;
        }
      };
      if (this.retryNext) {
        this.retryNext = false;
        await execute(false);
      }
      return execute(true);
    });
    this.queue = operation.catch(() => {});
    return operation;
  }

  async getAlarm() { return this.alarmAt; }
  async setAlarm(time) { this.alarmAt = time; }
  get inTransaction() { return this.transactionScope.getStore() === true; }
}

export function feedbackFixture() {
  const sent = [];
  const keys = [];
  const forwarded = [];
  const storage = new FeedbackStorage();
  const clock = { now: Date.UTC(2026, 9, 28, 12) };
  const env = {
    FEEDBACK_HASH_KEY: 'a-test-only-key-that-is-never-used-by-the-service',
    FEEDBACK_TO: 'owner@example.com',
    FEEDBACK_MAIL: { async send(message) {
      assert.equal(storage.inTransaction, false, 'Mail must not be sent inside a retriable storage transaction');
      sent.push(message);
    } },
    FEEDBACK_RATE_LIMIT: { async limit({ key }) { keys.push(key); return { success: true }; } },
    FEEDBACK_GLOBAL_LIMIT: { async limit() { return { success: true }; } },
  };
  let gate = new FeedbackGate({ storage }, env, () => clock.now);
  env.FEEDBACK_GATE = {
    idFromName(name) { assert.equal(name, 'feedback-mail-budget'); return name; },
    get(name) {
      assert.equal(name, 'feedback-mail-budget');
      return { async fetch(request) {
        forwarded.push(await request.clone().json());
        return gate.fetch(request);
      } };
    },
  };
  return { env, sent, keys, storage, clock, forwarded,
    get gate() { return gate; },
    restart() { gate = new FeedbackGate({ storage }, env, () => clock.now); },
  };
}
