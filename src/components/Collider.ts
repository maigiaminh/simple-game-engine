import { Component } from '../core/Component';
import { ColliderType, CollisionLayer } from '../types/enums';
import { Vector2D, Rectangle, SerializedData } from '../types/general';
import { ICollider, IGameObject, ComponentConstructor, ICollidable, CollisionInfo } from '../types/interface';
import { Vector2 } from '../utils/Vector2';
import { Transform } from './Transform';

export class Collider extends Component implements ICollider {
    public type: ColliderType = ColliderType.Box;
    public width: number = 50;
    public height: number = 50;
    public radius: number = 25;
    public offset: Vector2D = Vector2.zero();
    public isTrigger: boolean = false;
    public layers: number[] = [CollisionLayer.Default];
    public mask: number[] = [CollisionLayer.All];

    constructor(gameObject: IGameObject, type: ColliderType = ColliderType.Box) {
        super(gameObject);
        this.type = type;
    }

    public static createBox(gameObject: IGameObject, width: number, height: number, offset?: Vector2D): Collider {
        const collider = new Collider(gameObject, ColliderType.Box);
        collider.width = width;
        collider.height = height;
        if (offset) collider.offset = offset;
        return collider;
    }

    public static createCircle(gameObject: IGameObject, radius: number, offset?: Vector2D): Collider {
        const collider = new Collider(gameObject, ColliderType.Circle);
        collider.radius = radius;
        if (offset) collider.offset = offset;
        return collider;
    }

    public getBounds(): Rectangle {
        const transform = this.gameObject.getComponent(Transform as ComponentConstructor<Transform>);
        if (!transform) {
            return { x: 0, y: 0, width: 0, height: 0 };
        }

        const worldPos = transform.getWorldPosition();
        const pos = new Vector2(worldPos.x + this.offset.x, worldPos.y + this.offset.y);
        
        switch (this.type) {
            case ColliderType.Box:
                return {
                    x: pos.x - this.width / 2,
                    y: pos.y - this.height / 2,
                    width: this.width,
                    height: this.height
                };
                
            case ColliderType.Circle:
                return {
                    x: pos.x - this.radius,
                    y: pos.y - this.radius,
                    width: this.radius * 2,
                    height: this.radius * 2
                };
                
            default:
                return { 
                    x: pos.x, 
                    y: pos.y, 
                    width: this.width, 
                    height: this.height 
                };
        }
    }

    public onCollision(other: ICollidable, collisionInfo: CollisionInfo): void {        
        if (this.isTrigger) {
            this.dispatchEvent('triggerEnter', { other, collisionInfo });
        } else {
            this.dispatchEvent('collisionEnter', { other, collisionInfo });
        }
    }

    public onCollisionExit(other: ICollider): void {
        this.dispatchEvent('collisionExit', { other });
    }

    public getCollisionLayers(): number[] {
        return this.layers;
    }

    public getCollisionMask(): number[] {
        return this.mask;
    }

    public setCollisionLayers(layers: number[]): void {
        this.layers = layers;
    }

    public setCollisionMask(mask: number[]): void {
        this.mask = mask;
    }

    public canCollideWith(other: ICollider): boolean {
        const canThisCollide = this.mask.some(layer => other.layers.includes(layer));
        const canOtherCollide = other.mask.some(layer => this.layers.includes(layer));
        return canThisCollide && canOtherCollide;
    }

    public update(deltaTime: number): void { }

    public render(ctx: CanvasRenderingContext2D): void { }

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
            mask: this.mask
        };
    }

    public deserialize(data: SerializedData): void {
        super.deserialize(data);
        this.type = (typeof data.type === 'string' ? data.type as unknown as ColliderType : ColliderType.Box);
        this.width = (typeof data.width === 'number' ? data.width : 50);
        this.height = (typeof data.height === 'number' ? data.height : 50);
        this.radius = (typeof data.radius === 'number' ? data.radius : 25);

        if (Vector2.isVector2D(data.offset)) {
            this.offset = new Vector2(data.offset.x, data.offset.y);
        } else {
            this.offset = Vector2.zero();
        }        

        this.isTrigger = (typeof data.isTrigger === 'boolean' ? data.isTrigger : false);
        this.layers = Array.isArray(data.layers) ? data.layers : [CollisionLayer.Default];
        this.mask = Array.isArray(data.mask) ? data.mask : [CollisionLayer.All];
    }
}