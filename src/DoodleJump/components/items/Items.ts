import { Collider } from '../../../components/Collider'
import { Component } from '../../../core/Component'
import { GameEngine } from '../../../core/GameEngine'
import { CollisionLayer, ENGINE_EVENTS } from '../../../types/enums'
import { IGameObject, ComponentConstructor, GameEvent } from '../../../types/interface'

export abstract class Items extends Component {
    protected itemType: string
    protected isActive = true
    protected spawnTime: number

    constructor(gameObject: IGameObject, itemType: string) {
        super(gameObject)
        this.itemType = itemType
        this.spawnTime = Date.now()

        this.setupCollider()
        this.setupRenderer()
        this.setupItemSpecific()
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
    protected abstract setupItemSpecific(): void

    protected onPlayerCollision(event: GameEvent): void {
        const { other } = event.data as { other: Collider }
        console.log('Player collided with item:', this.itemType)
        if (other.getGameObject().tag === 'Player') {
            this.onPlayerHit(other.getGameObject())
        }
    }

    protected onPlayerHit(player: IGameObject): void {
        if (this.itemType !== 'trampoline') {
            this.deactivate()
        }
    }

    private deactivate(): void {
        this.isActive = false
        this.gameObject.setActive(false)
        const collider = this.gameObject.getComponent(Collider as ComponentConstructor<Collider>)
        if (collider && GameEngine.getInstance()) {
            GameEngine.getInstance().getCollisionManager().removeCollider(collider)
        }
        const currentScene = GameEngine.getInstance().getCurrentScene()
        if (currentScene) {
            currentScene.removeGameObject(this.gameObject)
        }
        this.gameObject.destroy()
    }

    public update(deltaTime: number): void {
        if (!this.isActive) return

        this.updateItem(deltaTime)
        this.checkBounds()
    }

    protected abstract updateItem(deltaTime: number): void

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
