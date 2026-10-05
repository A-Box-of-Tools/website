/** Pictures are drawn locally so the example exercises the same OCR as a file. */
export async function exampleFiles() {
  const files = [];
  for (const source of document.querySelectorAll('[data-example]')) {
    const lines = [...source.querySelectorAll('[data-line]')].map(line => line.textContent.trim());
    const canvas = document.createElement('canvas');
    canvas.width = 1040;
    canvas.height = 280 + lines.length * 65;
    const context = canvas.getContext('2d');
    context.fillStyle = '#4f5962';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#fff';
    context.fillRect(70, 70, 900, canvas.height - 140);
    context.fillStyle = '#111';
    context.font = '30px monospace';
    lines.forEach((line, index) => context.fillText(line, 115, 150 + index * 65));
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    files.push(new File([blob], source.dataset.example, { type: 'image/png' }));
  }
  return files;
}
