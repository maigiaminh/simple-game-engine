import { Component } from '../core/Component'
import { IGameObject, ComponentConstructor } from '../types/interface'
import { Color } from '../utils/Color'
import { Transform } from './Transform'

export class Renderer extends Component {
    public color: RGBAColor = Color.WHITE
    public visible = true
    public scaleX = 1
    public scaleY = 1

    public setFlip(x: number, y: number): void {
        this.scaleX = x
        this.scaleY = y
    }
    protected image: HTMLImageElement | null = null
    protected imageWidth: number | null = null
    protected imageHeight: number | null = null

    constructor(gameObject: IGameObject) {
        super(gameObject)
    }

    public setImage(image: HTMLImageElement): void {
        this.image = image
    }

    public setColor(color: RGBAColor): void {
        this.color = color
    }

    public setVisible(visible: boolean): void {
        this.visible = visible
    }

    public isVisible(): boolean {
        return this.visible && this.isEnabled()
    }

    public setImageSize(width: number, height: number): void {
        this.imageWidth = width
        this.imageHeight = height
    }

    public getWidth(): number {
        return this.imageWidth ?? (this.image ? this.image.width : 50)
    }

    public getHeight(): number {
        return this.imageHeight ?? (this.image ? this.image.height : 50)
    }

    public update(deltaTime: number): void {
        //
    }

    public render(ctx: CanvasRenderingContext2D): void {
        if (!this.isVisible()) return

        const transform = this.gameObject.getComponent(Transform as ComponentConstructor<Transform>)
        if (!transform) return

        ctx.save()

        const worldPos = transform.getWorldPosition()
        const worldRot = transform.getWorldRotation()
        const worldScale = transform.getWorldScale()

        ctx.translate(worldPos.x, worldPos.y)
        ctx.rotate(worldRot)
        ctx.scale(worldScale.x * this.scaleX, worldScale.y * this.scaleY)

        if (this.image) {
            const drawWidth = this.imageWidth ?? this.image.width
            const drawHeight = this.imageHeight ?? this.image.height
            ctx.drawImage(this.image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)
        } else {
            ctx.fillStyle = new Color(
                this.color.r,
                this.color.g,
                this.color.b,
                this.color.a
            ).toString()
            ctx.fillRect(-25, -25, 50, 50)
        }

        ctx.restore()
    }

    public serialize(): SerializedData {
        return {
            ...super.serialize(),
            color: this.color,
            visible: this.visible,
        }
    }

    public deserialize(data: SerializedData): void {
        super.deserialize(data)
        if (Color.isRGBAColor(data.color)) {
            this.color = {
                r: data.color.r,
                g: data.color.g,
                b: data.color.b,
                a: data.color.a,
            }
        }
        this.visible = data.visible !== false
    }
}
