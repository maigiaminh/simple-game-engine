import { Camera } from '../components/Camera'
import { Transform } from '../components/Transform'
import { CONFIG } from '../config/Config'
import { ENGINE_EVENTS, SceneState } from '../types/enums'
import { ComponentConstructor, IGameObject } from '../types/interface'
import { EventEmitter } from './EventEmitter'
import { GameEngine } from './GameEngine'

export abstract class Scene extends EventEmitter {
    protected gameObjects: Map<string, IGameObject> = new Map()
    protected gameObjectsByTag: Map<string, Set<IGameObject>> = new Map()
    protected gameObjectsByLayer: Map<number, Set<IGameObject>> = new Map()

    protected name: string
    protected state: SceneState = SceneState.NOT_LOADED
    protected loadProgress = 0

    protected mainCamera: Camera | null = null

    private enabled = true
    private visible = true

    public setEnabled(enabled: boolean): void {
        this.enabled = enabled
    }

    public isEnabled(): boolean {
        return this.enabled
    }

    public setVisible(visible: boolean): void {
        this.visible = visible
    }

    public isVisible(): boolean {
        return this.visible
    }

    public setMainCamera(camera: Camera): void {
        this.mainCamera = camera
        this.dispatchEvent(ENGINE_EVENTS.MAIN_CAMERA_SET, { camera })
    }

    constructor(name: string) {
        super()
        this.name = name
    }

    protected abstract onUpdate(deltaTime: number): void
    protected abstract onRender(ctx: CanvasRenderingContext2D): void

    public getName(): string {
        return this.name
    }

    public getState(): SceneState {
        return this.state
    }

    public getLoadProgress(): number {
        return this.loadProgress
    }

    public addGameObject(gameObject: IGameObject): void {
        this.gameObjects.set(gameObject.id, gameObject)

        if (!this.gameObjectsByTag.has(gameObject.tag)) {
            this.gameObjectsByTag.set(gameObject.tag, new Set())
        }

        const tagSet = this.gameObjectsByTag.get(gameObject.tag)
        if (tagSet) {
            tagSet.add(gameObject)
        }

        if (!this.gameObjectsByLayer.has(gameObject.layer)) {
            this.gameObjectsByLayer.set(gameObject.layer, new Set())
        }
        const layerSet = this.gameObjectsByLayer.get(gameObject.layer)
        if (layerSet) {
            layerSet.add(gameObject)
        }

        if (this.state === SceneState.LOADED) {
            gameObject.awake()
            gameObject.start()
        }

        this.dispatchEvent(ENGINE_EVENTS.GAME_OBJECT_ADDED, { gameObject })
    }

    public removeGameObject(gameObject: IGameObject): void {
        if (!this.gameObjects.has(gameObject.id)) return

        this.gameObjects.delete(gameObject.id)

        const tagSet = this.gameObjectsByTag.get(gameObject.tag)
        if (tagSet) {
            tagSet.delete(gameObject)
            if (tagSet.size === 0) {
                this.gameObjectsByTag.delete(gameObject.tag)
            }
        }

        const layerSet = this.gameObjectsByLayer.get(gameObject.layer)
        if (layerSet) {
            layerSet.delete(gameObject)
            if (layerSet.size === 0) {
                this.gameObjectsByLayer.delete(gameObject.layer)
            }
        }

        this.dispatchEvent(ENGINE_EVENTS.GAME_OBJECT_REMOVED, { gameObject })
    }

    public findGameObject(id: string): IGameObject | null {
        return this.gameObjects.get(id) || null
    }

    public findGameObjectByName(name: string): IGameObject | null {
        for (const gameObject of this.gameObjects.values()) {
            if (gameObject.name === name) {
                return gameObject
            }
        }
        return null
    }

    public findGameObjectByTag(tag: string): IGameObject | null {
        const tagSet = this.gameObjectsByTag.get(tag)
        return tagSet ? Array.from(tagSet)[0] || null : null
    }

    public findGameObjectsByTag(tag: string): IGameObject[] {
        const tagSet = this.gameObjectsByTag.get(tag)
        return tagSet ? Array.from(tagSet) : []
    }

