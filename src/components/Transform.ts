import { Component } from '../core/Component';
import { ITransform, IGameObject, SerializedData } from '../types/general';
import { Vector2 } from '../utils/Vector2';

export class Transform extends Component implements ITransform {
    public position: Vector2;
    public rotation: number;
    public scale: Vector2;
    
    private parent: Transform | null = null;
    private children: Transform[] = [];
    
    private worldPosition: Vector2;
    private worldRotation: number;
    private worldScale: Vector2;
    private needsUpdate: boolean = true;

    constructor(gameObject: IGameObject, position: Vector2 = Vector2.zero()) {
        super(gameObject);
        this.position = new Vector2(position.x, position.y);
        this.rotation = 0;
        this.scale = Vector2.one();
        this.worldPosition = this.position.clone();
        this.worldRotation = 0;
        this.worldScale = Vector2.one();
    }

    public translate(delta: Vector2): void {
        this.position = this.position.add(delta);
        this.markNeedsUpdate();
    }

    public rotate(angle: number): void {
        this.rotation += angle;
        this.markNeedsUpdate();
    }

    public setPosition(position: Vector2): void {
        this.position = new Vector2(position.x, position.y);
        this.markNeedsUpdate();
    }

    public setRotation(rotation: number): void {
        this.rotation = rotation;
        this.markNeedsUpdate();
    }

    public setScale(scale: Vector2): void {
        this.scale = new Vector2(scale.x, scale.y);
        this.markNeedsUpdate();
    }

    public getWorldPosition(): Vector2 {
        this.updateWorldTransform();
        return this.worldPosition.clone();
    }

    public getWorldRotation(): number {
        this.updateWorldTransform();
        return this.worldRotation;
    }

    public getWorldScale(): Vector2 {
        this.updateWorldTransform();
        return this.worldScale.clone();
    }

    public setParent(parent: ITransform | null): void {
        if (this.parent === parent) return;
        
        if (this.parent) {
            const index = this.parent.children.indexOf(this);
            if (index !== -1) {
                this.parent.children.splice(index, 1);
            }
        }
        
        this.parent = parent as Transform;
        if (parent) {
            (parent as Transform).children.push(this);
        }
        
        this.markNeedsUpdate();
    }

    public getParent(): ITransform | null {
        return this.parent;
    }

    public getChildren(): ITransform[] {
        return [...this.children];
    }

    private updateWorldTransform(): void {
        if (!this.needsUpdate) return;
        
        if (this.parent) {
            this.parent.updateWorldTransform();
            
            this.worldPosition = this.parent.worldPosition.add(this.position);
            this.worldRotation = this.parent.worldRotation + this.rotation;
            this.worldScale = new Vector2(
                this.parent.worldScale.x * this.scale.x,
                this.parent.worldScale.y * this.scale.y
            );
        } else {
            this.worldPosition = this.position.clone();
            this.worldRotation = this.rotation;
            this.worldScale = this.scale.clone();
        }
        
        this.needsUpdate = false;
        
        this.children.forEach(child => child.markNeedsUpdate());
    }

    private markNeedsUpdate(): void {
        this.needsUpdate = true;
        this.children.forEach(child => child.markNeedsUpdate());
    }

    public update(deltaTime: number): void { }

    public render(ctx: CanvasRenderingContext2D): void { }

    public serialize(): SerializedData {
        return {
            ...super.serialize(),
            position: { x: this.position.x, y: this.position.y },
            rotation: this.rotation,
            scale: { x: this.scale.x, y: this.scale.y }
        };
    }

    public deserialize(data: SerializedData): void {
        super.deserialize(data);
        if (Vector2.isVector2D(data.position)) {
            this.position = new Vector2(data.position.x, data.position.y);
        }

        this.rotation = typeof data.rotation === 'number' ? data.rotation : 0;
        
        if (Vector2.isVector2D(data.scale)) {
            this.scale = new Vector2(data.scale.x, data.scale.y);
        }
        this.markNeedsUpdate();
    }
}
