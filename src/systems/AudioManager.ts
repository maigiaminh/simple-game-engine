import { EventEmitter } from '../core/EventEmitter'
import { ENGINE_EVENTS } from '../types/enums'
import { AudioClip, AudioSource, PlaySoundOptions } from '../types/interface'

export class AudioManager extends EventEmitter {
    private audioContext: AudioContext | null = null
    private masterGainNode: GainNode | null = null
    private clips: Map<string, AudioClip> = new Map()
    private activeSources: Set<AudioSource> = new Set()

    private masterVolume = 1.0
    private enabled = true

    constructor() {
        super()
        this.initializeAudioContext()
    }

    private initializeAudioContext(): void {
        try {
            const AudioCtx =
                window.AudioContext ??
                (window as unknown as { webkitAudioContext?: typeof AudioContext })
                    .webkitAudioContext
            if (!AudioCtx) throw new Error('Web Audio API not supported')
            this.audioContext = new AudioCtx()
            this.masterGainNode = this.audioContext.createGain()
            this.masterGainNode.connect(this.audioContext.destination)

            document.addEventListener('click', this.resumeAudioContext.bind(this), {
                once: true,
            })
            document.addEventListener('keydown', this.resumeAudioContext.bind(this), { once: true })
        } catch (e) {
            console.warn('Web Audio API not supported:', e)
        }
    }

    private async resumeAudioContext(): Promise<void> {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume()
            } catch (error) {
                console.error('Failed to resume audio context:', error)
            }
        }
    }

    public async loadSound(name: string, url: string): Promise<void> {
        if (!this.audioContext) {
            throw new Error('Audio context not available')
        }

        try {
            const response = await fetch(url)
            const arrayBuffer = await response.arrayBuffer()
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)

            const clip: AudioClip = {
                name,
                buffer: audioBuffer,
                volume: 1.0,
                loop: false,
            }

            this.clips.set(name, clip)
            this.dispatchEvent(ENGINE_EVENTS.AUDIO_CLIP_LOADED, { clip })
        } catch (error) {
            console.error(`Failed to load audio clip: ${name}`, error)
            throw error
        }
    }

    public playSound(name: string, override = false, options: PlaySoundOptions = {}): void {
        if (!this.enabled || !this.audioContext || !this.masterGainNode) {
            return
        }

        // if (!override) {
        //     this.stopSound(name)
        // }
        if (!override && this.activeSources.size > 0) {
            for (const audioSource of this.activeSources) {
                if (audioSource.clip.name === name && audioSource.isPlaying) {
                    return
                }
            }
        }

        const clip = this.clips.get(name)
        if (!clip) {
            console.warn(`Audio clip not found: ${name}`)
            return
        }

        try {
            const source = this.audioContext.createBufferSource()
            const gainNode = this.audioContext.createGain()

            source.buffer = clip.buffer
            source.loop = options.loop ?? clip.loop

            const finalVolume = (options.volume ?? clip.volume) * this.masterVolume
            gainNode.gain.value = finalVolume

            source.connect(gainNode)
            gainNode.connect(this.masterGainNode)

            const audioSource: AudioSource = {
                clip,
                source,
                gainNode,
                isPlaying: true,
            }

            this.activeSources.add(audioSource)

            source.onended = () => {
                this.activeSources.delete(audioSource)
            }

            source.start()
        } catch (error) {
            console.error(`Failed to play sound: ${name}`, error)
        }
    }

    public stopSound(name: string): void {
        this.activeSources.forEach((audioSource) => {
            if (audioSource.clip.name === name && audioSource.isPlaying) {
                audioSource.source.stop()
                audioSource.isPlaying = false
            }
        })
    }

    public stopAllSounds(): void {
        this.activeSources.forEach((audioSource) => {
            if (audioSource.isPlaying) {
                audioSource.source.stop()
                audioSource.isPlaying = false
            }
        })
        this.activeSources.clear()
    }

    public setMasterVolume(volume: number): void {
        this.masterVolume = Math.max(0, Math.min(1, volume))
        if (this.masterGainNode) {
            this.masterGainNode.gain.value = this.masterVolume
        }
    }

    public getMasterVolume(): number {
        return this.masterVolume
    }

    public setEnabled(enabled: boolean): void {
        this.enabled = enabled
        if (!enabled) {
            this.stopAllSounds()
        }
    }

    public isEnabled(): boolean {
        return this.enabled
    }
}
