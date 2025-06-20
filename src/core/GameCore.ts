import { GameEngine } from './GameEngine'
import { Scene } from './Scene'
import { ResourceType } from '../types/enums'
import { GAME_CONFIG } from '../config/GameConfig'

export class GameCore {
    private static engine: GameEngine

    public static async start(config: {
        canvasId?: string
        width?: number
        height?: number
        targetFPS?: number
        scenes?: Scene[]
        preloadAssets?: {
            images?: { name: string; url: string }[]
            audio?: { name: string; url: string }[]
        }
    }): Promise<void> {
        let canvas = document.getElementById(config.canvasId ?? 'game-canvas') as HTMLCanvasElement
        if (!canvas) {
            canvas = document.createElement('canvas')
            canvas.id = config.canvasId ?? 'game-canvas'
            document.body.appendChild(canvas)
        }

        this.engine = new GameEngine({
            canvasId: canvas.id,
            width: config.width ?? GAME_CONFIG.CANVAS.WIDTH,
            height: config.height ?? GAME_CONFIG.CANVAS.WIDTH,
            targetFPS: config.targetFPS ?? 60,
        })

        if (config.preloadAssets) {
            await this.preloadAssets(config.preloadAssets)
        }

        if (config.scenes) {
            for (const scene of config.scenes) {
                this.engine.addScene(scene.getName(), scene)
            }
            await this.engine.setScene(config.scenes[0].getName())
        }

        this.engine.start()
    }

    public static getEngine(): GameEngine {
        return this.engine
    }

    public static async preloadAssets(assets: {
        images?: { name: string; url: string }[]
        audio?: { name: string; url: string }[]
    }): Promise<void> {
        const resourceManager = this.engine.getResourceManager()
        if (assets.images) {
            for (const imageData of assets.images) {
                await resourceManager.loadResource(
                    imageData.name,
                    imageData.url,
                    ResourceType.IMAGE
                )
            }
        }
        if (assets.audio) {
            for (const audioData of assets.audio) {
                await resourceManager.loadResource(
                    audioData.name,
                    audioData.url,
                    ResourceType.AUDIO
                )
            }
        }
    }

    public static addScene(name: string, scene: Scene): void {
        this.engine.addScene(name, scene)
    }

    public static async setScene(name: string): Promise<void> {
        await this.engine.setScene(name)
    }
}
