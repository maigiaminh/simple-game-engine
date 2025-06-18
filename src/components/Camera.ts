import { Component } from '../core/Component';
import { Vector2 } from '../utils/Vector2';
import { Transform } from './Transform';
import { Rectangle, SerializedData, Vector2D } from '../types/general'
import { CameraType } from '../types/enums';
import { ICamera, IGameObject, ComponentConstructor } from '../types/interface';

export class Camera extends Component implements ICamera {
    public type: CameraType = CameraType.Orthographic;
    public size: number = 5;
    public fieldOfView: number = 60;
    
    private target: IGameObject | null = null;
    private followSmoothing: number = 5;
    
    private shakeIntensity: number = 0;
    private shakeDuration: number = 0;
    private shakeOffset: Vector2D = Vector2.zero();

    constructor(gameObject: IGameObject) {
        super(gameObject);
    }

    public setTarget(target: IGameObject | null): void {
        this.target = target;
    }

    public shake(intensity: number, duration: number): void {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
    }

    public worldToScreen(worldPoint: Vector2D, canvasSize: Vector2D): Vector2D {
        const transform = this.gameObject.getComponent(Transform as ComponentConstructor<Transform>)!;
        const cameraPos = transform.getWorldPosition().add(this.shakeOffset);
        
        return new Vector2(
            (worldPoint.x - cameraPos.x) + canvasSize.x / 2,
            (worldPoint.y - cameraPos.y) + canvasSize.y / 2
        );
    }

    public screenToWorld(screenPoint: Vector2D, canvasSize: Vector2D): Vector2D {
        const transform = this.gameObject.getComponent(Transform as ComponentConstructor<Transform>)!;
        const cameraPos = transform.getWorldPosition().add(this.shakeOffset);
        
        return new Vector2(
            (screenPoint.x - canvasSize.x / 2) + cameraPos.x,
            (screenPoint.y - canvasSize.y / 2) + cameraPos.y
        );
    }

    public isInView(bounds: Rectangle, canvasSize: Vector2D): boolean {
        const viewBounds = this.getViewBounds(canvasSize);
        return this.boundsOverlap(viewBounds, bounds);
    }

    private getViewBounds(canvasSize: Vector2D): Rectangle {
        const transform = this.gameObject.getComponent(Transform as ComponentConstructor<Transform>)!;
        const cameraPos = transform.getWorldPosition().add(this.shakeOffset);
        
        const halfWidth = canvasSize.x / 2;
        const halfHeight = canvasSize.y / 2;
        
        return {
            x: cameraPos.x - halfWidth,
            y: cameraPos.y - halfHeight,
            width: canvasSize.x,
            height: canvasSize.y
        };
    }

    private boundsOverlap(a: Rectangle, b: Rectangle): boolean {
        return a.x < b.x + b.width && a.x + a.width > b.x &&
               a.y < b.y + b.height && a.y + a.height > b.y;
    }

    public update(deltaTime: number): void {
        if (!this.enabled) return;

        if (this.target) {
            const targetPos = this.target.getPosition();
            const transform = this.gameObject.getComponent(Transform as ComponentConstructor<Transform>)!;
            const currentPos = transform.getWorldPosition();
            
            if (this.followSmoothing > 0) {
                const newPos = Vector2.lerp(currentPos, targetPos, (this.followSmoothing * deltaTime) / 1000);
                transform.setPosition(newPos);
            } else {
                transform.setPosition(new Vector2(targetPos.x, targetPos.y));
            }
        }

        if (this.shakeDuration > 0) {
            this.shakeDuration -= deltaTime;
            
            if (this.shakeDuration > 0) {
                const angle = Math.random() * Math.PI * 2;
                const intensity = this.shakeIntensity * (this.shakeDuration / 1000);
                this.shakeOffset = Vector2.fromAngle(angle, intensity);
            } else {
                this.shakeOffset = Vector2.zero();
            }
        }
    }

    public render(ctx: CanvasRenderingContext2D): void { }

    public serialize(): SerializedData {
        return {
            ...super.serialize(),
            type: this.type,
            size: this.size,
            fieldOfView: this.fieldOfView,
            followSmoothing: this.followSmoothing
        };
    }

    public deserialize(data: SerializedData): void {
        super.deserialize(data);
        this.type = (typeof data.type === 'string' ? data.type : CameraType.Orthographic) as CameraType;
        this.size = typeof data.size === 'number' ? data.size : 5;
        this.fieldOfView = typeof data.fieldOfView === 'number' ? data.fieldOfView : 60;
        this.followSmoothing = typeof data.followSmoothing === 'number' ? data.followSmoothing : 5;
    }
}