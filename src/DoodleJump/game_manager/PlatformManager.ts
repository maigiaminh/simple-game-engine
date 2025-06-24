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
import { ObstacleFactory } from '../components/ObstacleFactory'

export class PlatformManager extends Component {
    private gameEngine: GameEngine
    private platformsImg: HTMLImageElement[] = []
    private platforms: Platform[] = []
    private scene!: IScene

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
            layer: 0,
            position: new Vector2(CONFIG.CANVAS.WIDTH / 2, CONFIG.CANVAS.HEIGHT),
        })

        const renderer = new Renderer(groundGO)
        renderer.setImage(
            this.gameEngine.getResourceManager().getResource(GAME_CONFIG.IMAGES.PLATFORMS.GROUND)!
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
        for (let i = 0; i < GAME_CONFIG.PLATFORM.INITIAL_COUNT; i++) {
            const y = CONFIG.CANVAS.HEIGHT - 100 - i * GAME_CONFIG.PLATFORM.SPAWN_DISTANCE
            const x = MathUtils.random(
                GAME_CONFIG.PLATFORM.WIDTH / 2,
                CONFIG.CANVAS.WIDTH - GAME_CONFIG.PLATFORM.WIDTH / 2
            )
            this.createPlatform(new Vector2(x, y))
        }
    }

    private createPlatform(position: Vector2): IGameObject {
        const platformGO = new GameObject({
            name: 'Platform',
            tag: 'Platform',
            layer: 1,
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

        const platform = new Platform(platformGO)
        platformGO.addComponent(platform)

        this.scene.addGameObject(platformGO)
        this.platforms.push(platform)

        this.maybeAddObstacle(platformGO)
        this.gameEngine.getCollisionManager().addCollider(collider)

        return platformGO
    }

    private maybeAddObstacle(platformGO: IGameObject): void {
        const platform = platformGO.getComponent(Platform as ComponentConstructor<Platform>)
        if (platform === null) return

        if (platformGO.getComponent(Renderer as ComponentConstructor<Renderer>) === null) return
        if (MathUtils.random(0, 1) < 0.5) {
            const obstacleGO = ObstacleFactory.createLandedSpike(
                new Vector2(
                    platformGO.getPosition().x,
                    platformGO.getPosition().y - GAME_CONFIG.PLATFORM.HEIGHT / 2
                )
            )

            if (obstacleGO) {
                this.scene.addGameObject(obstacleGO)
                platform.setHasObstacle(true)
                platform.setObstacle(obstacleGO)
            }
        }
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
            const x = MathUtils.random(
                GAME_CONFIG.PLATFORM.WIDTH / 2,
                CONFIG.CANVAS.WIDTH - GAME_CONFIG.PLATFORM.WIDTH / 2
            )
            this.createPlatform(new Vector2(x, highestY))
        }
    }

    private removeOldPlatforms(): void {
        const cameraPos = this.scene.getMainCamera()!.getGameObject().getPosition().y
        this.platforms = this.platforms.filter((platform) => {
            const pos = platform.getGameObject().getPosition()
            const platformDistance = pos.y - cameraPos
            if (platformDistance > CONFIG.CANVAS.HEIGHT / 2 + 200) {
                if (platform.getHasObstacle()) {
                    const obstacle = platform.getObstacle()
                    if (obstacle) {
                        this.scene.removeGameObject(obstacle)
                        obstacle.destroy()
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
