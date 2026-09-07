/**
 * The profile behind the "Try an example" button, and the photograph that goes
 * on it.
 *
 * WHY THERE IS AN EXAMPLE WHEN THE FORM ARRIVES FULL
 *
 * The page opens with a coffee shop already typed into it, so a button that
 * merely filled the boxes in would do nothing anybody could see. This one
 * exists for the single thing the opening state cannot have: a cover photo. A
 * picture cannot be written into `body.html` as the value of an input, so
 * until somebody chooses a file the card shows the grey tile, and the grey
 * tile is the least representative thing on the page - a real listing is
 * mostly photograph.
 *
 * It is also a different business from the one the page opens with, which is
 * the other half of a button being worth pressing: a bakery shut on Mondays
 * and open early, so the status line says something the nine-to-five default
 * never does.
 *
 * WHY THE PHOTOGRAPH IS DRAWN HERE
 *
 * Because there is nowhere to fetch one from and there should not be:
 * `connect-src` names no address this page could load an image from, which is
 * the promise the rest of the tool is built on, and an example that needed a
 * download would be an example that stopped working with the network
 * unplugged. So it is drawn on a canvas a moment before it is used, out of
 * arithmetic - obviously synthetic at full size and entirely convincing at the
 * size a card shows it, which is the size that matters. The same trick
 * screenshots/inpage.js plays for the guides' screenshots.
 *
 * WHY THE WORDS ARE KEYS
 *
 * A name, an address and a telephone number are not the same shape in every
 * language, and an example written in English would be an English example on
 * fourteen pages out of fifteen. Each of these is a phrase the tool's
 * `#phrases` block defines and main.js resolves - see the note at the top of
 * shared/js/phrases.js. What is not a key is a number, a time or a price band,
 * because those are the same everywhere the page is published.
 */

/**
 * The example, with the fields whose value is words given as phrase keys.
 *
 * `hours` is a whole week rather than a couple of days, because the point of
 * the example is partly the status line and the status line reads the week.
 */
export const EXAMPLE = {
  name: 'sample.name',
  category: 'sample.category',
  price: '$$',
  rating: '4.7',
  reviews: '318',
  address: 'sample.address',
  serviceArea: false,
  phone: 'sample.phone',
  website: 'sample.website',
  description: 'sample.description',
  attributes: 'sample.attributes',
  status: 'auto',
  // Sunday first, the way profile.js keeps a week. Monday shut and everything
  // else starting at seven: a bakery's week, and one that produces a different
  // sentence at most hours of the day than the default nine to five.
  hours: [
    { closed: false, open: '08:00', close: '13:00' },
    { closed: true, open: '07:00', close: '15:00' },
    { closed: false, open: '07:00', close: '15:00' },
    { closed: false, open: '07:00', close: '15:00' },
    { closed: false, open: '07:00', close: '15:00' },
    { closed: false, open: '07:00', close: '18:00' },
    { closed: false, open: '07:30', close: '16:00' },
  ],
};

/**
 * A shopfront, drawn rather than photographed.
 *
 * Deterministic: the same call twice produces the same bytes, so an example
 * that looks wrong is an example of something that changed. Nothing here is
 * random and nothing is fetched.
 *
 * @param {number} [width]
 * @param {number} [height]
 * @returns {string} a `data:image/jpeg` URI of this page's own making
 */
export function coverPhoto(width = 1200, height = 675) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const paint = canvas.getContext('2d');

  // The wall behind the counter, warm and lit from the left, because a
  // photograph of a shop almost always is.
  const wall = paint.createLinearGradient(0, 0, width, height);
  wall.addColorStop(0, '#f0ddc2');
  wall.addColorStop(0.55, '#d8bd97');
  wall.addColorStop(1, '#a8865c');
  paint.fillStyle = wall;
  paint.fillRect(0, 0, width, height);

  // Three shelves of loaves receding up the wall. Each row is smaller and
  // paler than the one below it, which is the whole of the depth in here. A
  // loaf is drawn wider than it is tall and given two slashes across the top,
  // because a brown oval with nothing on it reads as a coin.
  const rows = [
    { y: 0.26, size: 0.052, count: 9, tint: '#cda875' },
    { y: 0.42, size: 0.062, count: 8, tint: '#bd9260' },
    { y: 0.59, size: 0.074, count: 7, tint: '#a97c4c' },
  ];
  for (const row of rows) {
    const shelfY = height * row.y;
    const loafW = width * row.size * 0.62;
    const loafH = height * row.size * 0.52;
    paint.fillStyle = 'rgba(74, 50, 26, 0.30)';
    paint.fillRect(width * 0.05, shelfY + loafH * 1.15, width * 0.90,
      Math.max(2, height * 0.011));
    for (let n = 0; n < row.count; n += 1) {
      const x = width * (0.09 + (0.82 * (n + 0.5)) / row.count);
      // A soft shadow under the loaf, so the shelf reads as a surface rather
      // than as a line the loaves happen to sit on.
      paint.fillStyle = 'rgba(74, 50, 26, 0.22)';
      paint.beginPath();
      paint.ellipse(x, shelfY + loafH * 0.95, loafW * 0.9, loafH * 0.22, 0, 0, Math.PI * 2);
      paint.fill();

      paint.fillStyle = row.tint;
      paint.beginPath();
      paint.ellipse(x, shelfY, loafW, loafH, 0, 0, Math.PI * 2);
      paint.fill();

      // The light on the top of the crust, from the same side as the wall's.
      const lit = paint.createLinearGradient(x, shelfY - loafH, x, shelfY);
      lit.addColorStop(0, 'rgba(255, 236, 200, 0.45)');
      lit.addColorStop(1, 'rgba(255, 236, 200, 0)');
      paint.fillStyle = lit;
      paint.beginPath();
      paint.ellipse(x, shelfY, loafW, loafH, 0, 0, Math.PI * 2);
      paint.fill();

      paint.strokeStyle = 'rgba(92, 58, 24, 0.55)';
      paint.lineWidth = Math.max(1.5, width * 0.0028);
      for (const offset of [-0.34, 0.10]) {
        paint.beginPath();
        paint.moveTo(x + loafW * offset - loafW * 0.16, shelfY - loafH * 0.30);
        paint.lineTo(x + loafW * offset + loafW * 0.16, shelfY + loafH * 0.16);
        paint.stroke();
      }
    }
  }

  // The counter, and the light falling across it from a window off frame.
  const counter = paint.createLinearGradient(0, height * 0.78, 0, height);
  counter.addColorStop(0, '#7a5533');
  counter.addColorStop(1, '#3f2915');
  paint.fillStyle = counter;
  paint.fillRect(0, height * 0.80, width, height * 0.20);
  const glare = paint.createLinearGradient(0, height * 0.80, width * 0.55, height);
  glare.addColorStop(0, 'rgba(255, 244, 222, 0.34)');
  glare.addColorStop(1, 'rgba(255, 244, 222, 0)');
  paint.fillStyle = glare;
  paint.fillRect(0, height * 0.80, width, height * 0.20);

  // A last touch of vignette, so the middle of the picture is where the eye
  // goes - which is where a card crops to.
  const edge = paint.createRadialGradient(
    width / 2, height / 2, Math.min(width, height) * 0.25,
    width / 2, height / 2, Math.max(width, height) * 0.72);
  edge.addColorStop(0, 'rgba(0, 0, 0, 0)');
  edge.addColorStop(1, 'rgba(40, 24, 8, 0.42)');
  paint.fillStyle = edge;
  paint.fillRect(0, 0, width, height);

  return canvas.toDataURL('image/jpeg', 0.82);
}
