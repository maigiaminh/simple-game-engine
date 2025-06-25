import { Collider } from '../../components/Collider'
import { Renderer } from '../../components/Renderer'
import { CONFIG } from '../../config/Config'
import { Component } from '../../core/Component'
import { GameObject } from '../../core/GameObject'
import { ColliderType, CollisionLayer } from '../../types/enums'
import { ComponentConstructor, IGameObject, IScene } from '../../types/interface'
import { Color } from '../../utils/Color'
import { MathUtils } from '../../utils/MathUtils'
import { Vector2 } from '../../utils/Vector2'
import { GAME_CONFIG } from '../config/GameplayConfig'
import { Platform } from '../components/Platform'
import { GameEngine } from '../../core/GameEngine'
import { ScoreManager } from './ScoreManager'
import { MovingPlatform } from '../components/MovingPlatform'
import { ObstacleFactory } from '../components/obstacle/ObstacleFactory'
import { ItemFactory } from '../components/items/ItemFactory'

export class PlatformManager extends Component {
    private gameEngine: GameEngine
    private platformsImg: HTMLImageElement[] = []
    private platforms: Platform[] = []
    private scene!: IScene
    private lastPlatformX: number = CONFIG.CANVAS.WIDTH / 2
    private readonly MAX_PLATFORM_X_DIFF = CONFIG.CANVAS.WIDTH / 2

    constructor(gameObject: IGameObject, scene: IScene) {
        super(gameObject)
        this.scene = scene
    }

    public onStart(): void {
        this.gameEngine = GameEngine.getInstance()!
        this.generateGround()
        this.loadPlatformImages()
        this.generateInitialPlatforms()
    }

    public update(deltaTime: number): void {
        this.generateNewPlatforms()
        this.removeOldPlatforms()
    }

    private loadPlatformImages(): void {
        for (const key of Object.keys(GAME_CONFIG.IMAGES.PLATFORMS)) {
            this.platformsImg.push(
                this.gameEngine
                    .getResourceManager()
                    .getResource(
                        GAME_CONFIG.IMAGES.PLATFORMS[
                            key as keyof typeof GAME_CONFIG.IMAGES.PLATFORMS
                        ]
                    ) as HTMLImageElement
            )
        }
    }

    private generateGround(): void {
        const groundGO = new GameObject({
            name: 'Ground',
            tag: 'Ground',
            layer: 2,
            position: new Vector2(CONFIG.CANVAS.WIDTH / 2, CONFIG.CANVAS.HEIGHT),
        })

        const renderer = new Renderer(groundGO)
        renderer.setImage(
            this.gameEngine.getResourceManager().getResource(GAME_CONFIG.IMAGES.GROUND)!
        )
        renderer.setImageSize(CONFIG.CANVAS.WIDTH + 64, 156)
        groundGO.addComponent(renderer)
        const collider = new Collider(groundGO)
        collider.setRenderer(renderer)
        collider.setColliderType(ColliderType.POLYGON)
        collider.layers = [CollisionLayer.GROUND]
        collider.mask = [CollisionLayer.PLAYER]
        groundGO.addComponent(collider)
        this.scene.addGameObject(groundGO)
        this.gameEngine.getCollisionManager().addCollider(collider)
    }

    private generateInitialPlatforms(): void {
        for (let i = 1; i < GAME_CONFIG.PLATFORM.INITIAL_COUNT; i++) {
            const y = CONFIG.CANVAS.HEIGHT - 32 - i * GAME_CONFIG.PLATFORM.SPAWN_DISTANCE
            this.createPlatformWithConstraint(y)
        }
    }

    private createPlatformWithConstraint(y: number): IGameObject {
        const minX = Math.max(
            GAME_CONFIG.PLATFORM.WIDTH / 2,
            this.lastPlatformX - this.MAX_PLATFORM_X_DIFF
        )
        const maxX = Math.min(
            CONFIG.CANVAS.WIDTH - GAME_CONFIG.PLATFORM.WIDTH / 2,
            this.lastPlatformX + this.MAX_PLATFORM_X_DIFF
        )
        const x = MathUtils.random(minX, maxX)
        this.lastPlatformX = x
        return this.createPlatform(new Vector2(x, y))
    }
    private createPlatform(position: Vector2): IGameObject {
        const platformGO = new GameObject({
            name: 'Platform',
            tag: 'Platform',
            layer: 2,
            position: position,
        })

        const renderer = new Renderer(platformGO)
        const img = this.platformsImg[MathUtils.randomInt(0, this.platformsImg.length - 1)]
        renderer.setImage(img)
        renderer.setImageSize(GAME_CONFIG.PLATFORM.WIDTH, GAME_CONFIG.PLATFORM.HEIGHT)
        renderer.setColor(Color.WHITE)
        platformGO.addComponent(renderer)

        const collider = new Collider(platformGO)
        collider.setRenderer(renderer)
        collider.setColliderType(ColliderType.POLYGON)
        collider.layers = [CollisionLayer.GROUND]
        collider.mask = [CollisionLayer.PLAYER]
        platformGO.addComponent(collider)

        let platform = new Platform(platformGO)

        const movingPlatformSpawnChance = ScoreManager.getCurrentDifficultyLevel() * 0.05

        if (MathUtils.random(0, 1) < movingPlatformSpawnChance) {
            platform = new MovingPlatform(platformGO)
        }
        platformGO.addComponent(platform)

        this.scene.addGameObject(platformGO)
        this.platforms.push(platform)
        if (platform.getPlatformType() === 'normal') this.maybeAddObjectOnPlatform(platformGO)
        this.gameEngine.getCollisionManager().addCollider(collider)

        return platformGO
    }

