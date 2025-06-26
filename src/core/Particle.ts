import { ParticleConfig } from '../types/interface'
import { Color } from '../utils/Color'
import { Vector2 } from '../utils/Vector2'

export class Particle {
    public position: Vector2
    public velocity: Vector2
    public acceleration: Vector2
    public life: number
    public maxLife: number
    public size: number
    public originalSize: number
    public color: RGBAColor
    public fadeOut: boolean
    public shrink: boolean
    public gravity: boolean
    public isAlive = true

    constructor(config: ParticleConfig) {
        this.position = new Vector2(config.position.x, config.position.y)
        this.velocity = config.velocity
            ? new Vector2(config.velocity.x, config.velocity.y)
            : Vector2.zero()
        this.acceleration = config.acceleration
            ? new Vector2(config.acceleration.x, config.acceleration.y)
            : Vector2.zero()
        this.life = config.life
        this.maxLife = config.life
        this.size = config.size
        this.originalSize = config.size
        this.color = { ...config.color }
        this.fadeOut = config.fadeOut ?? true
        this.shrink = config.shrink ?? false
        this.gravity = config.gravity ?? false
    }

    public update(deltaTime: number): void {
        if (!this.isAlive) return

        const dt = deltaTime / 1000

        if (this.gravity) {
            this.acceleration.y += 500 * dt
        }

        this.velocity = this.velocity.add(this.acceleration.multiply(dt))

        this.position = this.position.add(this.velocity.multiply(dt))

        this.life -= deltaTime
        if (this.life <= 0) {
            this.isAlive = false
            return
        }

        const lifeRatio = this.life / this.maxLife

        if (this.fadeOut) {
            this.color.a = lifeRatio
        }

        if (this.shrink) {
            this.size = this.originalSize * lifeRatio
        }

        this.acceleration = Vector2.zero()
    }

    public render(ctx: CanvasRenderingContext2D): void {
        if (!this.isAlive) return

        ctx.save()
        ctx.globalAlpha = this.color.a
        ctx.fillStyle = new Color(this.color.r, this.color.g, this.color.b, this.color.a).toString()

        ctx.beginPath()
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2)
        ctx.fill()

        ctx.restore()
    }
}
