import { Collider } from '../../../components/Collider'
import { Component } from '../../../core/Component'
import { GameEngine } from '../../../core/GameEngine'
import { CollisionLayer, ENGINE_EVENTS } from '../../../types/enums'
import { IGameObject, ComponentConstructor, GameEvent } from '../../../types/interface'
import { GAME_EVENTS } from '../../types/enums'

export abstract class Obstacle extends Component {
    protected obstacleType: string
    protected isActive = true
    protected spawnTime: number

    constructor(gameObject: IGameObject, obstacleType: string) {
        super(gameObject)
        this.obstacleType = obstacleType
        this.spawnTime = Date.now()
    }

    public onAwake(): void {
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

    protected onPlayerHit(player: IGameObject): void {
        this.dispatchEvent(GAME_EVENTS.PLAYER_HIT_OBSTACLE, {
            obstacle: this.gameObject,
            player: player,
            obstacleType: this.obstacleType,
        })

        this.deactivate()
    }

    public deactivate(): void {
        this.isActive = false
        this.gameObject.setActive(false)

        const collider = this.gameObject.getComponent(Collider as ComponentConstructor<Collider>)
        if (collider && GameEngine.getInstance()) {
            GameEngine.getInstance().getCollisionManager().removeCollider(collider)
        }
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

    protected checkBounds(): void {}

    public render(ctx: CanvasRenderingContext2D): void {
        if (this.isActive) {
            this.renderEffects(ctx)
        }
    }

    protected renderEffects(ctx: CanvasRenderingContext2D): void {}
}