    private maybeAddObjectOnPlatform(platformGO: IGameObject): void {
        const platform = platformGO.getComponent(Platform as ComponentConstructor<Platform>)
        if (platform === null) return
        if (platform.containsObject()) return

        const level = ScoreManager.getCurrentDifficultyLevel()
        const obstacleChance = Math.min(0.1 + level * 0.05, 0.4)
        const itemChance = 0.1
        const decoChance = 0.25

        const rand = MathUtils.random(0, 1)
        const spawnPos = platformGO
            .getPosition()
            .add(new Vector2(0, -GAME_CONFIG.PLATFORM.HEIGHT / 2))

        if (rand < obstacleChance) {
            const obstacleGO = ObstacleFactory.createRandomObstacleByLevel(spawnPos)
            this.scene.addGameObject(obstacleGO)
            platform.updateObjectStatus?.(true)
            platform.setObject?.(obstacleGO)
            return
        }

        if (rand < obstacleChance + itemChance) {
            const itemGO = ItemFactory.createRandomItem(spawnPos.add(new Vector2(0, -24)))
            this.scene.addGameObject(itemGO)
            platform.updateObjectStatus?.(true)
            platform.setObject?.(itemGO)
            return
        }

        if (rand < obstacleChance + itemChance + decoChance) {
            const decoGO = this.createDecorationOnPlatform(platformGO)
            if (decoGO) {
                this.scene.addGameObject(decoGO)
                platform.updateObjectStatus?.(true)
                platform.setObject?.(decoGO)
            }
        }
    }

    private createDecorationOnPlatform(platformGO: IGameObject): IGameObject | null {
        type DecorationKey = keyof typeof GAME_CONFIG.IMAGES.DECORATIONS
        const decoTypes: DecorationKey[] = Object.keys(
            GAME_CONFIG.IMAGES.DECORATIONS
        ) as DecorationKey[]
        const type = MathUtils.randomChoice(decoTypes)
        const platformPos = platformGO.getPosition()
        const pos = platformPos.add(
            new Vector2(
                MathUtils.random(-30, 30),
                -GAME_CONFIG.PLATFORM.HEIGHT / 2 - GAME_CONFIG.DECORATION.HEIGHT / 2 + 12
            )
        )

        const decoGO = new GameObject({
            name: `Deco_${type}`,
            tag: 'Decoration',
            layer: 2,
            position: pos,
        })
        const renderer = new Renderer(decoGO)
        const image = this.gameEngine
            .getResourceManager()
            .getResource(GAME_CONFIG.IMAGES.DECORATIONS[type]) as HTMLImageElement
        renderer.setImage(image)
        renderer.setImageSize(GAME_CONFIG.DECORATION.WIDTH, GAME_CONFIG.DECORATION.HEIGHT)
        decoGO.addComponent(renderer)
        return decoGO
    }

    private generateNewPlatforms(): void {
        let highestY = Number.POSITIVE_INFINITY
        for (const platform of this.platforms) {
            const y = platform.getGameObject().getPosition().y
            if (y < highestY) highestY = y
        }

        const cameraY = this.scene.getMainCamera()!.getGameObject().getPosition().y

        const generationThreshold = cameraY - CONFIG.CANVAS.HEIGHT / 2 - 200

        while (highestY > generationThreshold) {
            highestY -= GAME_CONFIG.PLATFORM.SPAWN_DISTANCE
            this.createPlatformWithConstraint(highestY)
        }
    }

    private removeOldPlatforms(): void {
        const cameraPos = this.scene.getMainCamera()!.getGameObject().getPosition().y
        this.platforms = this.platforms.filter((platform) => {
            const pos = platform.getGameObject().getPosition()
            const platformDistance = pos.y - cameraPos
            if (platformDistance > CONFIG.CANVAS.HEIGHT / 2 + 200) {
                if (platform.containsObject()) {
                    const object = platform.getObject()
                    if (object) {
                        this.scene.removeGameObject(object)
                        object.destroy()
                    }
                }
                this.scene.removeGameObject(platform.getGameObject())
                platform.getGameObject().destroy()
                return false
            }
            return true
        })
    }

    public render(ctx: CanvasRenderingContext2D): void {}
}
