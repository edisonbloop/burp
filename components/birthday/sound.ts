/**
 * Every sound on the birthday card is synthesised with WebAudio — no audio
 * files to host. The AudioContext is created on the first user gesture
 * (opening the envelope), which is what browsers require.
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let reverb: ConvolverNode | null = null;
let muted = false;
let songTimer: ReturnType<typeof setTimeout> | null = null;
let songNodes: AudioScheduledSourceNode[] = [];

function impulse(c: AudioContext, seconds: number) {
  const len = Math.floor(c.sampleRate * seconds);
  const buf = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  }
  return buf;
}

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      ctx = new AudioContext();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : 0.9;
      master.connect(ctx.destination);
      reverb = ctx.createConvolver();
      reverb.buffer = impulse(ctx, 2.2);
      const wet = ctx.createGain();
      wet.gain.value = 0.28;
      reverb.connect(wet);
      wet.connect(master);
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

function out(node: AudioNode) {
  node.connect(master!);
  node.connect(reverb!);
}

export function setMuted(m: boolean) {
  muted = m;
  if (ctx && master) master.gain.setTargetAtTime(m ? 0 : 0.9, ctx.currentTime, 0.05);
}

/** Wake the audio context from inside a user gesture. */
export function unlockAudio() {
  audio();
}

/** A music-box note: sine + bright partials with a quick bell decay. */
function bell(freq: number, t: number, length = 1.6, volume = 0.18) {
  const c = ctx!;
  const g = c.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(volume, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0008, t + length);
  out(g);
  const partials: [number, number][] = [[1, 1], [2, 0.32], [3.01, 0.12], [4.2, 0.05]];
  const nodes: OscillatorNode[] = [];
  for (const [mult, amp] of partials) {
    const o = c.createOscillator();
    const pg = c.createGain();
    o.type = "sine";
    o.frequency.value = freq * mult;
    pg.gain.value = amp;
    o.connect(pg);
    pg.connect(g);
    o.start(t);
    o.stop(t + length);
    nodes.push(o);
  }
  return nodes;
}

function noise(t: number, length: number, from: number, to: number, volume: number, q = 1) {
  const c = ctx!;
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * length), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = "bandpass";
  f.Q.value = q;
  f.frequency.setValueAtTime(from, t);
  f.frequency.exponentialRampToValueAtTime(to, t + length);
  const g = c.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(volume, t + length * 0.15);
  g.gain.exponentialRampToValueAtTime(0.001, t + length);
  src.connect(f);
  f.connect(g);
  out(g);
  src.start(t);
  src.stop(t + length);
}

const hz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

/** Rising sparkle — envelope opening, wishes landing. */
export function playChime() {
  const c = audio();
  if (!c) return;
  const t = c.currentTime;
  [72, 76, 79, 84, 88].forEach((n, i) => bell(hz(n), t + i * 0.07, 1.8, 0.12));
}

/** Paper slide + flap. */
export function playWhoosh() {
  const c = audio();
  if (!c) return;
  noise(c.currentTime, 0.55, 600, 2600, 0.18, 0.8);
}

/** Balloon pop / confetti cannon. */
export function playPop() {
  const c = audio();
  if (!c) return;
  const t = c.currentTime;
  noise(t, 0.12, 3000, 400, 0.6, 0.7);
  const o = c.createOscillator();
  const g = c.createGain();
  o.frequency.setValueAtTime(320, t);
  o.frequency.exponentialRampToValueAtTime(60, t + 0.12);
  g.gain.setValueAtTime(0.35, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
  o.connect(g);
  out(g);
  o.start(t);
  o.stop(t + 0.15);
}

/** Candles going out. */
export function playBlow() {
  const c = audio();
  if (!c) return;
  noise(c.currentTime, 0.9, 1800, 300, 0.32, 0.5);
}

/** Little cheer after the wish — a bright major flourish. */
export function playCheer() {
  const c = audio();
  if (!c) return;
  const t = c.currentTime;
  [67, 72, 76, 79, 84, 79, 84, 88, 91].forEach((n, i) => bell(hz(n), t + i * 0.06, 1.4, 0.1));
}

// Happy Birthday (traditional, public domain) in C — [midi, beats]
const MELODY: [number, number][] = [
  [67, 0.75], [67, 0.25], [69, 1], [67, 1], [72, 1], [71, 2],
  [67, 0.75], [67, 0.25], [69, 1], [67, 1], [74, 1], [72, 2],
  [67, 0.75], [67, 0.25], [79, 1], [76, 1], [72, 1], [71, 1], [69, 1],
  [77, 0.75], [77, 0.25], [76, 1], [72, 1], [74, 1], [72, 3],
];
// Soft chords on the downbeats: [beat, notes]
const CHORDS: [number, number[]][] = [
  [1, [48, 55, 64]], [4, [43, 55, 62]], [7, [43, 53, 62]], [10, [48, 55, 64]],
  [13, [48, 55, 64]], [16, [41, 53, 65]], [19, [48, 55, 64]], [21, [43, 53, 62]], [22, [48, 55, 64]],
];

export function isSongPlaying() {
  return songTimer !== null;
}

export function stopSong() {
  if (songTimer) clearTimeout(songTimer);
  songTimer = null;
  songNodes.forEach((n) => {
    try {
      n.stop();
    } catch {
      /* already stopped */
    }
  });
  songNodes = [];
}

/** Music-box Happy Birthday. Calls onEnd when it finishes (unless stopped). */
export function playSong(onEnd?: () => void) {
  const c = audio();
  if (!c) return;
  stopSong();
  const beat = 0.46;
  const start = c.currentTime + 0.15;
  let b = 0;
  for (const [note, len] of MELODY) {
    songNodes.push(...bell(hz(note), start + b * beat, Math.max(1.2, len * beat * 2.2), 0.17));
    b += len;
  }
  for (const [at, notes] of CHORDS) {
    for (const n of notes) songNodes.push(...bell(hz(n), start + at * beat, 2.4, 0.045));
  }
  songTimer = setTimeout(() => {
    songTimer = null;
    songNodes = [];
    onEnd?.();
  }, (b * beat + 1.5) * 1000);
}
