import { GameObject } from '../core/GameObject'
import { IGameObject } from '../types/interface'
import { Color } from '../utils/Color'
import { Vector2 } from '../utils/Vector2'
import { ParticleSystem } from './ParticleSystem'
import { UIButton } from './UIButton'

export class EnhancedButton extends UIButton {
    private backgroundImage: HTMLImageElement | null = null

    private particleSystem: ParticleSystem | null = null
    private isHovered = false
    private scale = 1
    private targetScale = 1
    private glowIntensity = 0
    private pulseTime = 0
    private enableParticleSystem = true

    public enableHoverEffect = true
    public enableClickEffect = true
    public enableGlow = true
    public enablePulse = false

    constructor(gameObject: IGameObject, text = 'Button') {
        super(gameObject, text)

        const particleGO = new GameObject({ name: 'ButtonParticles' })
        this.particleSystem = new ParticleSystem(particleGO, 50)

        this.normalColor = new Color(70, 130, 255, 1)
        this.hoverColor = new Color(100, 150, 255, 1)
        this.pressedColor = new Color(50, 110, 230, 1)

        this.cornerRadius = 12
        this.borderWidth = 2
        this.borderColor = new Color(255, 255, 255, 0.3)
    }

    public update(deltaTime: number): void {
        super.update(deltaTime)

        if (this.particleSystem) {
            this.particleSystem.update(deltaTime)
        }

        this.updateHoverEffect(deltaTime)
        this.updatePulseEffect(deltaTime)
        this.updateGlowEffect(deltaTime)
    }

    private updateHoverEffect(deltaTime: number): void {
        // if (!this.enableHoverEffect) return
        // const scaleLerp = 8 * (deltaTime / 1000)
        // this.scale += (this.targetScale - this.scale) * scaleLerp
        // this.size = new Vector2(this.size.x * this.scale, this.size.y * this.scale)
    }

    private updatePulseEffect(deltaTime: number): void {
        if (!this.enablePulse) return

        this.pulseTime += deltaTime
        const pulseIntensity = Math.sin(this.pulseTime * 0.003) * 0.05 + 1
        this.targetScale = pulseIntensity
    }

    private updateGlowEffect(deltaTime: number): void {
        if (!this.enableGlow) return

        const glowLerp = 5 * (deltaTime / 1000)
        const targetGlow = this.isHovered ? 1 : 0
        this.glowIntensity += (targetGlow - this.glowIntensity) * glowLerp
    }

    public setBackgroundImage(image: HTMLImageElement): void {
        this.backgroundImage = image
        this.setText('')
    }

    public handleMouseMove(mousePos: Vector2): void {
        const wasHovered = this.isHovered
        super.handleMouseMove(mousePos)

        const bounds = this.getWorldBounds()
        this.isHovered =
            mousePos.x >= bounds.x &&
            mousePos.x <= bounds.x + bounds.width &&
            mousePos.y >= bounds.y &&
            mousePos.y <= bounds.y + bounds.height

        if (this.isHovered && !wasHovered) {
            this.onHoverStart()
        } else if (!this.isHovered && wasHovered) {
            this.onHoverEnd()
        }
    }

    public handleMouseDown(mousePos: Vector2): void {
        super.handleMouseDown(mousePos)

        if (this.enableClickEffect && this.isHovered && this.particleSystem) {
            const bounds = this.getWorldBounds()
            const center = new Vector2(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2)
            this.particleSystem.emitSparkles(center, 8)
        }
    }

    public toggleParticleSystem(enable: boolean): void {
        this.enableParticleSystem = enable
    }

    private onHoverStart(): void {
        this.targetScale = 1.05

        if (this.enableClickEffect && this.particleSystem) {
            const bounds = this.getWorldBounds()
            const center = new Vector2(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2)
            this.particleSystem.emitSparkles(center, 3)
        }
    }

    private onHoverEnd(): void {
        this.targetScale = 1.0
    }

    protected onRender(ctx: CanvasRenderingContext2D): void {
        const bounds = this.getWorldBounds()

        ctx.save()

        if (this.enableGlow && this.glowIntensity > 0) {
            this.drawGlow(ctx, bounds)
        }

        if (this.backgroundImage) {
            ctx.drawImage(this.backgroundImage, bounds.x, bounds.y, bounds.width, bounds.height)
        } else {
            super.onRender(ctx)
        }

        if (this.particleSystem && this.enableParticleSystem) {
            this.particleSystem.render(ctx)
        }

        ctx.restore()
    }

    private drawGlow(ctx: CanvasRenderingContext2D, bounds: Bound): void {
        const glowSize = 20 * this.glowIntensity
        const gradient = ctx.createRadialGradient(
            bounds.x + bounds.width / 2,
            bounds.y + bounds.height / 2,
            0,
            bounds.x + bounds.width / 2,
            bounds.y + bounds.height / 2,
            Math.max(bounds.width, bounds.height) / 2 + glowSize
        )

        gradient.addColorStop(0, `rgba(100, 150, 255, ${0.3 * this.glowIntensity})`)
        gradient.addColorStop(1, 'rgba(100, 150, 255, 0)')

        ctx.fillStyle = gradient
        ctx.fillRect(
            bounds.x - glowSize,
            bounds.y - glowSize,
            bounds.width + glowSize * 2,
            bounds.height + glowSize * 2
        )
    }
}
