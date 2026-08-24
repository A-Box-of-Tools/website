/**
 * The camera, which is the only part of this tool that asks the browser for
 * anything.
 *
 * It is worth being precise about what that does and does not mean, because
 * "this page uses your camera" sounds like the opposite of everything else on
 * this site. A `MediaStream` is a pipe from the sensor into this tab. Frames
 * arrive as pixels in the page's own memory, they are drawn onto a canvas the
 * page owns, and `scan.js` reads them there. Nothing is recorded, nothing is
 * kept after the frame is examined, and there is no code path in this
 * repository that could send one anywhere: the page's
 * Content-Security-Policy has no `connect-src` for this origin, so `fetch`,
 * `XMLHttpRequest`, `WebSocket` and `sendBeacon` are all refused before they
 * start. The camera light going out when you press stop is the whole of it.
 *
 * WHY THIS CAN FAIL WHEN NOTHING IS WRONG
 *
 * The site sends `Permissions-Policy: camera=(self)`, which permits this one
 * page to ask; a browser will still refuse without a secure context, and the
 * visitor can refuse for their own reasons. Every refusal is reported as
 * itself rather than as "camera error", because the fixes are entirely
 * different: a denied permission is a browser setting, an unreadable device is
 * another program holding it open, and no device at all is a desktop with no
 * webcam - which is why choosing a file is the other half of this page and not
 * a fallback.
 */

/** Is there a camera interface here at all? */
export function available() {
  return typeof navigator !== 'undefined'
    && !!navigator.mediaDevices?.getUserMedia;
}

/**
 * Which phrase explains this failure. The keys are looked up in body.html, so
 * the explanation is in the language of the page rather than the browser's.
 */
export function reasonFor(error) {
  if (!available()) {
    return typeof window !== 'undefined' && !window.isSecureContext
      ? 'camera.insecure' : 'camera.unsupported';
  }
  switch (error?.name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      return 'camera.denied';
    case 'NotFoundError':
    case 'DevicesNotFoundError':
    case 'OverconstrainedError':
      return 'camera.none';
    case 'NotReadableError':
    case 'TrackStartError':
    case 'AbortError':
      return 'camera.busy';
    case 'SecurityError':
      return 'camera.insecure';
    default:
      return 'camera.failed';
  }
}

/**
 * Open a camera.
 *
 * The back camera is asked for rather than demanded. `ideal` means a laptop
 * with one camera above the screen gets that one instead of an
 * OverconstrainedError, which is what `exact` would produce and what would
 * make this page useless on every desktop.
 */
export async function open({ deviceId } = {}) {
  if (!available()) throw new Error('no camera interface');

  const video = deviceId
    ? { deviceId: { exact: deviceId } }
    : { facingMode: { ideal: 'environment' } };

  // A code is small in the frame and its modules can be a pixel or two across,
  // so resolution is the difference between reading it and not. This is a
  // request: the browser gives what the device has.
  video.width = { ideal: 1920 };
  video.height = { ideal: 1080 };

  return navigator.mediaDevices.getUserMedia({ video, audio: false });
}

/**
 * The cameras this browser will admit to.
 *
 * Labels are empty until permission has been given at least once, which is why
 * this is called after a stream opens rather than before: a menu of "camera 1,
 * camera 2" is not worth showing.
 */
export async function cameras() {
  if (!navigator.mediaDevices?.enumerateDevices) return [];
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices
      .filter((device) => device.kind === 'videoinput')
      .map((device, index) => ({
        deviceId: device.deviceId,
        label: device.label || `Camera ${index + 1}`,
      }));
  } catch {
    return [];
  }
}

/** Does this stream's camera have a light this page may switch on? */
export function torchable(stream) {
  const track = stream?.getVideoTracks?.()[0];
  return !!track?.getCapabilities?.().torch;
}

/** Switch the light on or off, quietly doing nothing where there is none. */
export async function setTorch(stream, on) {
  const track = stream?.getVideoTracks?.()[0];
  if (!track?.applyConstraints) return false;
  try {
    await track.applyConstraints({ advanced: [{ torch: on }] });
    return true;
  } catch {
    return false;
  }
}

/** Close the stream, and with it the light on the front of the machine. */
export function close(stream) {
  for (const track of stream?.getTracks?.() ?? []) track.stop();
}

/**
 * One frame, as pixels.
 *
 * Capped rather than taken at whatever the sensor produces. A 1920-wide frame
 * is four times the work of a 960-wide one and the reader has to keep up with
 * the camera, not with the sensor; a code big enough to read at all is still
 * big enough at half the width. The canvas is reused between frames, because
 * allocating eight megabytes thirty times a second is how a phone gets hot.
 */
export function frameInto(video, canvas, maxSide = 960) {
  const width = video.videoWidth;
  const height = video.videoHeight;
  if (!width || !height) return null;

  const scale = Math.min(1, maxSide / Math.max(width, height));
  const target = { width: Math.round(width * scale), height: Math.round(height * scale) };

  if (canvas.width !== target.width || canvas.height !== target.height) {
    canvas.width = target.width;
    canvas.height = target.height;
  }

  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.drawImage(video, 0, 0, target.width, target.height);
  return context.getImageData(0, 0, target.width, target.height);
}
