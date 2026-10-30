export interface Track {
  id: string
  title: string
  artist: string
  src: string
}

export const PLAYLIST: Track[] = [
  {
    id: 'cornfield-chase',
    title: 'Cornfield Chase',
    artist: 'Hans Zimmer',
    src: '/audio/cornfield-chase.mp3'
  },
  {
    id: 'lamour-toujours',
    title: "L'amour Toujours",
    artist: 'Organ Penguin',
    src: '/audio/lamour-toujours.mp3'
  }
]

type AudioListener = () => void

class AudioManager {
  private audio: HTMLAudioElement | null = null
  private currentTrackIndex: number = 0
  private isPlaying: boolean = false
  private volume: number = 0.5
  private listeners: Set<AudioListener> = new Set()

  constructor() {
    // Pick random initial track
    this.currentTrackIndex = Math.floor(Math.random() * PLAYLIST.length)

    // Check saved volume preference
    const savedVol = localStorage.getItem('vaishh_audio_volume')
    if (savedVol) {
      this.volume = parseFloat(savedVol)
    }
  }

  private initAudio() {
    if (!this.audio) {
      this.audio = new Audio()
      this.audio.preload = 'auto'
      this.audio.volume = this.volume

      this.audio.addEventListener('ended', () => {
        // Automatically play next random track when current ends
        this.playRandom()
      })

      this.audio.addEventListener('play', () => {
        this.isPlaying = true
        this.notify()
      })

      this.audio.addEventListener('pause', () => {
        this.isPlaying = false
        this.notify()
      })

      this.audio.addEventListener('error', (e) => {
        console.warn('Audio playback error:', e)
        this.isPlaying = false
        this.notify()
      })
    }
  }

  private notify() {
    this.listeners.forEach((listener) => listener())
  }

  public subscribe(listener: AudioListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  public getCurrentTrack(): Track {
    return PLAYLIST[this.currentTrackIndex]
  }

  public getIsPlaying(): boolean {
    return this.isPlaying
  }

  public getVolume(): number {
    return this.volume
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val))
    localStorage.setItem('vaishh_audio_volume', String(this.volume))
    if (this.audio) {
      this.audio.volume = this.volume
    }
    this.notify()
  }

  public async play(): Promise<void> {
    this.initAudio()
    if (!this.audio) return

    const track = this.getCurrentTrack()
    if (this.audio.src !== window.location.origin + track.src && !this.audio.src.endsWith(track.src)) {
      this.audio.src = track.src
    }

    try {
      await this.audio.play()
      this.isPlaying = true
      this.notify()
    } catch {
      // Browser autoplay restriction, will play on user gesture
    }
  }

  public pause() {
    if (this.audio) {
      this.audio.pause()
      this.isPlaying = false
      this.notify()
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.pause()
      return false
    } else {
      this.play()
      return true
    }
  }

  public playRandom() {
    this.initAudio()
    if (!this.audio) return

    // Pick a different random track if possible
    if (PLAYLIST.length > 1) {
      let nextIndex = Math.floor(Math.random() * PLAYLIST.length)
      while (nextIndex === this.currentTrackIndex) {
        nextIndex = Math.floor(Math.random() * PLAYLIST.length)
      }
      this.currentTrackIndex = nextIndex
    }

    const track = this.getCurrentTrack()
    this.audio.src = track.src
    this.audio.currentTime = 0
    this.audio.play().catch(() => {})
    this.isPlaying = true
    this.notify()
  }
}

export const audioManager = new AudioManager()
