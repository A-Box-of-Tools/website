/** Record a short synthetic video with a tone so the picture uses real audio. */
export const tool = 'extract-audio-from-video';
export const shots = [{
  name: 'output',
  clip: '#take-card',
  run: async (k) => {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const drawing = canvas.getContext('2d');
    drawing.fillStyle = '#22344b';
    drawing.fillRect(0, 0, 320, 240);
    drawing.fillStyle = 'white';
    drawing.font = '24px sans-serif';
    drawing.fillText('Example video', 65, 125);
    const audio = new AudioContext();
    await audio.resume();
    const destination = audio.createMediaStreamDestination();
    const tone = audio.createOscillator();
    const gain = audio.createGain();
    gain.gain.value = 0.1;
    tone.connect(gain).connect(destination);
    tone.start();
    const stream = new MediaStream([...canvas.captureStream(10).getTracks(),
      ...destination.stream.getTracks()]);
    const recording = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8,opus' });
    const chunks = [];
    recording.ondataavailable = (event) => chunks.push(event.data);
    const stopped = new Promise((resolve) => { recording.onstop = resolve; });
    try {
      recording.start();
      await k.settle(1000);
      recording.stop();
      await stopped;
      k.give(k.file(new Blob(chunks, { type: recording.mimeType }),
        'example-video.webm', recording.mimeType));
      await k.wait('#result');
      await k.settle(500);
    } finally {
      if (recording.state !== 'inactive') recording.stop();
      tone.stop();
      stream.getTracks().forEach((track) => track.stop());
      await audio.close();
    }
  },
}];
