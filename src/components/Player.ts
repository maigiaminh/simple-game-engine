// Cập nhật file: src/components/Player.ts
import { Component } from '../core/Component'
import { Transform } from './Transform'
import { RigidBody } from './RigidBody'
import { Collider } from './Collider'
import { Renderer } from './Renderer'
import { IGameObject, ComponentConstructor, GameEvent, CollisionInfo } from '../types/interface'
import { CollisionLayer } from '../types/enums'
import { Vector2 } from '../utils/Vector2'
import { Color } from '../utils/Color'
import { GAME_CONFIG } from '../config/GameConfig'

export class Player extends Component {
    private isGrounded = false
    private canJump = true

    private inputLeft = false
    private inputRight = false
    private inputJump = false

    private transform!: Transform
    private rigidBody!: RigidBody
    private collider!: Collider
    private renderer!: Renderer

    constructor(gameObject: IGameObject) {
        super(gameObject)
    }

    public onAwake(): void {
        console.log('🔵 Player awakening...')

        this.transform = this.gameObject.getComponent(Transform as ComponentConstructor<Transform>)!
        this.rigidBody = this.gameObject.getComponent(RigidBody as ComponentConstructor<RigidBody>)!
        this.collider = this.gameObject.getComponent(Collider as ComponentConstructor<Collider>)!
        this.renderer = this.gameObject.getComponent(Renderer as ComponentConstructor<Renderer>)!

        console.log('Player components check:', {
            transform: !!this.transform,
            rigidBody: !!this.rigidBody,
            collider: !!this.collider,
            renderer: !!this.renderer,
        })

        if (!this.transform || !this.rigidBody || !this.collider || !this.renderer) {
            console.error('Player missing components!')
            return
        }

        this.renderer.setColor(Color.BLUE)
        this.renderer.setVisible(true)

        this.collider.layers = [CollisionLayer.PLAYER]
        this.collider.mask = [CollisionLayer.GROUND, CollisionLayer.ENVIRONMENT]

        this.collider.addEventListener('collisionEnter', this.onCollisionEnter.bind(this))
        this.collider.addEventListener('collisionExit', this.onCollisionExit.bind(this))

        this.gameObject.tag = 'Player'
    }

    public setInput(left: boolean, right: boolean, jump: boolean): void {
        if (!jump) {
            this.inputLeft = left
            this.inputRight = right
        }

        this.inputJump = jump
    }

    public update(deltaTime: number): void {
        if (!this.transform || !this.rigidBody) return

        this.handleInput()
        this.updateMovement()
        this.checkBounds()
        this.updateVisuals()
    }

    private handleInput(): void {
        const velocity = this.rigidBody.getVelocity()

        if (this.inputLeft) {
            this.rigidBody.setVelocity(new Vector2(-GAME_CONFIG.PLAYER.MOVE_SPEED, velocity.y))
        } else if (this.inputRight) {
            this.rigidBody.setVelocity(new Vector2(GAME_CONFIG.PLAYER.MOVE_SPEED, velocity.y))
        } else {
            this.rigidBody.setVelocity(new Vector2(velocity.x * 0.8, velocity.y))
        }

        if (this.inputJump && this.canJump && this.isGrounded) {
            this.jump()
        }
    }

    private jump(): void {
        console.log('Player jumped!')
        this.rigidBody.setVelocity(
            new Vector2(this.rigidBody.getVelocity().x, GAME_CONFIG.PLAYER.JUMP_FORCE)
        )
        this.isGrounded = false
        this.canJump = false

        this.dispatchEvent('playerJump')
    }

    private updateMovement(): void {
        const velocity = this.rigidBody.getVelocity()
        if (velocity.y > GAME_CONFIG.PLAYER.MAX_FALL_SPEED) {
            this.rigidBody.setVelocity(new Vector2(velocity.x, GAME_CONFIG.PLAYER.MAX_FALL_SPEED))
        }
    }

    private checkBounds(): void {
        const position = this.transform.getWorldPosition()

        if (position.x < -GAME_CONFIG.PLAYER.WIDTH / 2) {
            this.transform.setPosition(
                new Vector2(GAME_CONFIG.CANVAS.WIDTH + GAME_CONFIG.PLAYER.WIDTH / 2, position.y)
            )
        } else if (position.x > GAME_CONFIG.CANVAS.WIDTH + GAME_CONFIG.PLAYER.WIDTH / 2) {
            this.transform.setPosition(new Vector2(-GAME_CONFIG.PLAYER.WIDTH / 2, position.y))
        }

        if (position.y > GAME_CONFIG.CANVAS.HEIGHT + 200) {
            console.log('💀 Player fell! Respawning...')
            this.respawn()
        }
    }

    private updateVisuals(): void {
        if (!this.renderer) return

        const velocity = this.rigidBody.getVelocity()

        if (this.isGrounded) {
            if (Math.abs(velocity.x) > 10) {
                this.renderer.setColor(Color.GREEN)
            } else {
                this.renderer.setColor(Color.BLUE)
            }
        } else {
            if (velocity.y < 0) {
                this.renderer.setColor(Color.YELLOW)
            } else {
                this.renderer.setColor(Color.RED)
            }
        }
    }

    private onCollisionEnter(event: GameEvent): void {
        const { other, collisionInfo } = event.data as {
            other: Collider
            collisionInfo: CollisionInfo
        }

        if (
            this.rigidBody.velocity.y > 0 &&
            this.transform.getWorldPosition().y <
                other
                    .getGameObject()
                    .getComponent(Transform as ComponentConstructor<Transform>)!
                    .getWorldPosition().y
        ) {
            if (!this.rigidBody.isGrounded) this.rigidBody.isGrounded = true
            const transform = this.gameObject.getComponent(
                Transform as ComponentConstructor<Transform>
            )
            const otherTransform = other
                .getGameObject()
                .getComponent(Transform as ComponentConstructor<Transform>)

            this.transform.setPosition(
                new Vector2(
                    transform!.getWorldPosition().x,
                    otherTransform!.getWorldPosition().y - other.height + 0.01
                )
            )
            this.isGrounded = true
            this.canJump = true
            this.rigidBody.setVelocity(new Vector2(this.rigidBody.getVelocity().x, 0))
        }
    }

    private onCollisionExit(event: GameEvent): void {
        const { other } = event.data as { other: Collider }
        this.isGrounded = false
        this.canJump = false
        this.rigidBody.isGrounded = false
    }

    private respawn(): void {
        this.transform.setPosition(
            new Vector2(GAME_CONFIG.CANVAS.WIDTH / 2, GAME_CONFIG.CANVAS.HEIGHT - 800)
        )

        this.rigidBody.setVelocity(Vector2.zero())

        this.isGrounded = false
        this.canJump = true

        console.log('🔄 Player respawned!')
    }

    public getScore(): number {
        if (!this.transform) return 0

        const startY = GAME_CONFIG.CANVAS.HEIGHT - 150
        const currentY = this.transform.getWorldPosition().y
        return Math.max(0, Math.floor((startY - currentY) / 10))
    }

    public render(ctx: CanvasRenderingContext2D): void {}
}