    public getAllGameObjects(): IGameObject[] {
        return Array.from(this.gameObjects.values())
    }

    public getGameObjectCount(): number {
        return this.gameObjects.size
    }

    public load(): void {
        if (this.state !== SceneState.NOT_LOADED) return

        this.state = SceneState.LOADING
        this.loadProgress = 0

        try {
            this.onLoad()

            this.gameObjects.forEach((gameObject) => {
                gameObject.awake()
            })

            this.gameObjects.forEach((gameObject) => {
                gameObject.start()
            })

            this.state = SceneState.LOADED
            this.loadProgress = 1
            this.dispatchEvent(ENGINE_EVENTS.SCENE_LOADED)
        } catch (error) {
            this.state = SceneState.NOT_LOADED
            this.dispatchEvent(ENGINE_EVENTS.SCENE_LOAD_ERROR, { error })
            throw error
        }
    }

    public unload(): void {
        if (this.state !== SceneState.LOADED) return

        this.state = SceneState.UNLOADING

        try {
            this.gameObjects.forEach((gameObject) => gameObject.destroy())
            this.gameObjects.clear()
            this.gameObjectsByTag.clear()
            this.gameObjectsByLayer.clear()

            this.onUnload()

            this.state = SceneState.NOT_LOADED
            this.loadProgress = 0
            this.dispatchEvent(ENGINE_EVENTS.SCENE_UNLOADED)
        } catch (error) {
            this.dispatchEvent(ENGINE_EVENTS.SCENE_UNLOAD_ERROR, { error })
            throw error
        }
    }

    protected abstract onLoad(): void
    protected abstract onUnload(): void

    public update(deltaTime: number): void {
        if (this.state !== SceneState.LOADED) return

        const destroyed: string[] = []
        this.gameObjects.forEach((gameObject, id) => {
            if (gameObject.isDestroyed()) {
                destroyed.push(id)
            }
        })

        destroyed.forEach((id) => {
            const gameObject = this.gameObjects.get(id)
            if (gameObject) {
                this.removeGameObject(gameObject)
            }
        })

        this.gameObjects.forEach((gameObject) => {
            if (gameObject.isActive()) {
                gameObject.update(deltaTime)
            }
        })

        this.onUpdate(deltaTime)
    }

    public render(ctx: CanvasRenderingContext2D): void {
        if (this.state !== SceneState.LOADED) return
        ctx.save()

        const camera = this.getMainCamera()
        if (camera) {
            const transform = camera
                .getGameObject()
                .getComponent(Transform as ComponentConstructor<Transform>)
            if (transform) {
                const cameraPos = transform.getWorldPosition()
                ctx.translate(0, -cameraPos.y + CONFIG.CANVAS.HEIGHT / 2)
            }
        }

        this.onRender(ctx)
        this.renderGameObjects(ctx)

        ctx.restore()
        GameEngine.getInstance().getUIManager().render(ctx)
    }

    private renderGameObjects(ctx: CanvasRenderingContext2D): void {
        const sortedObjects = Array.from(this.gameObjects.values())
            .filter((obj) => obj.isActive())
            .sort((a, b) => a.layer - b.layer)
        sortedObjects.forEach((gameObject) => {
            if (gameObject.isVisible()) {
                gameObject.render(ctx)
            }
        })
    }

    public getMainCamera(): Camera | null {
        return this.mainCamera
    }

    public serialize(): SerializedData {
        const gameObjectData: SerializedData = {}
        this.gameObjects.forEach((obj, id) => {
            gameObjectData[id] = obj.serialize()
        })

        return {
            name: this.name,
            gameObjects: gameObjectData,
        }
    }

    public deserialize(data: SerializedData): void {
        if (typeof data.name === 'string') {
            this.name = data.name
        }

        if (data.gameObjects) {
            Object.entries(data.gameObjects).forEach(([id, objData]) => {
                const gameObject = this.gameObjects.get(id)
                if (gameObject && objData) {
                    gameObject.deserialize(objData)
                }
            })
        }
    }
}
