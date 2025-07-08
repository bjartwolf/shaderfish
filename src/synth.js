import { frequencyFromNoteNumberEqualTemperament } from "./music_theory";
export class Synth {
  constructor(actx) {
    this.actx = actx;
    this.out = this.comp();
    this.out.connect(actx.destination);

    this.A = 0.0;
    this.D = 0.75;
    this.S = 0.0;
    this.R = 0.0;

    this.notes = {};
  }

  envelope(A, D, S, R) {
    this.A = A;
    this.D = D;
    this.S = S;
    this.R = R;
  }

  osc(type, freq, detune = 0) {
    let o = this.actx.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    o.detune.value = detune;
    o.start();

    return o;
  }

  amp() {
    let g = this.actx.createGain();
    g.gain.value = 0.0;

    return g;
  }

  comp() {
    let c = this.actx.createDynamicsCompressor();
    c.threshold.value = 0;
    c.knee.value = 20;
    c.ratio.value = 5;
    c.attack.value = 0;
    c.release.value = 0.24;

    return c;
  }

  // https://inspiredacoustics.com/en/MIDI_note_numbers_and_center_frequencies
  // https://www.sophiesauveterre.com/popcorn-gershon-kingsley-easy-piano-arrangement/
  play(note, at, dur, gain = 1.0, wave = "sawtooth") {
    if (!note) return;
    let freq = frequencyFromNoteNumberEqualTemperament(note);
    console.log(freq)

    let A = this.A * dur;
    let D = this.D * dur;
    let R = this.R * dur;

    //let v = this.osc("sawtooth", freq, 0);
    let v = this.osc(wave, freq, 0);
    let a = this.amp();

    a.gain.setValueAtTime(0.0, at);
    a.connect(this.out);
    v.connect(a);

    //    a.gain.linearRampToValueAtTime(gain * 1.0, at + A);
    a.gain.linearRampToValueAtTime(gain, at + A);
    //a.gain.linearRampToValueAtTime(this.S, at + A + D);
    //a.gain.linearRampToValueAtTime(0.0, at + A + D);
    a.gain.linearRampToValueAtTime(0.0000, at + A + D + R);
    v.stop(at + A + D + R);
  }
}


