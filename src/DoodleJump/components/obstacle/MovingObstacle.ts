import { Renderer } from '../../../components/Renderer'
import { Transform } from '../../../components/Transform'
import { CONFIG } from '../../../config/Config'
import { IGameObject, ComponentConstructor } from '../../../types/interface'
import { MathUtils } from '../../../utils/MathUtils'
import { Vector2 } from '../../../utils/Vector2'
import { GAME_CONFIG } from '../../config/GameplayConfig'
import { Obstacle } from './Obstacle'

export class MovingObstacle extends Obstacle {
    protected movingType: MovingType
    protected moveSpeed: number
    protected moveDirection: Vector2
    protected movePattern: MovingPattern
    protected startPosition: Vector2
    protected moveRange: number
    private moveTime = 0

    constructor(gameObject: IGameObject, movingType: MovingType = 'witch') {
        super(gameObject, `moving_${movingType}`)
        this.movingType = movingType
        this.startPosition = new Vector2(gameObject.getPosition().x, gameObject.getPosition().y)
        this.setupMovementParameters()
    }

    private setupMovementParameters(): void {
        switch (this.movingType) {
            case 'witch':
                this.moveSpeed = GAME_CONFIG.OBSTACLES.WITCH.MOVE_SPEED
                this.moveRange = GAME_CONFIG.OBSTACLES.WITCH.MOVE_RANGE
                this.movePattern = MathUtils.randomChoice(['horizontal', 'zigzag', 'circular'])
                break
            case 'flying_monster':
                this.moveSpeed = GAME_CONFIG.OBSTACLES.FLYING_MONSTER.MOVE_SPEED
                this.movePattern = MathUtils.randomChoice(['repeat'])
                break
        }

        this.moveDirection = this.getInitialDirection()
        this.gameObject
            .getComponent(Renderer as ComponentConstructor<Renderer>)
            ?.setFlip(this.moveDirection.x, 1)
    }

    private getInitialDirection(): Vector2 {
        switch (this.movePattern) {
            case 'horizontal':
                return new Vector2(MathUtils.randomSign(), 0)
            case 'vertical':
                return new Vector2(0, MathUtils.randomSign())
            case 'circular':
            case 'zigzag':
                return new Vector2(1, 0)
            case 'repeat':
                return new Vector2(MathUtils.randomSign(), 0)
            default:
                return new Vector2(1, 0)
        }
    }

    protected setupRenderer(): void {}

    protected setupObstacleSpecific(): void {}

    protected updateObstacle(deltaTime: number): void {
        this.moveTime += deltaTime / 1000
        this.updateMovement(deltaTime)
        this.updateSpecialBehaviors(deltaTime)
    }

    private updateMovement(deltaTime: number): void {
        const transform = this.gameObject.getComponent(Transform as ComponentConstructor<Transform>)
        if (!transform) return

        const currentPos = transform.getWorldPosition()
        let newPosition = currentPos.clone()
        switch (this.movePattern) {
            case 'horizontal':
                newPosition = this.updateHorizontalMovement(currentPos, deltaTime)
                break
            case 'vertical':
                newPosition = this.updateVerticalMovement(currentPos, deltaTime)
                break
            case 'circular':
                newPosition = this.updateCircularMovement(currentPos, deltaTime)
                break
            case 'zigzag':
                newPosition = this.updateZigzagMovement(currentPos, deltaTime)
                break
            case 'repeat':
                newPosition = this.updateRepeatMovement(currentPos, deltaTime)
        }

        transform.setPosition(newPosition)
    }

    private updateHorizontalMovement(currentPos: Vector2, deltaTime: number): Vector2 {
        const deltaX = this.moveDirection.x * this.moveSpeed * (deltaTime / 1000)
        let newX = currentPos.x + deltaX

        if (Math.abs(newX - this.startPosition.x) > this.moveRange) {
            this.moveDirection.x *= -1
            this.gameObject
                .getComponent(Renderer as ComponentConstructor<Renderer>)
                ?.setFlip(this.moveDirection.x, 1)
            newX = currentPos.x + this.moveDirection.x * this.moveSpeed * (deltaTime / 1000)
        }

        return new Vector2(newX, currentPos.y)
    }

    private updateRepeatMovement(currentPos: Vector2, deltaTime: number): Vector2 {
        const deltaX = this.moveDirection.x * this.moveSpeed * (deltaTime / 1000)
        let newX = currentPos.x + deltaX

        if (newX < -CONFIG.CANVAS) {
            newX = CONFIG.CANVAS.WIDTH
        } else if (newX > CONFIG.CANVAS.WIDTH) {
            newX = 0
        }

        return new Vector2(newX, currentPos.y)
    }

    private updateVerticalMovement(currentPos: Vector2, deltaTime: number): Vector2 {
        const deltaY = this.moveDirection.y * this.moveSpeed * (deltaTime / 1000)
        let newY = currentPos.y + deltaY

        if (Math.abs(newY - this.startPosition.y) > this.moveRange) {
            this.moveDirection.y *= -1
            newY = currentPos.y + this.moveDirection.y * this.moveSpeed * (deltaTime / 1000)
        }

        return new Vector2(currentPos.x, newY)
    }

    private updateCircularMovement(currentPos: Vector2, deltaTime: number): Vector2 {
        const radius = this.moveRange / 2
        const speed = this.moveSpeed / radius

        const angle = this.moveTime * speed
        const x = this.startPosition.x + Math.cos(angle) * radius
        const y = this.startPosition.y + Math.sin(angle) * radius * 0.5
        this.gameObject
            .getComponent(Renderer as ComponentConstructor<Renderer>)
            ?.setFlip(x > this.gameObject.getPosition().x ? 1 : -1, 1)

        return new Vector2(x, y)
    }

    private updateZigzagMovement(currentPos: Vector2, deltaTime: number): Vector2 {
        const horizontalSpeed = this.moveSpeed
        const verticalSpeed = this.moveSpeed * 0.5

        const deltaX = this.moveDirection.x * horizontalSpeed * (deltaTime / 1000)
        let newX = currentPos.x + deltaX

        const zigzagY =
            this.startPosition.y +
            Math.sin(this.moveTime * 3) * 30 * verticalSpeed * (deltaTime / 1000)

        if (Math.abs(newX - this.startPosition.x) > this.moveRange) {
            this.moveDirection.x *= -1
            newX = currentPos.x + this.moveDirection.x * horizontalSpeed * (deltaTime / 1000)
            this.gameObject
                .getComponent(Renderer as ComponentConstructor<Renderer>)
                ?.setFlip(this.moveDirection.x, 1)
        }

        return new Vector2(newX, zigzagY)
    }

    private updateSpecialBehaviors(deltaTime: number): void {}

    protected checkBounds(): void {
        const position = this.gameObject.getPosition()

        const distanceFromStart = Vector2.distance(position, this.startPosition)
        if (position.y > CONFIG.CANVAS.HEIGHT + 500 || distanceFromStart > this.moveRange * 3) {
            this.deactivate()
        }
    }

    public getMoveSpeed(): number {
        return this.moveSpeed
    }

    public setMoveSpeed(speed: number): void {
        this.moveSpeed = speed
    }
}
