import { EventEmitter } from './EventEmitter'
import { AudioManager } from '../systems/AudioManager'
import { CollisionManager } from '../systems/CollisionManager'
import { InputManager } from '../systems/InputManager'
import { ResourceManager } from '../systems/ResourceManager'
import { Time } from '../utils/Time'
import { IScene, EngineConfig } from '../types/interface'
import { UIManager } from '../systems/UIManager'
import { ENGINE_EVENTS } from '../types/enums'

export class GameEngine extends EventEmitter implements GameEngine {
    private static instance: GameEngine | null = null

    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private scenes: Map<string, IScene> = new Map()
    private currentScene: IScene | null = null

    private inputManager: InputManager
    private audioManager: AudioManager
    private resourceManager: ResourceManager
    private collisionManager: CollisionManager
    private uiManager: UIManager

    private isRunning = false
    private isPaused = false
    private lastTime = 0
    private targetFPS = 60
    private frameTime: number = 1000 / this.targetFPS

    private frameCount = 0
    private fpsCounter = 0
    private lastFpsUpdate = 0

    constructor(config: EngineConfig) {
        super()

        this.canvas = document.getElementById(config.canvasId) as HTMLCanvasElement
        if (!this.canvas) {
            throw new Error(`Canvas with id '${config.canvasId}' not found`)
        }
        const ctx = this.canvas.getContext('2d')
        if (!ctx) {
            throw new Error('Could not get 2D context from canvas')
        }
        this.ctx = ctx

        this.setupCanvas(config.width || 800, config.height || 600)
        this.initializeSystems()

        if (config.targetFPS) {
            this.setTargetFPS(config.targetFPS)
        }

        if (!GameEngine.instance) GameEngine.instance = this

        this.dispatchEvent(ENGINE_EVENTS.ENGINE_INITIALIZED)
    }

    public static getInstance(): GameEngine {
        if (!GameEngine.instance) {
            throw new Error('GameEngine has not been initialized. Please create an instance first.')
        }
        return GameEngine.instance
    }

    private setupCanvas(width: number, height: number): void {
        this.canvas.width = width
        this.canvas.height = height

        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault())
        this.canvas.tabIndex = 1000

        this.canvas.style.display = 'block'
        this.canvas.style.margin = 'auto'
        this.canvas.style.border = '1px solid #333'

        document.body.style.display = 'flex'
        document.body.style.justifyContent = 'center'
        document.body.style.alignItems = 'center'
        document.body.style.margin = '0'
    }

    private initializeSystems(): void {
        this.inputManager = new InputManager(this.canvas)
        this.audioManager = new AudioManager()
        this.resourceManager = new ResourceManager()
        this.collisionManager = new CollisionManager()
        this.uiManager = new UIManager(this.canvas)
    }

    public addScene(name: string, scene: IScene): void {
        this.scenes.set(name, scene)
        this.dispatchEvent(ENGINE_EVENTS.SCENE_ADDED, { name, scene })
    }

    public async setScene(name: string): Promise<void> {
        const scene = this.scenes.get(name)
        if (!scene) {
            throw new Error(`Scene '${name}' not found`)
        }

        if (this.currentScene) {
            await this.currentScene.unload()
            this.collisionManager.clear()
        }

        this.currentScene = scene
        await this.currentScene.load()

        this.dispatchEvent(ENGINE_EVENTS.SCENE_CHANGED, { name, scene })
    }

    public getCurrentScene(): IScene | null {
        return this.currentScene
    }

    public start(): void {
        if (this.isRunning) return

        this.isRunning = true
        this.isPaused = false
        this.lastTime = performance.now()
        Time.reset()

        this.gameLoop(this.lastTime)
        this.dispatchEvent(ENGINE_EVENTS.ENGINE_STARTED)
    }

    public stop(): void {
        this.isRunning = false
        this.dispatchEvent(ENGINE_EVENTS.ENGINE_STOPPED)
    }

    public pause(): void {
        this.isPaused = true
        this.dispatchEvent(ENGINE_EVENTS.ENGINE_PAUSED)
    }

    public resume(): void {
        this.isPaused = false
        this.lastTime = performance.now()
        this.dispatchEvent(ENGINE_EVENTS.ENGINE_RESUMED)
    }

    private gameLoop(currentTime: number): void {
        if (!this.isRunning) return

        let deltaTime = currentTime - this.lastTime
        this.lastTime = currentTime

        deltaTime = Math.min(deltaTime, this.frameTime * 2)

        Time.update(deltaTime)

        if (!this.isPaused) {
            this.update(deltaTime)
            this.render()
        }

        this.updatePerformanceStats()

        requestAnimationFrame((time) => this.gameLoop(time))
    }

    private update(deltaTime: number): void {
        this.inputManager.update()

        if (this.currentScene) {
            this.currentScene.update(deltaTime)
        }

        this.collisionManager.checkCollisions()

        this.dispatchEvent(ENGINE_EVENTS.ENGINE_UPDATED, { deltaTime })
    }

    private render(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        if (this.currentScene) {
            this.currentScene.render(this.ctx)
        }

        this.dispatchEvent(ENGINE_EVENTS.ENGINE_RENDERED)
    }

    private updatePerformanceStats(): void {
        this.frameCount++
        const currentTime = Time.totalTime
        if (currentTime - this.lastFpsUpdate >= 1000) {
            this.fpsCounter = Math.round(
                (this.frameCount * 1000) / (currentTime - this.lastFpsUpdate)
            )
            this.frameCount = 0
            this.lastFpsUpdate = currentTime
        }
    }

    public getInputManager(): InputManager {
        return this.inputManager
    }

    public getAudioManager(): AudioManager {
        return this.audioManager
    }

    public getResourceManager(): ResourceManager {
        return this.resourceManager
    }

    public getCollisionManager(): CollisionManager {
        return this.collisionManager
    }

    public getUIManager(): UIManager {
        return this.uiManager
    }

    public getCanvas(): HTMLCanvasElement {
        return this.canvas
    }

    public getContext(): CanvasRenderingContext2D {
        return this.ctx
    }

    public setTargetFPS(fps: number): void {
        this.targetFPS = Math.max(1, fps)
        this.frameTime = 1000 / this.targetFPS
    }

    public getTargetFPS(): number {
        return this.targetFPS
    }

    public getCurrentFPS(): number {
        return this.fpsCounter
    }

    public destroy(): void {
        this.stop()

        if (this.currentScene) {
            this.currentScene.unload()
        }

        this.scenes.clear()
        this.collisionManager.clear()
        this.resourceManager.unloadAll()
        this.audioManager.stopAllSounds()

        this.removeAllEventListeners()
        this.dispatchEvent(ENGINE_EVENTS.ENGINE_DESTROYED)
    }
}
