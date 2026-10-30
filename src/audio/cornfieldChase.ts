// Web Audio API engine for Hans Zimmer's "Cornfield Chase" (Interstellar)
// Procedurally synthesizes the iconic cathedral organ + arpeggiated piano chords.

class CornfieldChaseSynthesizer {
  private ctx: AudioContext | null = null
  private isPlaying: boolean = false
  private masterGain: GainNode | null = null
  private intervalId: number | null = null
  private noteIndex: number = 0
  private step: number = 0
  private tempo: number = 110 // BPM
  private volume: number = 0.55

  // Chord progression for Cornfield Chase (frequencies in Hz)
  private chords = [
    // Em
    {
      bass: 82.41, // E2
      sub: 41.20,  // E1
      arpeggio: [
        164.81, 246.94, 329.63, 392.00, 493.88, 659.25, 783.99, 987.77,
        783.99, 659.25, 493.88, 392.00
      ]
    },
    // G major
    {
      bass: 98.00, // G2
      sub: 49.00,  // G1
      arpeggio: [
        196.00, 246.94, 293.66, 392.00, 493.88, 587.33, 783.99, 987.77,
        783.99, 587.33, 493.88, 392.00
      ]
    },
    // Am
    {
      bass: 110.00, // A2
      sub: 55.00,   // A1
      arpeggio: [
        220.00, 261.63, 329.63, 440.00, 523.25, 659.25, 880.00, 1046.50,
        880.00, 659.25, 523.25, 440.00
      ]
    },
    // C major
    {
      bass: 130.81, // C3
      sub: 65.41,   // C2
      arpeggio: [
        261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51,
        1046.50, 783.99, 659.25, 523.25
      ]
    },
    // D major
    {
      bass: 146.83, // D3
      sub: 73.42,   // D2
      arpeggio: [
        293.66, 369.99, 440.00, 587.33, 739.99, 880.00, 1174.66, 1479.98,
        1174.66, 880.00, 739.99, 587.33
      ]
    }
  ]

  private currentChordIndex = 0

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new AudioCtx()
      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime)

      // Add gentle reverb / delay network
      const delay = this.ctx.createDelay()
      delay.delayTime.value = 0.28
      const delayFeedback = this.ctx.createGain()
      delayFeedback.gain.value = 0.42

      const delayFilter = this.ctx.createBiquadFilter()
      delayFilter.type = 'lowpass'
      delayFilter.frequency.value = 2200

      delay.connect(delayFeedback)
      delayFeedback.connect(delayFilter)
      delayFilter.connect(delay)
      delay.connect(this.masterGain)

      this.masterGain.connect(this.ctx.destination)
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  // Play a single organ/piano pluck
  private playNote(freq: number, isBass = false) {
    if (!this.ctx || !this.masterGain) return

    const now = this.ctx.currentTime

    // Main oscillator (warm triangle for body)
    const osc1 = this.ctx.createOscillator()
    osc1.type = isBass ? 'sine' : 'triangle'
    osc1.frequency.setValueAtTime(freq, now)

    // Secondary oscillator (pipe organ harmonic)
    const osc2 = this.ctx.createOscillator()
    osc2.type = 'sawtooth'
    osc2.frequency.setValueAtTime(freq * (isBass ? 2 : 1.002), now) // subtle detune

    // Filter
    const filter = this.ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(isBass ? 450 : 2800, now)
    filter.Q.value = 1.8

    // Envelope
    const noteGain = this.ctx.createGain()
    const duration = isBass ? 1.8 : 0.32
    noteGain.gain.setValueAtTime(0.0001, now)
    noteGain.gain.linearRampToValueAtTime(isBass ? 0.35 : 0.22, now + 0.03)
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

    osc1.connect(filter)
    osc2.connect(filter)
    filter.connect(noteGain)
    noteGain.connect(this.masterGain)

    osc1.start(now)
    osc2.start(now)
    osc1.stop(now + duration + 0.1)
    osc2.stop(now + duration + 0.1)
  }

  // Play continuous ambient organ chord
  private playOrganPad(chord: (typeof this.chords)[0]) {
    if (!this.ctx || !this.masterGain) return

    // Deep sub bass
    this.playNote(chord.sub, true)
    this.playNote(chord.bass, true)
  }

  public start() {
    this.initContext()
    if (this.isPlaying) return
    this.isPlaying = true

    const noteDurationMs = (60 / this.tempo / 3) * 1000 // 16th triplet speed

    this.intervalId = window.setInterval(() => {
      const chord = this.chords[this.currentChordIndex]

      // Every cycle start, play organ bass pad
      if (this.noteIndex === 0) {
        this.playOrganPad(chord)
      }

      // Play arpeggiated piano note
      const freq = chord.arpeggio[this.noteIndex % chord.arpeggio.length]
      this.playNote(freq, false)

      this.noteIndex++
      if (this.noteIndex >= chord.arpeggio.length) {
        this.noteIndex = 0
        this.currentChordIndex = (this.currentChordIndex + 1) % this.chords.length
      }

      this.step++
    }, noteDurationMs)
  }

  public stop() {
    this.isPlaying = false
    if (this.intervalId !== null) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop()
      return false
    } else {
      this.start()
      return true
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val))
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime)
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying
  }

  public getVolume(): number {
    return this.volume
  }
}

export const cornfieldChase = new CornfieldChaseSynthesizer()
