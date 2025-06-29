import { AnimatedRenderer } from '../../components/AnimatedRenderer'
import { Collider } from '../../components/Collider'
import { RigidBody } from '../../components/RigidBody'
import { Transform } from '../../components/Transform'
import { CONFIG } from '../../config/Config'
import { Component } from '../../core/Component'
import { GameEngine } from '../../core/GameEngine'
import { GameObject } from '../../core/GameObject'
import { ColliderType, CollisionLayer, ENGINE_EVENTS } from '../../types/enums'
import { IGameObject, ComponentConstructor, GameEvent, CollisionInfo } from '../../types/interface'
import { Vector2 } from '../../utils/Vector2'
import { GAME_CONFIG } from '../config/GameplayConfig'
import { GAME_EVENTS } from '../types/enums'
import { BreakablePlatform } from './platform/BreakablePlatform'
import { Projectile } from './Projectile/Projectile'

export class Player extends Component {
    private isGrounded = false
    private isUsingJetpack = false
    private jetpack = GAME_CONFIG.ITEMS.JETPACK
    private currentFuel = 0
    private isDead = false

    private inputLeft = false
    private inputRight = false
    private inputShoot = false

    private transform: Transform
    private rigidBody: RigidBody
    private collider: Collider
    private animatedRenderer: AnimatedRenderer

    private shootCooldown = 0
    private readonly SHOOT_INTERVAL = 800

    constructor(gameObject: IGameObject) {
        super(gameObject)
    }

    public onAwake(): void {
        const transform = this.gameObject.getComponent(Transform as ComponentConstructor<Transform>)
        if (!transform) {
            console.error('Player missing Transform component!')
            return
        }
        const rigidBody = this.gameObject.getComponent(RigidBody as ComponentConstructor<RigidBody>)
        if (!rigidBody) {
            console.error('Player missing RigidBody component!')
            return
        }
        const collider = this.gameObject.getComponent(Collider as ComponentConstructor<Collider>)
        if (!collider) {
            console.error('Player missing Collider component!')
            return
        }
        const animatedRenderer = this.gameObject.getComponent(
            AnimatedRenderer as ComponentConstructor<AnimatedRenderer>
        )
        if (!animatedRenderer) {
            console.error('Player missing AnimatedRenderer component!')
            return
        }
        this.transform = transform
        this.rigidBody = rigidBody
        this.collider = collider
        this.animatedRenderer = animatedRenderer

        this.animatedRenderer.setVisible(true)

        this.collider.setColliderSize(
            this.animatedRenderer.getWidth() - 48,
            this.animatedRenderer.getHeight()
        )
        this.collider.setColliderType(ColliderType.BOX)
        this.collider.layers = [CollisionLayer.PLAYER]
        this.collider.mask = [CollisionLayer.GROUND, CollisionLayer.ENVIRONMENT]

        this.collider.addEventListener(
            ENGINE_EVENTS.COLLISION_ENTER,
            this.onCollisionEnter.bind(this)
        )
        this.collider.addEventListener(
            ENGINE_EVENTS.COLLISION_EXIT,
            this.onCollisionExit.bind(this)
        )

        this.addEventListener(GAME_EVENTS.PLAYER_HIT_OBSTACLE, this.onPlayerHitObstacle.bind(this))

        GameEngine.getInstance().getCollisionManager().addCollider(this.collider)

        this.gameObject.tag = 'Player'
    }

    public setInput(left: boolean, right: boolean, shoot: boolean): void {
        this.inputLeft = left
        this.inputRight = right
        this.inputShoot = shoot
    }

    public update(deltaTime: number): void {
        if (!this.transform || !this.rigidBody) return

        this.handleInput()
        this.updateMovement()
        this.checkBounds()
        this.updateVisuals()
        this.handleJetpack(deltaTime)
        this.updateAudio()

        if (this.shootCooldown > 0) {
            this.shootCooldown -= deltaTime
        }
    }

    public setUsingJetpack(isUsing: boolean): void {
        this.isUsingJetpack = isUsing
        this.currentFuel = isUsing ? this.jetpack.FUEL : 0
    }

    private handleJetpack(deltaTime: number): void {
        if (!this.isUsingJetpack) return
        if (this.isDead || this.currentFuel <= 0) {
            this.setUsingJetpack(false)
            return
        }

        const dt = deltaTime * 0.001

        this.currentFuel -= this.jetpack.FUEL_CONSUMPTION_RATE * dt
        if (this.currentFuel <= 0) {
            this.setUsingJetpack(false)
        }
    }

    private handleInput(): void {
        if (this.isDead) return
        const velocity = this.rigidBody.getVelocity()

        if (this.inputLeft) {
            this.rigidBody.setVelocity(new Vector2(-GAME_CONFIG.PLAYER.MOVE_SPEED, velocity.y))
        } else if (this.inputRight) {
            this.rigidBody.setVelocity(new Vector2(GAME_CONFIG.PLAYER.MOVE_SPEED, velocity.y))
        } else {
            this.rigidBody.setVelocity(new Vector2(velocity.x * 0.8, velocity.y))
        }

        if (this.inputShoot) {
            this.shoot()
        }

        if (this.isUsingJetpack) {
            this.jump()
        }
    }

    private jump(): void {
        if (!this.isUsingJetpack) {
            GameEngine.getInstance().getAudioManager().playSound(GAME_CONFIG.AUDIO.SFX.JUMP)
        }
        this.rigidBody.setVelocity(
            new Vector2(this.rigidBody.getVelocity().x, GAME_CONFIG.PLAYER.JUMP_FORCE)
        )
        this.isGrounded = false
    }

