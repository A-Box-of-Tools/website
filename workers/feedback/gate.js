const DAY = 86400000;
const HOUR = 3600000;
const COOLDOWN = 600000;
const PENDING = 120000;
const LABELS = { person: 'Person', agent: 'Agent', unspecified: 'Unspecified' };

function result(status, data) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
}

function retryAfter(until, now) {
  return Math.max(1, Math.ceil((until - now) / 1000));
}

// A single stable object reserves attempts before mail leaves. Its transactions
// contain storage only: retrying a transaction must never send another email.
export class FeedbackGate {
  constructor(ctx, env, now = Date.now) {
    this.storage = ctx.storage;
    this.env = env;
    this.now = now;
  }

  async reserve(clientKey, contentKey) {
    const now = this.now();
    const receipt = crypto.randomUUID();
    return this.storage.transaction(async txn => {
      const previous = await txn.get(contentKey);
      if (previous && previous.expiresAt > now) {
        if (previous.state === 'pending' && now - previous.createdAt >= PENDING) {
          previous.state = 'unconfirmed';
          await txn.put(contentKey, previous);
        }
        return { kind: previous.state, receipt: previous.receipt };
      }
      const global = await txn.get('budget') || { times: [] };
      const client = await txn.get(clientKey) || { times: [] };
      const globalTimes = global.times.filter(time => time > now - DAY);
      const clientTimes = client.times.filter(time => time > now - DAY);
      if (globalTimes.length >= 20) return { kind: 'limited', retry_after: retryAfter(Math.min(...globalTimes) + DAY, now) };
      if (clientTimes.length >= 3) return { kind: 'limited', retry_after: retryAfter(Math.min(...clientTimes) + DAY, now) };
      const last = clientTimes.length ? Math.max(...clientTimes) : undefined;
      if (last !== undefined && now - last < COOLDOWN) return { kind: 'limited', retry_after: retryAfter(last + COOLDOWN, now) };
      await txn.put({
        budget: { times: [...globalTimes, now], expiresAt: now + DAY },
        [clientKey]: { times: [...clientTimes, now], expiresAt: now + DAY },
        [contentKey]: { receipt, createdAt: now, expiresAt: now + DAY, state: 'pending' },
      });
      if (await this.storage.getAlarm() === null) await this.storage.setAlarm(now + HOUR);
      return { kind: 'send', receipt };
    });
  }

  async finish(contentKey, receipt, state) {
    await this.storage.transaction(async txn => {
      const record = await txn.get(contentKey);
      if (!record || record.receipt !== receipt) throw new Error('Reservation is unavailable');
      await txn.put(contentKey, { ...record, state });
    });
  }

  async fetch(request) {
    if (request.method !== 'POST' || new URL(request.url).pathname !== '/deliver') return result(404, { state: 'unavailable' });
    let report;
    try {
      report = await request.json();
      if (!/^[a-f0-9]{64}$/.test(report.client) || !/^[a-f0-9]{64}$/.test(report.fingerprint)
          || !Object.hasOwn(LABELS, report.fields?.sender_type)
          || !['JSON', 'Form submission'].includes(report.channel)
          || !this.env.FEEDBACK_TO || !this.env.FEEDBACK_MAIL?.send) throw new Error();
    } catch { return result(503, { state: 'unavailable' }); }
    const clientKey = `client:${report.client}`;
    const contentKey = `report:${report.fingerprint}`;
    let reservation;
    try { reservation = await this.reserve(clientKey, contentKey); }
    catch { return result(503, { state: 'unavailable' }); }
    if (reservation.kind === 'accepted') return result(200, { state: 'accepted', duplicate: true, receipt: reservation.receipt });
    if (reservation.kind === 'pending') return result(202, { state: 'pending', receipt: reservation.receipt });
    if (reservation.kind === 'unconfirmed') return result(503, { state: 'unconfirmed', receipt: reservation.receipt });
    if (reservation.kind === 'limited') return result(429, { state: 'limited', retry_after: reservation.retry_after });
    if (reservation.kind !== 'send') return result(503, { state: 'unconfirmed', receipt: reservation.receipt });

    const { fields, channel } = report;
    const label = LABELS[fields.sender_type];
    const declaration = fields.sender_type === 'unspecified' ? label : `${label} (self-declared)`;
    const text = [
      'Anonymous abox.tools feedback',
      `Receipt: ${reservation.receipt}`,
      `Received: ${new Date(this.now()).toISOString()}`,
      `Sender: ${declaration}`,
      `Submission method: ${channel}`,
      'The sender label is not a verified identity. Either method can be used by an agent.',
      `Page: ${fields.page || '(not provided)'}`,
      `Agent / browser: ${fields.environment || '(not provided)'}`,
      `Optional reply address: ${fields.reply_to || '(not provided)'}`,
      '', fields.message,
    ].join('\n');
    try {
      await this.env.FEEDBACK_MAIL.send({
        to: this.env.FEEDBACK_TO,
        from: 'hi@abox.tools',
        subject: `abox.tools feedback [${label}] ${reservation.receipt}`,
        text,
      });
      await this.finish(contentKey, reservation.receipt, 'accepted');
    } catch {
      try { await this.finish(contentKey, reservation.receipt, 'unconfirmed'); } catch { /* The original reservation still blocks a repeat send. */ }
      return result(503, { state: 'unconfirmed', receipt: reservation.receipt });
    }
    return result(201, { state: 'accepted', duplicate: false, receipt: reservation.receipt });
  }

  async alarm() {
    const now = this.now();
    await this.storage.transaction(async txn => {
      const records = await txn.list();
      const expired = [...records].filter(([, value]) => value.expiresAt <= now).map(([key]) => key);
      if (expired.length) await txn.delete(expired);
      for (const [key, value] of records) {
        if (value.expiresAt <= now || !Array.isArray(value.times)) continue;
        const times = value.times.filter(time => time > now - DAY);
        if (times.length !== value.times.length) await txn.put(key, { ...value, times });
      }
      if (records.size > expired.length) await this.storage.setAlarm(now + HOUR);
    });
  }
}
