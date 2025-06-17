import { Component } from '../core/Component';
import { IGameObject, IRenderer } from '../types/interfaces';
import { Color } from '../utils/Color';
import { Transform } from './Transform';

class Renderer extends Component implements IRenderer {
    public color: RGBAColor = Color.WHITE;
    public visible: boolean = true;
    protected image: HTMLImageElement | null = null;

    constructor(gameObject: IGameObject) {
        super(gameObject);
    }

    public setImage(image: HTMLImageElement): void {
        this.image = image;
    }

    public setColor(color: RGBAColor): void {
        this.color = color;
    }

    public setVisible(visible: boolean): void {
        this.visible = visible;
    }

    public isVisible(): boolean {
        return this.visible && this.isEnabled();
    }

    public update(deltaTime: number): void { }

    public render(ctx: CanvasRenderingContext2D): void {
        if (!this.isVisible()) return;

        const transform = this.gameObject.getComponent(Transform);
        if (!transform) return;

        ctx.save();
        
        const worldPos = transform.getWorldPosition();
        const worldRot = transform.getWorldRotation();
        const worldScale = transform.getWorldScale();
        
        ctx.translate(worldPos.x, worldPos.y);
        ctx.rotate(worldRot);
        ctx.scale(worldScale.x, worldScale.y);

        if (this.image) {
            ctx.drawImage(this.image, -this.image.width / 2, -this.image.height / 2);
        } else {
            ctx.fillStyle = new Color(this.color.r, this.color.g, this.color.b, this.color.a).toString();
            ctx.fillRect(-25, -25, 50, 50);
        }

        ctx.restore();
    }

    public serialize(): SerializedData {
        return {
            ...super.serialize(),
            color: this.color,
            visible: this.visible
        };
    }

    public deserialize(data: SerializedData): void {
        super.deserialize(data);
        if (data.color) {
            this.color = data.color;
        }
        this.visible = data.visible !== false;
    }
}
