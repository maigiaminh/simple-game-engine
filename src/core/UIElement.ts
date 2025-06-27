import { Transform } from '../components/Transform'
import { UIAnchor } from '../types/enums'
import { IGameObject, ComponentConstructor } from '../types/interface'
import { Vector2 } from '../utils/Vector2'
import { Component } from './Component'

export class UIElement extends Component {
    public anchor: UIAnchor = UIAnchor.TOP_LEFT
    public pivot: Vector2 = Vector2.zero()
    public size: Vector2 = new Vector2(100, 50)
    public margin: BoxSpacing = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    }
    public padding: BoxSpacing = {
        top: 5,
        right: 5,
        bottom: 5,
        left: 5,
    }

    protected parent: UIElement | null = null
    protected children: UIElement[] = []
    protected canvas: HTMLCanvasElement | null = null
    protected canvasSize: Vector2 = Vector2.zero()

    constructor(gameObject: IGameObject) {
        super(gameObject)
    }

    public setCanvas(canvas: HTMLCanvasElement): void {
        this.canvas = canvas
        this.canvasSize = new Vector2(canvas.width, canvas.height)
    }

    public addChild(child: UIElement): void {
        if (!(child instanceof UIElement)) {
            throw new Error('Child must be an instance of UIElement')
        }

        if (child.parent) {
            child.parent.removeChild(child)
        }
        child.parent = this
        this.children.push(child)
        if (this.canvas) {
            child.setCanvas(this.canvas)
        }
    }

    public removeChild(child: UIElement): void {
        if (!(child instanceof UIElement)) {
            throw new Error('Child must be an instance of UIElement')
        }

        const index = this.children.indexOf(child)
        if (index !== -1) {
            child.parent = null
            this.children.splice(index, 1)
        }
    }

    public getParent(): UIElement | null {
        return this.parent as UIElement | null
    }

    public getChildren(): UIElement[] {
        if (this.children.length === 0) {
            return []
        }

        const childrenCopy: UIElement[] = []
        this.children.forEach((child) => {
            childrenCopy.push(child)
        })

        return childrenCopy
    }

    public setLocalPosition(position: Vector2): void {
        const transform = this.gameObject.getComponent(Transform as ComponentConstructor<Transform>)
        if (transform) {
            transform.setPosition(position)
        }
    }

    public setAnchor(anchor: UIAnchor): void {
        this.anchor = anchor
    }

    public setPivot(pivot: Vector2): void {
        this.pivot = new Vector2(pivot.x, pivot.y)
    }

    public getWorldBounds(): Rectangle {
        const worldPos = this.getWorldPosition()
        const pivotOffset = new Vector2(this.size.x * this.pivot.x, this.size.y * this.pivot.y)
        return {
            x: worldPos.x - pivotOffset.x,
            y: worldPos.y - pivotOffset.y,
            width: this.size.x,
            height: this.size.y,
        }
    }

    public getWorldPosition(): Vector2 {
        let position = Vector2.zero()

        if (this.parent) {
            const parentBounds = this.parent.getWorldBounds()
            const anchorPos = this.getAnchorPosition(this.anchor, parentBounds)
            const transform = this.gameObject.getComponent(
                Transform as ComponentConstructor<Transform>
            )
            const localPos = transform ? transform.position : Vector2.zero()

            position = anchorPos.add(localPos)
        } else if (this.canvas) {
            const anchorPos = this.getAnchorPosition(this.anchor, {
                x: 0,
                y: 0,
                width: this.canvas.width,
                height: this.canvas.height,
            })
            const transform = this.gameObject.getComponent(
                Transform as ComponentConstructor<Transform>
            )
            const localPos = transform ? transform.position : Vector2.zero()

            position = anchorPos.add(localPos)
        }
        return position
    }

    protected getAnchorPosition(anchor: UIAnchor, bounds: Rectangle): Vector2 {
        switch (anchor) {
            case UIAnchor.TOP_LEFT:
                return new Vector2(bounds.x, bounds.y)
            case UIAnchor.TOP_CENTER:
                return new Vector2(bounds.x + bounds.width / 2, bounds.y)
            case UIAnchor.TOP_RIGHT:
                return new Vector2(bounds.x + bounds.width, bounds.y)
            case UIAnchor.MIDDLE_LEFT:
                return new Vector2(bounds.x, bounds.y + bounds.height / 2)
            case UIAnchor.MIDDLE_CENTER:
                // return new Vector2(bounds.x, bounds.y)
                return new Vector2(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2)
            case UIAnchor.MIDDLE_RIGHT:
                return new Vector2(bounds.x + bounds.width, bounds.y + bounds.height / 2)
            case UIAnchor.BOTTOM_LEFT:
                return new Vector2(bounds.x, bounds.y + bounds.height)
            case UIAnchor.BOTTOM_CENTER:
                return new Vector2(bounds.x + bounds.width / 2, bounds.y + bounds.height)
            case UIAnchor.BOTTOM_RIGHT:
                return new Vector2(bounds.x + bounds.width, bounds.y + bounds.height)
            default:
                return new Vector2(bounds.x, bounds.y)
        }
    }

    public update(deltaTime: number): void {
        this.children.forEach((child) => {
            if (child.isEnabled()) {
                child.update(deltaTime)
            }
        })
    }

    public render(ctx: CanvasRenderingContext2D): void {
        if (!this.isVisible()) return

        this.onRender(ctx)

        this.children.forEach((child) => {
            if (child.isVisible()) {
                child.render(ctx)
            }
        })
    }

    protected onRender(ctx: CanvasRenderingContext2D): void {}

    public serialize(): SerializedData {
        return {
            ...super.serialize(),
            anchor: this.anchor,
            pivot: this.pivot,
            size: this.size,
            margin: this.margin,
            padding: this.padding,
        }
    }

    public deserialize(data: SerializedData): void {
        super.deserialize(data)
        this.anchor = (data.anchor as UIAnchor) || UIAnchor.TOP_LEFT
        if (Vector2.isVector2(data.pivot)) {
            this.pivot = new Vector2(data.pivot.x, data.pivot.y)
        }
        if (Vector2.isVector2(data.size)) {
            this.size = new Vector2(data.size.x, data.size.y)
        }
    }
}
