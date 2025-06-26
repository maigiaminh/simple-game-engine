import { IGameObject } from '../types/interface'
import { Color } from '../utils/Color'
import { UIPanel } from './UIPanel'

export class EnhancedPanel extends UIPanel {
    private gradientColors: RGBAColor[] = []
    private animatedGradient = false
    private gradientTime = 0
    private glassEffect = false
    private borderGlow = false
    private floatingEffect = false
    private floatTime = 0
    private floatAmplitude = 5

    constructor(gameObject: IGameObject) {
        super(gameObject)

        // Default gradient
        this.gradientColors = [new Color(50, 50, 100, 0.9), new Color(30, 30, 80, 0.9)]

        this.cornerRadius = 15
        this.borderWidth = 2
    }

    public setGradient(colors: RGBAColor[]): void {
        this.gradientColors = [...colors]
    }

    public enableAnimatedGradient(enabled = true): void {
        this.animatedGradient = enabled
    }

    public enableGlassEffect(enabled = true): void {
        this.glassEffect = enabled
    }

    public enableBorderGlow(enabled = true): void {
        this.borderGlow = enabled
    }

    public enableFloating(enabled = true, amplitude = 5): void {
        this.floatingEffect = enabled
        this.floatAmplitude = amplitude
    }

    public update(deltaTime: number): void {
        super.update(deltaTime)

        if (this.animatedGradient) {
            this.gradientTime += deltaTime
        }

        if (this.floatingEffect) {
            this.floatTime += deltaTime
        }
    }

    protected onRender(ctx: CanvasRenderingContext2D): void {
        const bounds = this.getWorldBounds()

        if (this.floatingEffect) {
            const floatOffset = Math.sin(this.floatTime * 0.002) * this.floatAmplitude
            bounds.y += floatOffset
        }

        ctx.save()
        ctx.globalAlpha = this.alpha

        // const gradient = this.createGradient(ctx, bounds)

        // if (this.cornerRadius > 0) {
        //     this.drawRoundedRect(ctx, bounds, this.cornerRadius)
        //     ctx.fillStyle = gradient
        //     ctx.fill()
        // } else {
        //     ctx.fillStyle = gradient
        //     ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height)
        // }

        // if (this.glassEffect) {
        //     this.drawGlassEffect(ctx, bounds)
        // }

        // if (this.borderWidth > 0) {
        //     this.drawBorder(ctx, bounds)
        // }

        // ctx.restore()
    }

    private createGradient(ctx: CanvasRenderingContext2D, bounds: Bound): CanvasGradient {
        const gradient = ctx.createLinearGradient(
            bounds.x,
            bounds.y,
            bounds.x,
            bounds.y + bounds.height
        )

        if (this.animatedGradient && this.gradientColors.length >= 2) {
            const time = this.gradientTime * 0.001
            const colorIndex = Math.floor(time) % this.gradientColors.length
            const nextIndex = (colorIndex + 1) % this.gradientColors.length
            const t = time - Math.floor(time)

            const color1 = this.gradientColors[colorIndex]
            const color2 = this.gradientColors[nextIndex]

            const interpolated = new Color(
                color1.r + (color2.r - color1.r) * t,
                color1.g + (color2.g - color1.g) * t,
                color1.b + (color2.b - color1.b) * t,
                color1.a + (color2.a - color1.a) * t
            )

            gradient.addColorStop(0, interpolated.toString())
            gradient.addColorStop(
                1,
                color2.toString
                    ? color2.toString()
                    : new Color(color2.r, color2.g, color2.b, color2.a).toString()
            )
        } else {
            this.gradientColors.forEach((color, index) => {
                const stop = index / (this.gradientColors.length - 1)
                const colorStr = color.toString
                    ? color.toString()
                    : new Color(color.r, color.g, color.b, color.a).toString()
                gradient.addColorStop(stop, colorStr)
            })
        }

        return gradient
    }

    private drawGlassEffect(ctx: CanvasRenderingContext2D, bounds: Bound): void {
        const highlight = ctx.createLinearGradient(
            bounds.x,
            bounds.y,
            bounds.x,
            bounds.y + bounds.height * 0.3
        )
        highlight.addColorStop(0, 'rgba(255, 255, 255, 0.3)')
        highlight.addColorStop(1, 'rgba(255, 255, 255, 0)')

        if (this.cornerRadius > 0) {
            this.drawRoundedRect(ctx, bounds, this.cornerRadius)
            ctx.fillStyle = highlight
            ctx.fill()
        } else {
            ctx.fillStyle = highlight
            ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height * 0.3)
        }
    }

    private drawBorder(ctx: CanvasRenderingContext2D, bounds: Bound): void {
        if (this.borderGlow) {
            ctx.shadowColor = new Color(
                this.borderColor.r,
                this.borderColor.g,
                this.borderColor.b,
                0.8
            ).toString()
            ctx.shadowBlur = 10
        }

        if (this.cornerRadius > 0) {
            this.drawRoundedRect(ctx, bounds, this.cornerRadius)
        } else {
            ctx.rect(bounds.x, bounds.y, bounds.width, bounds.height)
        }

        ctx.strokeStyle = new Color(
            this.borderColor.r,
            this.borderColor.g,
            this.borderColor.b,
            this.borderColor.a
        ).toString()
        ctx.lineWidth = this.borderWidth
        ctx.stroke()
    }

    protected drawRoundedRect(ctx: CanvasRenderingContext2D, bounds: Bound, radius: number): void {
        ctx.beginPath()
        ctx.moveTo(bounds.x + radius, bounds.y)
        ctx.lineTo(bounds.x + bounds.width - radius, bounds.y)
        ctx.quadraticCurveTo(
            bounds.x + bounds.width,
            bounds.y,
            bounds.x + bounds.width,
            bounds.y + radius
        )
        ctx.lineTo(bounds.x + bounds.width, bounds.y + bounds.height - radius)
        ctx.quadraticCurveTo(
            bounds.x + bounds.width,
            bounds.y + bounds.height,
            bounds.x + bounds.width - radius,
            bounds.y + bounds.height
        )
        ctx.lineTo(bounds.x + radius, bounds.y + bounds.height)
        ctx.quadraticCurveTo(
            bounds.x,
            bounds.y + bounds.height,
            bounds.x,
            bounds.y + bounds.height - radius
        )
        ctx.lineTo(bounds.x, bounds.y + radius)
        ctx.quadraticCurveTo(bounds.x, bounds.y, bounds.x + radius, bounds.y)
        ctx.closePath()
    }
}