    private shoot(): void {
        if (this.isDead) return
        if (this.shootCooldown > 0) return

        this.shootCooldown = this.SHOOT_INTERVAL
        const projectileGO = new GameObject({
            name: 'Projectile',
            position: this.transform.getWorldPosition(),
            tag: 'Projectile',
            layer: 10,
        })
        projectileGO.addComponent(new Projectile(projectileGO))
        GameEngine.getInstance().getAudioManager().playSound(GAME_CONFIG.AUDIO.SFX.SHOOT)
    }

    private updateMovement(): void {
        const velocity = this.rigidBody.getVelocity()
        if (velocity.y > GAME_CONFIG.PLAYER.MAX_FALL_SPEED) {
            this.rigidBody.setVelocity(new Vector2(velocity.x, GAME_CONFIG.PLAYER.MAX_FALL_SPEED))
        }
    }

    private checkBounds(): void {
        const position = this.transform.getWorldPosition()

        if (position.x < this.collider.width / 2) {
            this.transform.setPosition(
                new Vector2(CONFIG.CANVAS.WIDTH + this.collider.width / 2, position.y)
            )
        } else if (position.x > CONFIG.CANVAS.WIDTH + this.collider.width / 2) {
            this.transform.setPosition(new Vector2(this.collider.width / 2, position.y))
        }
    }

    private updateVisuals(): void {
        if (!this.animatedRenderer) return
        if (this.isDead) return

        const velocity = this.rigidBody.getVelocity()

        if (this.isUsingJetpack) {
            if (velocity.x > 1) {
                this.animatedRenderer.playAnimation(
                    GAME_CONFIG.ANIMATIONS.PLAYER_MOVE_RIGHT_JETPACK.Name
                )
            } else if (velocity.x < -1) {
                this.animatedRenderer.playAnimation(
                    GAME_CONFIG.ANIMATIONS.PLAYER_MOVE_LEFT_JETPACK.Name
                )
            } else {
                this.animatedRenderer.playAnimation(GAME_CONFIG.ANIMATIONS.PLAYER_IDLE_JETPACK.Name)
            }
        } else {
            if (velocity.x > 1) {
                this.animatedRenderer.playAnimation(GAME_CONFIG.ANIMATIONS.PLAYER_MOVE_RIGHT.Name)
            } else if (velocity.x < -1) {
                this.animatedRenderer.playAnimation(GAME_CONFIG.ANIMATIONS.PLAYER_MOVE_LEFT.Name)
            } else {
                this.animatedRenderer.playAnimation(GAME_CONFIG.ANIMATIONS.PLAYER_IDLE.Name)
            }
        }
    }

    private updateAudio(): void {
        if (this.isDead) return
        const velocity = this.rigidBody.getVelocity()
        if (this.isGrounded) {
            if (velocity.x > 1 || velocity.x < -1) {
                GameEngine.getInstance().getAudioManager().playSound(GAME_CONFIG.AUDIO.SFX.WALK)
            }
        }
    }

    private onCollisionEnter(event: GameEvent): void {
        const { other, collisionInfo } = event.data as {
            other: Collider
            collisionInfo: CollisionInfo
        }
        if (other.isTrigger) return
        if (
            this.rigidBody.velocity.y > 0 &&
            this.transform.getWorldPosition().y + this.collider.height * 0.75 <
                (() => {
                    const otherTransform = other
                        .getGameObject()
                        .getComponent(Transform as ComponentConstructor<Transform>)
                    return otherTransform ? otherTransform.getWorldPosition().y : 0
                })()
        ) {
            if (other.getGameObject().tag === 'breakable_platform') {
                const breakablePlatform = other
                    .getGameObject()
                    .getComponent(BreakablePlatform as ComponentConstructor<BreakablePlatform>)
                if (breakablePlatform) {
                    breakablePlatform.breakPlatform()
                }
            }
            if (!this.rigidBody.isGrounded) this.rigidBody.isGrounded = true
            const transform = this.gameObject.getComponent(
                Transform as ComponentConstructor<Transform>
            )
            const otherTransform = other
                .getGameObject()
                .getComponent(Transform as ComponentConstructor<Transform>)

            if (transform && otherTransform) {
                this.transform.setPosition(
                    new Vector2(
                        transform.getWorldPosition().x,
                        otherTransform.getWorldPosition().y -
                            other.height / 2 -
                            this.collider.height / 2 +
                            8
                    )
                )
            }

            this.isGrounded = true
            this.rigidBody.setVelocity(new Vector2(this.rigidBody.getVelocity().x, 0))
            this.jump()
        }
    }

    private onCollisionExit(event: GameEvent): void {
        const { other } = event.data as { other: Collider }
        this.isGrounded = false
        this.rigidBody.isGrounded = false
    }

    private onPlayerHitObstacle(event: GameEvent): void {
        if (this.isDead) return
        this.isDead = true
        this.gameObject.removeComponent(Collider as ComponentConstructor<Collider>)
        GameEngine.getInstance().getCollisionManager().removeCollider(this.collider)
        this.rigidBody.setVelocity(new Vector2(0, GAME_CONFIG.PLAYER.JUMP_FORCE))
        this.animatedRenderer.playAnimation(GAME_CONFIG.ANIMATIONS.PLAYER_DEAD.Name)
        this.getGameObject().destroy
    }

    public getScore(): number {
        if (!this.transform) return 0

        const startY = CONFIG.CANVAS.HEIGHT - 150
        const currentY = this.transform.getWorldPosition().y
        return Math.max(0, Math.floor((startY - currentY) / 10))
    }

    public setPlayerDead(isDead: boolean): void {
        this.isDead = isDead
    }

    public isPlayerDead(): boolean {
        return this.isDead
    }

    public render(ctx: CanvasRenderingContext2D): void {
        //
    }
}
