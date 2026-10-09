/** Each cancellable file owns a channel on the already-admitted peer connection. */
const CHUNK = 64 * 1024;
const HIGH = 8 << 20;
const LOW = 1 << 20;
export const FILE_CHANNEL = 'share-file' + ':';
export const validRequest = value => typeof value === 'string'
  && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(value);

/** Closing the channel races both native reads and backpressure waits. */
export async function sendFile(channel, file, id, current = () => true) {
  const owns = () => current() && channel.readyState === 'open';
  if (!owns()) return;
  channel.send(JSON.stringify({ type: 'file-begin', id, size: file.size, mime: file.type }));
  channel.bufferedAmountLowThreshold = LOW;
  for (let offset = 0; offset < file.size; offset += CHUNK) {
    if (!owns()) return;
    if (channel.bufferedAmount > HIGH) {
      await new Promise(resolve => {
        const resume = () => {
          channel.removeEventListener('bufferedamountlow', resume);
          channel.removeEventListener('close', resume);
          resolve();
        };
        channel.addEventListener('bufferedamountlow', resume, { once: true });
        channel.addEventListener('close', resume, { once: true });
      });
      if (!owns()) return;
    }
    const bytes = await file.slice(offset, offset + CHUNK).arrayBuffer();
    if (!owns()) return;
    channel.send(bytes);
  }
  if (owns()) channel.send(JSON.stringify({ type: 'file-end', id }));
}

export function fileSender({ peer, control, files, admitted, later = setTimeout, cancelTimer = clearTimeout }) {
  let active = null;
  let pendingReads = 0;
  const owns = job => active === job && admitted();
  function retire(job) {
    if (active !== job) return;
    active = null;
    cancelTimer(job.timer);
    if (job.request) job.channel.close();
  }
  function timeout(job) {
    cancelTimer(job.timer);
    job.timer = later(() => retire(job), 30000);
  }
  function report(type, message, modern) {
    // The control lane can close before its peer-removal callback arrives.
    try { control.send(JSON.stringify({ type, id: message.id,
      ...(modern ? { request: message.request } : {}) })); } catch {}
  }
  return {
    request(message) {
      if (!admitted() || active !== null || typeof message.id !== 'string'
        || message.id.length === 0 || message.id.length > 128) return false;
      const modern = message.request !== undefined;
      if (modern && !validRequest(message.request)) return false;
      // A cancelled native read can finish later, but repeated Cancel/Retry
      // must not create an unbounded set of still-pending browser reads.
      if (pendingReads >= 2) {
        report('file-failed', message, modern);
        return false;
      }
      const file = files.get(message.id);
      if (!file) {
        report('file-gone', message, modern);
        return true;
      }
      let channel;
      try { channel = modern ? peer.createDataChannel(FILE_CHANNEL + message.request) : control; }
      catch { report('file-failed', message, modern); return false; }
      const job = { request: modern ? message.request : null, timer: null, channel };
      active = job;
      const run = async () => {
        if (!owns(job) || job.channel.readyState !== 'open' || job.started) return;
        job.started = true;
        pendingReads += 1;
        try {
          await sendFile(job.channel, file, message.id, () => {
            if (!owns(job)) return false;
            if (modern) timeout(job);
            return true;
          });
        } catch {
          if (owns(job) && job.channel.readyState === 'open') {
            try { job.channel.send(JSON.stringify({ type: 'file-failed', id: message.id })); } catch {}
          }
        } finally {
          pendingReads -= 1;
          // The receiver closes a completed dedicated lane after processing its
          // end marker. Keeping it until then prevents concurrent file queues.
          if (!modern) retire(job);
        }
      };
      if (modern) {
        timeout(job);
        job.channel.addEventListener('open', run, { once: true });
        job.channel.addEventListener('close', () => retire(job), { once: true });
      }
      if (job.channel.readyState === 'open') void run();
      return true;
    },
    cancel(request) {
      if (admitted() && validRequest(request) && active?.request === request) retire(active);
    },
    close() { if (active) retire(active); },
  };
}
