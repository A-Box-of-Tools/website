/** These are design hints, not a prediction that a particular scanner will read it. */
function luminance(colour) {
  const channels = [1, 3, 5].map((start) => parseInt(colour.slice(start, start + 2), 16) / 255)
    .map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

export function scanAdvisories(options) {
  const { foreground, background, quiet } = options;
  const keys = [];
  if (background === 'none') keys.push('scan.transparent');
  else if (foreground.toLowerCase() === background.toLowerCase()) keys.push('scan.same');
  else {
    const a = luminance(foreground), b = luminance(background);
    const contrast = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    // Three is a conservative hint chosen here, not a QR/barcode specification.
    if (contrast < 3) keys.push('scan.low');
  }
  if (quiet !== undefined && quiet < 4) keys.push('scan.margin');
  return keys;
}
