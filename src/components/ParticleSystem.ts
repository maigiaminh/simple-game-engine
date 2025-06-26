import { Component } from '../core/Component'
import { Particle } from '../core/Particle'
import { ParticlePreset } from '../types/enums'
import { IGameObject, ParticleConfig } from '../types/interface'
import { Color } from '../utils/Color'
import { MathUtils } from '../utils/MathUtils'
import { Vector2 } from '../utils/Vector2'

export class ParticleSystem extends Component {
    private particles: Particle[] = []
    private maxParticles = 1000

    constructor(gameObject: IGameObject, maxParticles = 1000) {
        super(gameObject)
        this.maxParticles = maxParticles
    }

    public emit(config: ParticleConfig): void {
        if (this.particles.length >= this.maxParticles) {
            this.particles.shift()
        }

        const particle = new Particle(config)
        this.particles.push(particle)
    }

    public emitBurst(center: Vector2, count: number, preset: ParticlePreset): void {
        for (let i = 0; i < count; i++) {
            const config = this.getPresetConfig(center, preset)
            this.emit(config)
        }
    }

    public emitExplosion(center: Vector2, count = 30): void {
        this.emitBurst(center, count, ParticlePreset.EXPLOSION)
    }

    public emitStars(center: Vector2, count = 20): void {
        this.emitBurst(center, count, ParticlePreset.STARS)
    }

    public emitSparkles(center: Vector2, count = 15): void {
        this.emitBurst(center, count, ParticlePreset.SPARKLES)
    }

    public emitConfetti(center: Vector2, count = 50): void {
        this.emitBurst(center, count, ParticlePreset.CONFETTI)
    }

    public emitHearts(center: Vector2, count = 10): void {
        this.emitBurst(center, count, ParticlePreset.HEARTS)
    }

    private getPresetConfig(center: Vector2, preset: ParticlePreset): ParticleConfig {
        const angle = MathUtils.random(0, Math.PI * 2)
        const speed = MathUtils.random(50, 200)
        const velocity = Vector2.fromAngle(angle, speed)

        switch (preset) {
            case ParticlePreset.EXPLOSION:
                return {
                    position: center,
                    velocity: velocity,
                    life: MathUtils.random(500, 1500),
                    size: MathUtils.random(3, 8),
                    color: {
                        r: MathUtils.random(200, 255),
                        g: MathUtils.random(100, 200),
                        b: MathUtils.random(0, 100),
                        a: 1,
                    },
                    fadeOut: true,
                    shrink: true,
                    gravity: true,
                }

            case ParticlePreset.STARS:
                return {
                    position: center,
                    velocity: Vector2.fromAngle(angle, MathUtils.random(30, 100)),
                    life: MathUtils.random(1000, 2000),
                    size: MathUtils.random(2, 5),
                    color: {
                        r: 255,
                        g: 255,
                        b: MathUtils.random(200, 255),
                        a: 1,
                    },
                    fadeOut: true,
                    shrink: false,
                    gravity: false,
                }

            case ParticlePreset.SPARKLES:
                return {
                    position: new Vector2(
                        center.x + MathUtils.random(-20, 20),
                        center.y + MathUtils.random(-20, 20)
                    ),
                    velocity: Vector2.fromAngle(angle, MathUtils.random(10, 50)),
                    life: MathUtils.random(300, 800),
                    size: MathUtils.random(1, 3),
                    color: {
                        r: 255,
                        g: 255,
                        b: 255,
                        a: 1,
                    },
                    fadeOut: true,
                    shrink: true,
                    gravity: false,
                }

            case ParticlePreset.CONFETTI:
                const colors = [
                    { r: 255, g: 0, b: 0 },
                    { r: 0, g: 255, b: 0 },
                    { r: 0, g: 0, b: 255 },
                    { r: 255, g: 255, b: 0 },
                    { r: 255, g: 0, b: 255 },
                    { r: 0, g: 255, b: 255 },
                ]
                const randomColor = MathUtils.randomChoice(colors)

                return {
                    position: center,
                    velocity: Vector2.fromAngle(angle, MathUtils.random(100, 300)),
                    life: MathUtils.random(1000, 3000),
                    size: MathUtils.random(4, 8),
                    color: { ...randomColor, a: 1 },
                    fadeOut: true,
                    shrink: false,
                    gravity: true,
                }

            case ParticlePreset.HEARTS:
                return {
                    position: center,
                    velocity: Vector2.fromAngle(angle, MathUtils.random(20, 80)),
                    life: MathUtils.random(1500, 2500),
                    size: MathUtils.random(6, 12),
                    color: {
                        r: 255,
                        g: MathUtils.random(100, 200),
                        b: MathUtils.random(100, 200),
                        a: 1,
                    },
                    fadeOut: true,
                    shrink: false,
                    gravity: false,
                }

            default:
                return {
                    position: center,
                    velocity: velocity,
                    life: 1000,
                    size: 5,
                    color: Color.WHITE,
                    fadeOut: true,
                }
        }
    }

    public update(deltaTime: number): void {
        this.particles.forEach((particle) => {
            particle.update(deltaTime)
        })

        this.particles = this.particles.filter((particle) => particle.isAlive)
    }

    public render(ctx: CanvasRenderingContext2D): void {
        this.particles.forEach((particle) => {
            particle.render(ctx)
        })
    }

    public clear(): void {
        this.particles = []
    }

    public getParticleCount(): number {
        return this.particles.length
    }
}
