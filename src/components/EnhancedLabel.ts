import { IGameObject } from '../types/interface'
import { Color } from '../utils/Color'
import { UILabel } from './UILabel'

export class EnhancedLabel extends UILabel {
    private typewriterSpeed = 50
    private fullText = ''
    private currentText = ''
    private typewriterTime = 0
    private isTypewriting = false
    private glowEffect = false
    private shadowEffect = true
    private rainbowEffect = false
    private pulseEffect = false
    private pulseTime = 0

    constructor(gameObject: IGameObject, text = '') {
        super(gameObject, text)
        this.fullText = text
        this.currentText = ''

        this.shadowEffect = true
    }

    public startTypewriter(speed = 50): void {
        this.typewriterSpeed = speed
        this.isTypewriting = true
        this.typewriterTime = 0
        this.currentText = ''
    }

    public enableGlow(enabled = true): void {
        this.glowEffect = enabled
    }

    public enableRainbow(enabled = true): void {
        this.rainbowEffect = enabled
    }

    public enablePulse(enabled = true): void {
        this.pulseEffect = enabled
    }

    public setText(text: string): void {
        super.setText(text)
        this.fullText = text
        if (!this.isTypewriting) {
            this.currentText = text
        }
    }

    public update(deltaTime: number): void {
        super.update(deltaTime)

        if (this.isTypewriting) {
            this.updateTypewriter(deltaTime)
        }

        if (this.pulseEffect) {
            this.pulseTime += deltaTime
        }
    }

    private updateTypewriter(deltaTime: number): void {
        this.typewriterTime += deltaTime
        const charactersToShow = Math.floor((this.typewriterTime / 1000) * this.typewriterSpeed)

        if (charactersToShow >= this.fullText.length) {
            this.currentText = this.fullText
            this.isTypewriting = false
        } else {
            this.currentText = this.fullText.substring(0, charactersToShow)
        }
    }

    protected onRender(ctx: CanvasRenderingContext2D): void {
        if (!this.currentText && !this.isTypewriting) {
            this.currentText = this.text
        }

        const bounds = this.getWorldBounds()
        const displayText = this.isTypewriting ? this.currentText : this.text

        if (!displayText) return

        ctx.save()
        ctx.font = this.font
        ctx.textAlign = this.textAlign
        ctx.textBaseline = this.textBaseline

        const x = this.getTextX(bounds)
        const y = this.getTextY(bounds)

        if (this.pulseEffect) {
            const scale = 1 + Math.sin(this.pulseTime * 0.005) * 0.1
            ctx.save()
            ctx.translate(x, y)
            ctx.scale(scale, scale)
            ctx.translate(-x, -y)
        }

        if (this.glowEffect) {
            ctx.shadowColor = new Color(this.color.r, this.color.g, this.color.b, 0.8).toString()
            ctx.shadowBlur = 10
        }

        if (this.rainbowEffect) {
            this.drawRainbowText(ctx, displayText, x, y)
        } else {
            if (this.shadowEffect) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
                ctx.fillText(displayText, x + 2, y + 2)
            }
            ctx.fillStyle = new Color(
                this.color.r,
                this.color.g,
                this.color.b,
                this.color.a
            ).toString()
            ctx.fillText(displayText, x, y)
        }

        if (this.pulseEffect) {
            ctx.restore()
        }

        ctx.restore()
    }

    private drawRainbowText(
        ctx: CanvasRenderingContext2D,
        text: string,
        x: number,
        y: number
    ): void {
        const time = Date.now() * 0.005

        for (let i = 0; i < text.length; i++) {
            const hue = (time + i * 10) % 360
            const color = Color.fromHSL({ h: hue, s: 70, l: 60 })
            ctx.fillStyle = color.toString()

            const charWidth = ctx.measureText(text.substring(0, i)).width
            ctx.fillText(text[i], x + charWidth, y)
        }
    }

    protected getTextX(bounds: Bound): number {
        switch (this.textAlign) {
            case 'left':
                return bounds.x + this.padding.left
            case 'center':
                return bounds.x + bounds.width / 2
            case 'right':
                return bounds.x + bounds.width - this.padding.right
            default:
                return bounds.x + this.padding.left
        }
    }

    protected getTextY(bounds: Bound): number {
        switch (this.textBaseline) {
            case 'top':
                return bounds.y + this.padding.top
            case 'middle':
                return bounds.y + bounds.height / 2
            case 'bottom':
                return bounds.y + bounds.height - this.padding.bottom
            default:
                return bounds.y + this.padding.top
        }
    }
}
