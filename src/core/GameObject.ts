import { SerializedData } from '../types/general'
import { EventEmitter } from './EventEmitter'
import { Transform } from '../components/Transform'
import { Vector2 } from '../utils/Vector2'
import { IGameObject, IComponent, GameObjectConfig, ComponentConstructor } from '../types/interface'

export class GameObject extends EventEmitter implements IGameObject {
    public readonly id: string
    public name: string
    public tag: string
    public layer: number

    private components: Map<string, IComponent> = new Map()
    private destroyed = false
    private active = true
    private visible = true

    private started = false
    private awaken = false

    constructor(config: GameObjectConfig = {}) {
        super()
        this.id = this.generateId()
        this.name = config.name || `GameObject_${this.id}`
        this.tag = config.tag || 'Untagged'
        this.layer = config.layer || 0
        this.active = config.active !== false

        const position = config.position
            ? new Vector2(config.position.x, config.position.y)
            : Vector2.zero()
        this.addComponent(new Transform(this, position))

        if (config.rotation || config.scale) {
            const transform = this.getTransform()
            if (config.rotation) transform.setRotation(config.rotation)
            if (config.scale) transform.setScale(config.scale)
        }
    }

    private generateId(): string {
        return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
    }

    public addComponent<T extends IComponent>(component: T): T {
        const componentName = component.getType()

        if (this.components.has(componentName)) {
            this.removeComponent(component.constructor as ComponentConstructor<T>)
        }

        this.components.set(componentName, component)

        if (this.awaken) {
            component.awake()
        }

        if (this.started) {
            component.start()
        }

        this.dispatchEvent('componentAdded', { component })
        return component
    }

    public getComponent<T extends IComponent>(componentClass: ComponentConstructor<T>): T | null {
        const componentName = componentClass.name
        return (this.components.get(componentName) as T) || null
    }

    public removeComponent<T extends IComponent>(componentClass: ComponentConstructor<T>): void {
        const componentName = componentClass.name
        const component = this.components.get(componentName)

        if (component) {
            component.onDestroy()
            this.components.delete(componentName)
            this.dispatchEvent('componentRemoved', { component })
        }
    }

    public hasComponent<T extends IComponent>(componentClass: ComponentConstructor<T>): boolean {
        const componentName = componentClass.name
        return this.components.has(componentName)
    }

    public getAllComponents(): IComponent[] {
        return Array.from(this.components.values())
    }

    public getTransform(): Transform {
        return this.getComponent(Transform as ComponentConstructor<Transform>)!
    }

    public awake(): void {
        if (this.awaken) return

        this.components.forEach((component) => component.awake())
        this.onAwake()
        this.awaken = true
    }

    public start(): void {
        if (this.started) return

        this.components.forEach((component) => component.start())
        this.onStart()
        this.started = true
    }

    protected onAwake(): void {}

    protected onStart(): void {}

    public onEnable(): void {
        this.components.forEach((component) => component.onEnable())
    }

    public onDisable(): void {
        this.components.forEach((component) => component.onDisable())
    }

    public setActive(active: boolean): void {
        const wasActive = this.active
        this.active = active

        if (active && !wasActive) {
            this.onEnable()
            this.dispatchEvent('activated')
        } else if (!active && wasActive) {
            this.onDisable()
            this.dispatchEvent('deactivated')
        }
    }

    public isActive(): boolean {
        return this.active && !this.destroyed
    }

    public setEnabled(enabled: boolean): void {
        this.setActive(enabled)
    }

    public isEnabled(): boolean {
        return this.isActive()
    }

    public setVisible(visible: boolean): void {
        this.visible = visible
    }

    public isVisible(): boolean {
        return this.visible
    }

    public getPosition(): Vector2 {
        return this.getTransform().getWorldPosition()
    }

    public setPosition(position: Vector2): void {
        this.getTransform().setPosition(position)
    }

    public getRotation(): number {
        return this.getTransform().getWorldRotation()
    }

    public setRotation(rotation: number): void {
        this.getTransform().setRotation(rotation)
    }

    public translate(delta: Vector2): void {
        this.getTransform().translate(delta)
    }

    public rotate(angle: number): void {
        this.getTransform().rotate(angle)
    }

    public update(deltaTime: number): void {
        if (!this.isActive()) return

        this.components.forEach((component) => {
            if (component.isEnabled()) {
                component.update(deltaTime)
            }
        })

        this.onUpdate(deltaTime)
    }

    public render(ctx: CanvasRenderingContext2D): void {
        if (!this.isActive()) return

        this.components.forEach((component) => {
            if (component.isVisible()) {
                component.render(ctx)
            }
        })

        this.onRender(ctx)
    }

    protected onUpdate(deltaTime: number): void {}

    protected onRender(ctx: CanvasRenderingContext2D): void {}

    public destroy(): void {
        if (this.destroyed) return

        this.destroyed = true

        this.components.forEach((component) => component.onDestroy())
        this.components.clear()

        this.onDestroy()
        this.removeAllEventListeners()
        this.dispatchEvent('destroy')
    }

    public isDestroyed(): boolean {
        return this.destroyed
    }

    public onDestroy(): void {}

    public serialize(): SerializedData {
        const componentData: SerializedData = {}

        this.components.forEach((component, name) => {
            componentData[name] = component.serialize()
        })

        return {
            id: this.id,
            name: this.name,
            tag: this.tag,
            layer: this.layer,
            active: this.active,
            components: componentData,
        }
    }

    public deserialize(data: SerializedData): void {
        if (typeof data.name === 'string') {
            this.name = data.name
        }
        if (typeof data.tag === 'string') {
            this.tag = data.tag
        }
        if (typeof data.layer === 'number') {
            this.layer = data.layer
        }
        this.active = data.active !== false

        if (data.components && typeof data.components === 'object' && data.components !== null) {
            this.components.forEach((component, name) => {
                if (
                    Object.prototype.hasOwnProperty.call(data.components, name) &&
                    (data.components as Record<string, unknown>)[name]
                ) {
                    component.deserialize(
                        (data.components as Record<string, SerializedData>)[name] as SerializedData
                    )
                }
            })
        }
    }

    public static createEmpty(name?: string): GameObject {
        return new GameObject({ name })
    }

    public static createWithTransform(
        position?: Vector2,
        rotation?: number,
        scale?: Vector2
    ): GameObject {
        return new GameObject({ position, rotation, scale })
    }
}
