import { Camera } from './Camera'
import { Transform } from './Transform'
import { IGameObject, ComponentConstructor } from '../types/interface'
import { Vector2 } from '../utils/Vector2'
import { CONFIG } from '../config/Config'

type CameraViewBounds = {
    top: number
    bottom: number
    left: number
    right: number
}

export class CameraFollow extends Camera {
    private offset: Vector2 = new Vector2(0, CONFIG.CAMERA.FOLLOW_OFFSET)
    private smoothing = 5
    private highestY = 0

    constructor(gameObject: IGameObject) {
        super(gameObject)
    }

    public setTarget(target: IGameObject): void {
        this.target = target
        if (target) {
            this.highestY = target.getPosition().y
        }
    }

    public setOffset(offset: Vector2): void {
        this.offset = offset.clone()
    }

    public setSmoothing(smoothing: number): void {
        this.smoothing = smoothing
    }

    public update(deltaTime: number): void {
        super.update(deltaTime)

        if (!this.target) return

        const transform = this.gameObject.getComponent(
            Transform as ComponentConstructor<Transform>
        )!
        const targetPos = this.target.getPosition()
        const currentPos = transform.getWorldPosition()

        if (targetPos.y < this.highestY) {
            this.highestY = targetPos.y
        }

        const desiredY = Math.min(this.highestY + this.offset.y, targetPos.y + this.offset.y)
        const desiredPos = new Vector2(CONFIG.CANVAS.WIDTH / 2, desiredY)

        if (this.smoothing > 0) {
            const dt = deltaTime / 1000
            const newPos = Vector2.lerp(currentPos, desiredPos, this.smoothing * dt)
            transform.setPosition(newPos)
        } else {
            transform.setPosition(desiredPos)
        }
    }

    public getCameraViewBounds(): CameraViewBounds {
        const transform = this.gameObject.getComponent(
            Transform as ComponentConstructor<Transform>
        )!
        const cameraPos = transform.getWorldPosition()

        return {
            top: cameraPos.y - CONFIG.CANVAS.HEIGHT / 2,
            bottom: cameraPos.y + CONFIG.CANVAS.HEIGHT / 2,
            left: cameraPos.x - CONFIG.CANVAS.WIDTH / 2,
            right: cameraPos.x + CONFIG.CANVAS.WIDTH / 2,
        }
    }

    public isInView(bounds: Rectangle, canvasSize: Vector2): boolean {
        const cameraBounds = this.getCameraViewBounds()

        return (
            bounds.x + bounds.width > cameraBounds.left &&
            bounds.x < cameraBounds.right &&
            bounds.y + bounds.height > cameraBounds.top &&
            bounds.y < cameraBounds.bottom
        )
    }
}
