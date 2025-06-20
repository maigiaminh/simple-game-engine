import { UIElement } from '../core/UIElement'
import { IGameObject } from '../types/interface'
import { Color } from '../utils/Color'

export class UILabel extends UIElement {
    public text = ''
    public font = '16px Arial'
    public color: RGBAColor = Color.WHITE
    public textAlign: CanvasTextAlign = 'left'
    public textBaseline: CanvasTextBaseline = 'top'
    public wordWrap = false
    public lineHeight = 1.2

    constructor(gameObject: IGameObject, text = '') {
        super(gameObject)
        this.text = text
    }

    public setText(text: string): void {
        this.text = text
    }

    public setFont(font: string): void {
        this.font = font
    }

    public setColor(color: RGBAColor): void {
        this.color = color
    }

    public setTextAlign(align: CanvasTextAlign): void {
        this.textAlign = align
    }

    protected onRender(ctx: CanvasRenderingContext2D): void {
        if (!this.text) return

        const bounds = this.getWorldBounds()

        ctx.save()
        ctx.font = this.font
        ctx.fillStyle = new Color(this.color.r, this.color.g, this.color.b, this.color.a).toString()
        ctx.textAlign = this.textAlign
        ctx.textBaseline = this.textBaseline

        if (this.wordWrap) {
            this.renderWrappedText(ctx, bounds)
        } else {
            const x = this.getTextX(bounds)
            const y = this.getTextY(bounds)
            ctx.fillText(this.text, x, y)
        }

        ctx.restore()
    }

    private renderWrappedText(ctx: CanvasRenderingContext2D, bounds: Rectangle): void {
        const words = this.text.split(' ')
        const lines: string[] = []
        let currentLine = ''

        for (const word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word
            const metrics = ctx.measureText(testLine)

            if (
                metrics.width > bounds.width - this.padding.left - this.padding.right &&
                currentLine
            ) {
                lines.push(currentLine)
                currentLine = word
            } else {
                currentLine = testLine
            }
        }

        if (currentLine) {
            lines.push(currentLine)
        }

        const fontSize = parseInt(this.font)
        const lineSpacing = fontSize * this.lineHeight
        let startY = bounds.y + this.padding.top

        if (this.textBaseline === 'middle') {
            startY = bounds.y + bounds.height / 2 - (lines.length * lineSpacing) / 2
        } else if (this.textBaseline === 'bottom') {
            startY = bounds.y + bounds.height - this.padding.bottom - lines.length * lineSpacing
        }

        lines.forEach((line, index) => {
            const x = this.getTextX(bounds)
            const y = startY + index * lineSpacing
            ctx.fillText(line, x, y)
        })
    }

    private getTextX(bounds: Rectangle): number {
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

    private getTextY(bounds: Rectangle): number {
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

    public serialize(): SerializedData {
        return {
            ...super.serialize(),
            text: this.text,
            font: this.font,
            color: this.color,
            textAlign: this.textAlign,
            textBaseline: this.textBaseline,
            wordWrap: this.wordWrap,
            lineHeight: this.lineHeight,
        }
    }

    public deserialize(data: SerializedData): void {
        super.deserialize(data)
        if (typeof data.text === 'string') {
            this.text = data.text
        }
        if (typeof data.font === 'string') {
            this.font = data.font
        }
        if (Color.isRGBAColor(data.color)) {
            this.color = data.color
        }
        if (typeof data.textAlign === 'string') {
            this.textAlign = data.textAlign as CanvasTextAlign
        }
        if (typeof data.textBaseline === 'string') {
            this.textBaseline = data.textBaseline as CanvasTextBaseline
        }
        if (typeof data.wordWrap === 'boolean') {
            this.wordWrap = data.wordWrap
        }
        if (typeof data.lineHeight === 'number') {
            this.lineHeight = data.lineHeight
        }
    }
}
