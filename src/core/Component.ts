import { IComponent, IGameObject } from '../types/interface'
import { EventEmitter } from './EventEmitter'

export abstract class Component extends EventEmitter implements IComponent {
    protected gameObject: IGameObject
    protected enabled = true
    protected destroyed = false
    protected started = false
    protected awoken = false

    constructor(gameObject: IGameObject) {
        super()
        this.gameObject = gameObject
    }

    public getGameObject(): IGameObject {
        return this.gameObject
    }

    public getType(): string {
        return this.constructor.name
    }

    public setEnabled(enabled: boolean): void {
        const wasEnabled = this.enabled
        this.enabled = enabled

        if (enabled && !wasEnabled) {
            this.onEnable()
        } else if (!enabled && wasEnabled) {
            this.onDisable()
        }
    }

    public isEnabled(): boolean {
        return this.enabled && this.gameObject.isActive() && !this.destroyed
    }

    public setVisible(visible: boolean): void {}

    public isVisible(): boolean {
        return this.isEnabled()
    }

    public awake(): void {
        if (this.awoken) return
        this.onAwake()
        this.awoken = true
    }

    public start(): void {
        if (this.started) return
        this.onStart()
        this.started = true
    }

    protected onAwake(): void {}

    protected onStart(): void {}

    public onEnable(): void {}

    public onDisable(): void {}

    public onDestroy(): void {
        this.destroyed = true
        this.removeAllEventListeners()
    }

    public abstract update(deltaTime: number): void
    public abstract render(ctx: CanvasRenderingContext2D): void

    public serialize(): SerializedData {
        return {
            type: this.getType(),
            enabled: this.enabled,
        }
    }

    public deserialize(data: SerializedData): void {
        this.enabled = typeof data.enabled === 'boolean' ? data.enabled : true
    }
}
