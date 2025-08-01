import { Collider } from '../../../components/Collider'
import { Component } from '../../../core/Component'
import { GameEngine } from '../../../core/GameEngine'
import { CollisionLayer, ENGINE_EVENTS } from '../../../types/enums'
import { IGameObject, ComponentConstructor, GameEvent } from '../../../types/interface'
import { GAME_CONFIG } from '../../config/GameplayConfig'
import { GAME_EVENTS } from '../../types/enums'
import { Player } from '../Player'
import { Projectile } from '../Projectile/Projectile'

export abstract class Obstacle extends Component {
    protected obstacleType: string
    protected isActive = true

    constructor(gameObject: IGameObject, obstacleType: string) {
        super(gameObject)
        this.obstacleType = obstacleType

        this.setupCollider()
        this.setupRenderer()
        this.setupObstacleSpecific()
    }

    protected setupCollider(): void {
        const collider = this.gameObject.getComponent(Collider as ComponentConstructor<Collider>)
        if (collider) {
            collider.layers = [CollisionLayer.ENVIRONMENT]
            collider.mask = [CollisionLayer.PLAYER]
            collider.isTrigger = true

            collider.addEventListener(
                ENGINE_EVENTS.TRIGGER_ENTER,
                this.onPlayerCollision.bind(this)
            )

            collider.addEventListener(
                ENGINE_EVENTS.TRIGGER_ENTER,
                this.onProjectileCollision.bind(this)
            )
        }
    }

    protected abstract setupRenderer(): void
    protected abstract setupObstacleSpecific(): void

    protected onPlayerCollision(event: GameEvent): void {
        const { other } = event.data as { other: Collider }

        if (other.getGameObject().tag === 'Player') {
            this.onPlayerHit(other.getGameObject())
        }
    }

    protected onProjectileCollision(event: GameEvent): void {
        const { other } = event.data as { other: Collider }
        if (other.getGameObject().tag === 'Projectile') {
            this.onProjectileHit(other.getGameObject())
        }
    }

    protected onProjectileHit(projectile: IGameObject): void {
        if (this.gameObject.tag === 'landed_spike') return
        this.deactivate()
        const projectileComponent = projectile.getComponent(
            Projectile as ComponentConstructor<Projectile>
        )
        if (projectileComponent) {
            projectileComponent.deactivate()
        }
    }

    protected onPlayerHit(player: IGameObject): void {
        const playerComponent = player.getComponent(Player as ComponentConstructor<Player>)
        if (playerComponent) {
            playerComponent.dispatchEvent(GAME_EVENTS.PLAYER_HIT_OBSTACLE, {
                obstacle: this.gameObject,
                player: player,
                obstacleType: this.obstacleType,
            })
            GameEngine.getInstance().getAudioManager().playSound(GAME_CONFIG.AUDIO.SFX.HIT)
        }
    }

    public deactivate(): void {
        this.isActive = false
        this.gameObject.setActive(false)
        const collider = this.gameObject.getComponent(Collider as ComponentConstructor<Collider>)
        if (collider && GameEngine.getInstance()) {
            GameEngine.getInstance().getCollisionManager().removeCollider(collider)
        }
        GameEngine.getInstance().getAudioManager().playSound(GAME_CONFIG.AUDIO.SFX.DESTROY_OBSTACLE)
        const currentScene = GameEngine.getInstance().getCurrentScene()
        if (currentScene) {
            currentScene.removeGameObject(this.gameObject)
        }
        this.gameObject.destroy()
    }

    public isObstacleActive(): boolean {
        return this.isActive
    }

    public getObstacleType(): string {
        return this.obstacleType
    }

    public update(deltaTime: number): void {
        if (!this.isActive) return

        this.updateObstacle(deltaTime)
        this.checkBounds()
    }

    protected abstract updateObstacle(deltaTime: number): void

    protected checkBounds(): void {
        //
    }

    public render(ctx: CanvasRenderingContext2D): void {
        if (this.isActive) {
            this.renderEffects(ctx)
        }
    }

    protected renderEffects(ctx: CanvasRenderingContext2D): void {
        //
    }
}
