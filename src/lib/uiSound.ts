"use client";

/**
 * UI SOUND — small, quiet sounds that answer what the visitor does. Not music:
 * just enough to feel that something happened.
 *
 * No files: every sound is synthesised on the spot (Web Audio), so there's no
 * download and no delay. Sound is opt-in — nothing plays until the visitor
 * switches it on — and the choice is remembered on this device.
 *
 * Palette: water and bubbles, the same world as the visuals. Each sound varies
 * a little every time so repetition never grates.
 */

const hz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

type Listener = (on: boolean) => void;
const KEY = "ed-sound";

class UISound {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private room: ConvolverNode | null = null;
  private roomIn: GainNode | null = null;
  private listeners = new Set<Listener>();
  /** opt-in: nothing plays until the visitor switches sound on */
  on = false;
  volume = 0.7;

  /** Must run inside a user gesture (click / tap / key). */
  async unlock() {
    if (!this.ctx) this.build();
    await this.ctx!.resume();
  }

  get remembered() {
    try {
      return localStorage.getItem(KEY) === "1";
    } catch {
      return false;
    }
  }

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => void this.listeners.delete(fn);
  }

  async enable() {
    await this.unlock();
    this.on = true;
    this.save();
  }

  disable() {
    this.on = false;
    this.save();
  }

  async toggle() {
    if (this.on) this.disable();
    else await this.enable();
  }

  private save() {
    try {
      localStorage.setItem(KEY, this.on ? "1" : "0");
    } catch {}
    this.listeners.forEach((fn) => fn(this.on));
  }

  private build() {
    const c = new AudioContext();
    this.ctx = c;
    this.master = c.createGain();
    this.master.gain.value = this.volume;
    const lim = c.createDynamicsCompressor();
    lim.threshold.value = -16;
    lim.ratio.value = 4;
    this.master.connect(lim).connect(c.destination);
    // one shared, soft room — every sound sits in the same "water"
    this.room = c.createConvolver();
    this.room.buffer = this.impulse(2.8, 2.6);
    this.roomIn = c.createGain();
    this.roomIn.gain.value = 0.5;
    this.roomIn.connect(this.room).connect(this.master);
  }

  private impulse(seconds: number, decay: number) {
    const c = this.ctx!;
    const len = Math.floor(c.sampleRate * seconds);
    const buf = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      let last = 0;
      for (let i = 0; i < len; i++) {
        const k = i / len;
        const a = 0.45 + 0.5 * k;
        last = a * last + (1 - a) * (Math.random() * 2 - 1);
        d[i] = last * Math.pow(1 - k, decay);
      }
    }
    return buf;
  }

  private noise(seconds = 2) {
    const c = this.ctx!;
    const buf = c.createBuffer(1, Math.floor(c.sampleRate * seconds), c.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < d.length; i++) {
      last = (last + 0.04 * (Math.random() * 2 - 1)) / 1.04;
      d[i] = last * 3;
    }
    return buf;
  }

  private live() {
    return this.on && !!this.ctx && !!this.master && !!this.roomIn;
  }

  /** A single enveloped tone into dry + room. */
  private tone(opts: { f: number; type?: OscillatorType; level: number; attack?: number; decay: number; wet?: number; glideTo?: number; delay?: number; pan?: number }) {
    if (!this.live()) return;
    const c = this.ctx!;
    const t = c.currentTime + (opts.delay ?? 0);
    const o = c.createOscillator();
    o.type = opts.type ?? "sine";
    o.frequency.setValueAtTime(opts.f, t);
    if (opts.glideTo) o.frequency.exponentialRampToValueAtTime(opts.glideTo, t + opts.decay);
    const g = c.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(opts.level, t + (opts.attack ?? 0.006));
    g.gain.exponentialRampToValueAtTime(0.0001, t + opts.decay);
    const p = c.createStereoPanner();
    p.pan.value = opts.pan ?? 0;
    o.connect(g).connect(p);
    p.connect(this.master!);
    p.connect(gainOf(c, opts.wet ?? 0.6)).connect(this.roomIn!);
    o.start(t);
    o.stop(t + opts.decay + 0.05);
  }

  /** A short burst of filtered noise (water movement). */
  private swish(opts: { from: number; to: number; level: number; length: number; q?: number; wet?: number }) {
    if (!this.live()) return;
    const c = this.ctx!;
    const t = c.currentTime;
    const src = c.createBufferSource();
    src.buffer = this.noise(1);
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = opts.q ?? 1.4;
    bp.frequency.setValueAtTime(opts.from, t);
    bp.frequency.exponentialRampToValueAtTime(opts.to, t + opts.length * 0.8);
    const g = c.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(opts.level, t + opts.length * 0.22);
    g.gain.exponentialRampToValueAtTime(0.0001, t + opts.length);
    src.connect(bp).connect(g);
    g.connect(this.master!);
    g.connect(gainOf(c, opts.wet ?? 0.5)).connect(this.roomIn!);
    src.start(t);
    src.stop(t + opts.length + 0.05);
  }

  /* ── the kit ─────────────────────────────────────────────── */

  /** Touching an element in the periodic table: a water bubble — the same for every family. */
  element() {
    this.bubble(1 + Math.floor(Math.random() * 2));
  }

  /** A few bubbles rising. */
  bubble(count = 3) {
    for (let i = 0; i < count; i++) {
      const f = 380 + Math.random() * 380;
      this.tone({ f, glideTo: f * 2.4, level: 0.03, attack: 0.004, decay: 0.09, wet: 0.7, delay: i * (0.06 + Math.random() * 0.08) });
    }
  }

  /** Menu opens: a soft rush of water/air rising; closes: the same falling. */
  menu(open: boolean) {
    this.swish({ from: open ? 300 : 1400, to: open ? 1400 : 280, level: 0.16, length: 0.55 });
  }

  /** Theme switch: daylight shimmers up; the deep answers with a low hum. */
  theme(to: "light" | "dark") {
    if (to === "light") {
      [74, 78, 81, 86].forEach((m, i) => this.tone({ f: hz(m), level: 0.022, decay: 0.9, wet: 0.9, delay: i * 0.05 }));
    } else {
      this.tone({ f: hz(38), type: "triangle", level: 0.09, attack: 0.04, decay: 1.2, wet: 0.6 });
      this.tone({ f: hz(50), level: 0.03, attack: 0.04, decay: 1, wet: 0.7 });
    }
  }

}

function gainOf(c: AudioContext, v: number) {
  const g = c.createGain();
  g.gain.value = v;
  return g;
}

export const uiSound: UISound = typeof window === "undefined" ? (null as unknown as UISound) : new UISound();
