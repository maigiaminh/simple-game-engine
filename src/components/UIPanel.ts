import { UIElement } from '../core/UIElement'
import { RGBAColor, Rectangle, SerializedData } from '../types/general'
import { IGameObject } from '../types/interface'
import { Color } from '../utils/Color'

export class UIPanel extends UIElement {
    public backgroundColor: RGBAColor = Color.DARK_GRAY
    public borderColor: RGBAColor = Color.GRAY
    public borderWidth = 1
    public cornerRadius = 5
    public alpha = 1

    constructor(gameObject: IGameObject) {
        super(gameObject)
    }

    public setBackgroundColor(color: RGBAColor): void {
        this.backgroundColor = color
    }

    public setBorderColor(color: RGBAColor): void {
        this.borderColor = color
    }

    public setBorderWidth(width: number): void {
        this.borderWidth = width
    }

    public setCornerRadius(radius: number): void {
        this.cornerRadius = radius
    }

    protected onRender(ctx: CanvasRenderingContext2D): void {
        const bounds = this.getWorldBounds()

        ctx.save()
        ctx.globalAlpha = this.alpha

        if (this.cornerRadius > 0) {
            this.drawRoundedRect(ctx, bounds, this.cornerRadius)
            ctx.fillStyle = new Color(
                this.backgroundColor.r,
                this.backgroundColor.g,
                this.backgroundColor.b,
                this.backgroundColor.a
            ).toString()
            ctx.fill()
        } else {
            ctx.fillStyle = new Color(
                this.backgroundColor.r,
                this.backgroundColor.g,
                this.backgroundColor.b,
                this.backgroundColor.a
            ).toString()
            ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height)
        }

        if (this.borderWidth > 0) {
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

        ctx.restore()
    }

    private drawRoundedRect(
        ctx: CanvasRenderingContext2D,
        bounds: Rectangle,
        radius: number
    ): void {
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

    public serialize(): SerializedData {
        return {
            ...super.serialize(),
            backgroundColor: this.backgroundColor,
            borderColor: this.borderColor,
            borderWidth: this.borderWidth,
            cornerRadius: this.cornerRadius,
            alpha: this.alpha,
        }
    }

    public deserialize(data: SerializedData): void {
        super.deserialize(data)
        if (Color.isRGBAColor(data.backgroundColor)) {
            this.backgroundColor = data.backgroundColor
        }
        if (Color.isRGBAColor(data.borderColor)) {
            this.borderColor = data.borderColor
        }
        if (typeof data.borderWidth === 'number') {
            this.borderWidth = data.borderWidth
        }
        if (typeof data.cornerRadius === 'number') {
            this.cornerRadius = data.cornerRadius
        }
        if (typeof data.alpha === 'number') {
            this.alpha = data.alpha
        }
    }
}
