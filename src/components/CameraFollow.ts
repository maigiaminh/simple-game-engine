import { Camera } from './Camera'
import { Transform } from './Transform'
import { IGameObject, ComponentConstructor } from '../types/interface'
import { Vector2 } from '../utils/Vector2'
import { CONFIG } from '../config/Config'
import { Player } from '../DoodleJump/components/Player'

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
    private player: Player
    private playerDeadTimer = 0
    private hasPlayerDied = false
    private readonly DEAD_FOLLOW_DURATION = 1 // seconds

    constructor(gameObject: IGameObject) {
        super(gameObject)
    }

    public setTarget(target: IGameObject): void {
        this.target = target
        if (target) {
            this.highestY = target.getPosition().y
            const playerComponent = target.getComponent(Player as ComponentConstructor<Player>)
            if (playerComponent) {
                this.player = playerComponent
            } else {
                console.warn('CameraFollow: Target does not have a Player component.')
            }
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

        const desiredY = this.highestY + this.offset.y - 100
        const desiredPos = new Vector2(CONFIG.CANVAS.WIDTH / 2, desiredY)

        if (this.player) {
            if (this.player.isPlayerDead()) {
                if (!this.hasPlayerDied) {
                    this.hasPlayerDied = true
                    this.playerDeadTimer = 0
                } else {
                    this.playerDeadTimer += deltaTime / 1000
                }
            } else {
                this.hasPlayerDied = false
                this.playerDeadTimer = 0
            }
        }

        if (this.player && !this.player.isPlayerDead()) {
            transform.setPosition(desiredPos)
        } else if (this.hasPlayerDied && this.playerDeadTimer <= this.DEAD_FOLLOW_DURATION) {
            const dt = deltaTime / 1000
            const newPos = Vector2.lerp(currentPos, targetPos, this.smoothing * dt)
            transform.setPosition(newPos)
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
