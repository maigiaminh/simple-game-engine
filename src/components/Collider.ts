import { Component } from '../core/Component'
import { ColliderType, CollisionLayer, ENGINE_EVENTS } from '../types/enums'
import { IGameObject, ComponentConstructor, ICollidable, CollisionInfo } from '../types/interface'
import { Vector2 } from '../utils/Vector2'
import { Renderer } from './Renderer'
import { Transform } from './Transform'

export class Collider extends Component {
    public type: ColliderType = ColliderType.BOX
    public width = 50
    public height = 50
    public radius = 25
    public offset: Vector2 = Vector2.zero()
    public isTrigger = false
    public layers: number[] = [CollisionLayer.DEFAULT]
    public mask: number[] = [CollisionLayer.ALL]
    public renderer: Renderer
    static ColliderType: unknown

    constructor(gameObject: IGameObject, type: ColliderType = ColliderType.BOX) {
        super(gameObject)
        this.type = type
    }

    public static createBox(
        gameObject: IGameObject,
        width: number,
        height: number,
        offset?: Vector2
    ): Collider {
        const collider = new Collider(gameObject, ColliderType.BOX)
        collider.width = width
        collider.height = height
        if (offset) collider.offset = offset
        return collider
    }

    public static createCircle(
        gameObject: IGameObject,
        radius: number,
        offset?: Vector2
    ): Collider {
        const collider = new Collider(gameObject, ColliderType.CIRCLE)
        collider.radius = radius
        if (offset) collider.offset = offset
        return collider
    }

    public getBounds(): Rectangle {
        const transform = this.gameObject.getComponent(Transform as ComponentConstructor<Transform>)
        if (!transform) {
            return { x: 0, y: 0, width: 0, height: 0 }
        }

        const worldPos = transform.getWorldPosition()
        const pos = new Vector2(worldPos.x + this.offset.x, worldPos.y + this.offset.y)

        switch (this.type) {
            case ColliderType.BOX:
                return {
                    x: pos.x - this.width / 2,
                    y: pos.y - this.height / 2,
                    width: this.width,
                    height: this.height,
                }

            case ColliderType.CIRCLE:
                return {
                    x: pos.x - this.radius,
                    y: pos.y - this.radius,
                    width: this.radius * 2,
                    height: this.radius * 2,
                }
            case ColliderType.POLYGON:
                return {
                    x: pos.x - this.width / 2,
                    y: pos.y - this.height / 2 - this.height / 20,
                    width: this.width,
                    height: this.height / 20,
                }
            default:
                return {
                    x: pos.x,
                    y: pos.y - this.renderer.getHeight() / 2,
                    width: this.width,
                    height: this.height,
                }
        }
    }

    public setColliderSize(width: number, height: number): void {
        this.width = width
        this.height = height
    }

    public setRenderer(renderer: Renderer): void {
        this.renderer = renderer
        if (renderer) {
            this.width = renderer.getWidth()
            this.height = renderer.getHeight()
            this.radius = Math.max(this.width, this.height) / 2
        }
    }

    public setColliderType(type: ColliderType): void {
        this.type = type
        if (type === ColliderType.CIRCLE) {
            this.radius = Math.max(this.width, this.height) / 2
        } else {
            this.radius = 0
        }
    }

    public onCollision(other: ICollidable, collisionInfo: CollisionInfo): void {
        if (this.isTrigger) {
            this.dispatchEvent(ENGINE_EVENTS.TRIGGER_ENTER, { other, collisionInfo })
        } else {
            this.dispatchEvent(ENGINE_EVENTS.COLLISION_ENTER, { other, collisionInfo })
        }
    }

    public onCollisionExit(other: Collider): void {
        if (this.isTrigger) {
            this.dispatchEvent(ENGINE_EVENTS.TRIGGER_EXIT, { other })
        } else {
            this.dispatchEvent(ENGINE_EVENTS.COLLISION_EXIT, { other })
        }
    }

    public getCollisionLayers(): number[] {
        return this.layers
    }

    public getCollisionMask(): number[] {
        return this.mask
    }

    public setCollisionLayers(layers: number[]): void {
        this.layers = layers
    }

    public setCollisionMask(mask: number[]): void {
        this.mask = mask
    }

    public canCollideWith(other: Collider): boolean {
        const canThisCollide = this.mask.some((layer) => other.layers.includes(layer))
        const canOtherCollide = other.mask.some((layer) => this.layers.includes(layer))
        return canThisCollide && canOtherCollide
    }

    public update(deltaTime: number): void {
        //
    }

    public render(ctx: CanvasRenderingContext2D): void {
        // if (!this.gameObject.isVisible()) return
        // const bounds = this.getBounds()
        // ctx.save()
        // ctx.strokeStyle = 'red'
        // ctx.lineWidth = 2
        // ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height)
        // ctx.restore()
    }

    public serialize(): SerializedData {
        return {
            ...super.serialize(),
            type: this.type,
            width: this.width,
            height: this.height,
            radius: this.radius,
            offset: this.offset,
            isTrigger: this.isTrigger,
            layers: this.layers,
            mask: this.mask,
        }
    }

    public deserialize(data: SerializedData): void {
        super.deserialize(data)
        this.type =
            typeof data.type === 'string'
                ? (data.type as unknown as ColliderType)
                : ColliderType.BOX
        this.width = typeof data.width === 'number' ? data.width : 50
        this.height = typeof data.height === 'number' ? data.height : 50
        this.radius = typeof data.radius === 'number' ? data.radius : 25

        if (Vector2.isVector2(data.offset)) {
            this.offset = new Vector2(data.offset.x, data.offset.y)
        } else {
            this.offset = Vector2.zero()
        }

        this.isTrigger = typeof data.isTrigger === 'boolean' ? data.isTrigger : false
        this.layers = Array.isArray(data.layers) ? data.layers : [CollisionLayer.DEFAULT]
        this.mask = Array.isArray(data.mask) ? data.mask : [CollisionLayer.ALL]
    }
}
