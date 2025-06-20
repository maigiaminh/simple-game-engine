import { GAME_CONFIG } from '../config/GameConfig'
import { IGameObject, ComponentConstructor } from '../types/interface'
import { Color } from '../utils/Color'
import { MathUtils } from '../utils/MathUtils'
import { Vector2 } from '../utils/Vector2'
import { Obstacle } from './Obstacle'
import { Renderer } from './Renderer'
import { RigidBody } from './RigidBody'
import { Transform } from './Transform'

export class MovingObstacle extends Obstacle {
    protected movingType: 'bird' | 'cloud' | 'ufo'
    protected moveSpeed: number
    protected moveDirection: Vector2
    protected movePattern: 'horizontal' | 'circular' | 'zigzag' | 'vertical'
    protected startPosition: Vector2
    protected moveRange: number
    private moveTime = 0

    constructor(
        gameObject: IGameObject,
        movingType: 'bird' | 'cloud' | 'ufo' = 'bird',
        movePattern: 'horizontal' | 'circular' | 'zigzag' | 'vertical' = 'horizontal'
    ) {
        super(gameObject, `moving_${movingType}`)
        this.movingType = movingType
        this.movePattern = movePattern
        this.startPosition = new Vector2(gameObject.getPosition().x, gameObject.getPosition().y)
        this.setupMovementParameters()
    }

    private setupMovementParameters(): void {
        switch (this.movingType) {
            case 'bird':
                this.moveSpeed = GAME_CONFIG.OBSTACLES.BIRD.MOVE_SPEED
                this.moveRange = 100
                break
            case 'cloud':
                this.moveSpeed = 80
                this.moveRange = 150
                break
            case 'ufo':
                this.moveSpeed = 120
                this.moveRange = 200
                break
        }

        this.moveDirection = this.getInitialDirection()
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
            default:
                return new Vector2(1, 0)
        }
    }

    protected setupRenderer(): void {
        const renderer = this.gameObject.getComponent(Renderer as ComponentConstructor<Renderer>)
        if (renderer) {
            switch (this.movingType) {
                case 'bird':
                    renderer.setColor(Color.BROWN)
                    break
                case 'cloud':
                    renderer.setColor(new Color(255, 255, 255, 0.8))
                    break
                case 'ufo':
                    renderer.setColor(Color.SILVER)
                    break
            }
        }
    }

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
        }

        transform.setPosition(newPosition)
    }

    private updateHorizontalMovement(currentPos: Vector2, deltaTime: number): Vector2 {
        const deltaX = this.moveDirection.x * this.moveSpeed * (deltaTime / 1000)
        let newX = currentPos.x + deltaX

        if (Math.abs(newX - this.startPosition.x) > this.moveRange) {
            this.moveDirection.x *= -1
            newX = currentPos.x + this.moveDirection.x * this.moveSpeed * (deltaTime / 1000)
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
        }

        return new Vector2(newX, zigzagY)
    }

    private updateSpecialBehaviors(deltaTime: number): void {
        switch (this.movingType) {
            case 'bird':
                this.updateBirdBehavior(deltaTime)
                break
            case 'cloud':
                this.updateCloudBehavior(deltaTime)
                break
            case 'ufo':
                this.updateUfoBehavior(deltaTime)
                break
        }
    }

    private updateBirdBehavior(deltaTime: number): void {
        if (Math.random() < 0.001) {
            this.moveSpeed = GAME_CONFIG.OBSTACLES.BIRD.MOVE_SPEED * MathUtils.random(0.8, 1.2)
        }
    }

    private updateCloudBehavior(deltaTime: number): void {
        const renderer = this.gameObject.getComponent(Renderer as ComponentConstructor<Renderer>)
        if (renderer) {
            const alpha = (Math.sin(this.moveTime * 2) + 1) * 0.3 + 0.4 // 0.4 to 1.0
            const color = new Color(255, 255, 255, alpha)
            renderer.setColor(color)
        }
    }

    private updateUfoBehavior(deltaTime: number): void {
        const renderer = this.gameObject.getComponent(Renderer as ComponentConstructor<Renderer>)
        if (renderer) {
            const glow = Math.sin(this.moveTime * 5) * 0.3 + 0.7
            const color = new Color(
                Color.SILVER.r * glow,
                Color.SILVER.g * glow,
                Color.SILVER.b * glow,
                Color.SILVER.a
            )
            renderer.setColor(color)
        }
    }

    protected checkBounds(): void {
        const position = this.gameObject.getPosition()

        const distanceFromStart = Vector2.distance(position, this.startPosition)
        if (
            position.y > GAME_CONFIG.CANVAS.HEIGHT + 500 ||
            distanceFromStart > this.moveRange * 3
        ) {
            this.deactivate()
        }
    }

    protected onPlayerHit(player: IGameObject): void {
        if (this.movingType === 'cloud') {
            const playerRigidBody = player.getComponent(
                RigidBody as ComponentConstructor<RigidBody>
            )
            if (playerRigidBody) {
                const pushForce = this.moveDirection.multiply(200)
                playerRigidBody.addForce(pushForce)
            }

            this.dispatchEvent('playerPushed', {
                obstacle: this.gameObject,
                player: player,
                pushDirection: this.moveDirection,
            })
        } else {
            super.onPlayerHit(player)
        }
    }

    public getMovingType(): 'bird' | 'cloud' | 'ufo' {
        return this.movingType
    }

    public getMovePattern(): 'horizontal' | 'circular' | 'zigzag' | 'vertical' {
        return this.movePattern
    }

    public getMoveSpeed(): number {
        return this.moveSpeed
    }

    public setMoveSpeed(speed: number): void {
        this.moveSpeed = speed
    }
}
