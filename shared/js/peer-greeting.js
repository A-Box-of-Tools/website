/** A first frame can arrive before the other side starts receiving. Echoing
 * its first validated greeting repairs either lost opening frame, with at most
 * two sends per peer. The caller owns frame validation and everything that
 * follows the greeting, including approval and media permissions.
 * Call open() before handling incoming frames; receive() requires that opening
 * and returns true only for the first remote greeting while still current. */
export function createChannelGreeting({ current, send, failed }) {
  let opened = false, received = false, stopped = false;
  const active = () => !stopped && current();
  const transmit = () => {
    try { send(); }
    catch (error) {
      stopped = true;
      failed(error);
      return false;
    }
    return active();
  };
  return {
    open() {
      if (!active()) return false;
      if (opened) return true;
      opened = true;
      return transmit();
    },
    receive() {
      if (!active() || !opened || received) return false;
      // A synchronous reply can re-enter this method while send is running.
      received = true;
      return transmit();
    },
  };
}
