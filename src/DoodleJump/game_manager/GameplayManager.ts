import { Collider } from '../../components/Collider'
import { Renderer } from '../../components/Renderer'
import { RigidBody } from '../../components/RigidBody'
import { Transform } from '../../components/Transform'
import { CONFIG } from '../../config/Config'
import { Component } from '../../core/Component'
import { GameEngine } from '../../core/GameEngine'
import { GameObject } from '../../core/GameObject'
import { CollisionLayer, GameState } from '../../types/enums'
import { IGameObject, IScene, ComponentConstructor, GameEvent } from '../../types/interface'
import { Color } from '../../utils/Color'
import { MathUtils } from '../../utils/MathUtils'
import { Vector2 } from '../../utils/Vector2'
import { MovingObstacle } from '../components/MovingObstacle'
import { MovingPlatform } from '../components/MovingPlatform'
import { Platform } from '../components/Platform'
import { Player } from '../components/Player'
import { StaticObstacle } from '../components/StaticObstacle'
import { GAME_CONFIG } from '../config/GameplayConfig'
import { GAME_EVENTS } from '../types/enums'
import { GameStats, IWorldObject } from '../types/interfaces'

export class GameplayManager extends Component {
    private scene: IScene
    private player: Player
    private playerGameObject: IGameObject

    private gameState: GameState = GameState.PLAYING
    private gameStats: GameStats

    private worldSpeed = 200
    private worldObjects: IWorldObject[] = []

    private platforms: IWorldObject[] = []
    private platformPool: IGameObject[] = []
    private lastPlatformY = 0
    private platformSpacing: number = GAME_CONFIG.PLATFORM.SPAWN_DISTANCE

    private obstacles: IWorldObject[] = []
    private obstaclePool: IGameObject[] = []
    private lastObstacleSpawn = 0

    private difficultyLevel = 1
    private speedMultiplier = 1

    private readonly PLAYER_FIXED_Y = CONFIG.CANVAS.HEIGHT * 0.7
    private readonly PLAYER_X_CENTER = CONFIG.CANVAS.WIDTH / 2

    private readonly GENERATION_AHEAD = 800
    private readonly CLEANUP_BEHIND = 200

    constructor(gameObject: IGameObject, scene: IScene, player: Player, playerGO: IGameObject) {
        super(gameObject)
        this.scene = scene
        this.player = player
        this.playerGameObject = playerGO

        this.initializeGameStats()
        this.setupPlayer()
        this.generateInitialWorld()
        this.setupEventListeners()
    }

    private initializeGameStats(): void {
        this.gameStats = {
            score: 0,
            highScore: this.loadHighScore(),
            height: 0,
            platformsGenerated: 0,
            obstaclesDestroyed: 0,
            timeAlive: 0,
            difficulty: 1,
            platformsJumped: 0,
        }
    }

    private setupPlayer(): void {
        const playerTransform = this.playerGameObject.getComponent(
            Transform as ComponentConstructor<Transform>
        )
        if (playerTransform) {
            playerTransform.setPosition(new Vector2(this.PLAYER_X_CENTER, this.PLAYER_FIXED_Y))
        }
    }

    private generateInitialWorld(): void {
        this.createPlatform(new Vector2(this.PLAYER_X_CENTER, this.PLAYER_FIXED_Y + 50), 'normal')

        for (let i = 1; i < 15; i++) {
            const y = this.PLAYER_FIXED_Y - i * this.platformSpacing
            const x = MathUtils.random(
                GAME_CONFIG.PLATFORM.WIDTH / 2,
                CONFIG.CANVAS.WIDTH - GAME_CONFIG.PLATFORM.WIDTH / 2
            )

            const platformType = this.getPlatformTypeBasedOnDifficulty()
            this.createPlatform(new Vector2(x, y), platformType)
        }

        this.lastPlatformY = this.PLAYER_FIXED_Y - 15 * this.platformSpacing
    }

    private setupEventListeners(): void {
        this.player.addEventListener(GAME_EVENTS.PLAYER_JUMP, this.onPlayerJump.bind(this))
        this.player.addEventListener(GAME_EVENTS.PLAYER_LANDED, this.onPlayerLanded.bind(this))
        this.player.addEventListener(
            GAME_EVENTS.PLAYER_HIT_OBSTACLE,
            this.onPlayerHitObstacle.bind(this)
        )
    }

    public update(deltaTime: number): void {
        if (this.gameState !== GameState.PLAYING) return

        this.updateGameStats(deltaTime)
        this.updateDifficulty(deltaTime)
        this.generateWorldContent()
        this.cleanupWorldObjects()
        this.checkGameOverConditions()
    }

    private updateGameStats(deltaTime: number): void {
        this.gameStats.timeAlive += deltaTime / 1000

        const timeScore = Math.floor(this.gameStats.timeAlive * 2)
        const heightScore = Math.floor(this.gameStats.height / 10)
        this.gameStats.score = timeScore + heightScore + this.gameStats.platformsJumped * 10

        if (this.gameStats.score > this.gameStats.highScore) {
            this.gameStats.highScore = this.gameStats.score
            this.saveHighScore(this.gameStats.highScore)
        }
    }

    private updateDifficulty(deltaTime: number): void {
        const newDifficulty = Math.min(10, Math.floor(this.gameStats.height / 500) + 1)

        if (newDifficulty > this.difficultyLevel) {
            this.difficultyLevel = newDifficulty
            this.onDifficultyIncrease()
        }

        this.speedMultiplier = 1 + (this.difficultyLevel - 1) * 0.2
        this.gameStats.difficulty = this.difficultyLevel
    }

    private onDifficultyIncrease(): void {
        console.log(`🔥 Difficulty increased to level ${this.difficultyLevel}!`)

        this.worldSpeed = 200 * this.speedMultiplier
        this.platformSpacing = Math.max(
            80,
            GAME_CONFIG.PLATFORM.SPAWN_DISTANCE - this.difficultyLevel * 5
        )

        this.dispatchEvent('difficultyIncreased', {
            level: this.difficultyLevel,
            speed: this.worldSpeed,
        })
    }

    private generateWorldContent(): void {
        this.generatePlatforms()
        this.generateObstacles()
        this.generateDecorations()
    }

    private generatePlatforms(): void {
        while (this.lastPlatformY > -this.GENERATION_AHEAD) {
            this.lastPlatformY -= this.platformSpacing

            const x = MathUtils.random(
                GAME_CONFIG.PLATFORM.WIDTH / 2,
                CONFIG.CANVAS.WIDTH - GAME_CONFIG.PLATFORM.WIDTH / 2
            )

            const platformType = this.getPlatformTypeBasedOnDifficulty()
            this.createPlatform(new Vector2(x, this.lastPlatformY), platformType)
        }
    }

    private getPlatformTypeBasedOnDifficulty(): PlatformType {
        const types = [
            { type: 'normal' as const, weight: 100 - this.difficultyLevel * 5 },
            { type: 'spring' as const, weight: 15 + this.difficultyLevel * 2 },
            { type: 'fragile' as const, weight: 10 + this.difficultyLevel * 3 },
            { type: 'moving' as const, weight: 5 + this.difficultyLevel * 2 },
        ]

        return this.weightedRandomChoice(types)
    }

    private createPlatform(position: Vector2, platformType: PlatformType): IGameObject {
        let platformGO = this.getFromPool(this.platformPool)

        if (!platformGO) {
            platformGO = new GameObject({
                name: `Platform_${platformType}_${Date.now()}`,
                tag: 'Platform',
                layer: 1,
                position: position,
            })

            const renderer = new Renderer(platformGO)
            platformGO.addComponent(renderer)

            const collider = Collider.createBox(
                platformGO,
                GAME_CONFIG.PLATFORM.WIDTH,
                GAME_CONFIG.PLATFORM.HEIGHT
            )
            collider.layers = [CollisionLayer.GROUND]
            collider.mask = [CollisionLayer.PLAYER]

            platformGO.addComponent(collider)
        } else {
            const transform = platformGO.getComponent(Transform as ComponentConstructor<Transform>)
            if (transform) {
                transform.setPosition(position)
            }
            platformGO.setActive(true)
        }

        let platform: Platform
        if (platformType === 'moving') {
            platform = new MovingPlatform(platformGO)
        } else {
            platform = new Platform(platformGO)
        }

        platformGO.addComponent(platform)

        this.scene.addGameObject(platformGO)

        const worldObject: IWorldObject = {
            gameObject: platformGO,
            initialY: position.y,
            isActive: true,
            type: 'platform',
            cleanup: () => this.returnToPool(platformGO!, this.platformPool),
        }

        this.platforms.push(worldObject)
        this.worldObjects.push(worldObject)
        this.gameStats.platformsGenerated++

        if (platformType === 'normal' && Math.random() < this.getObstacleSpawnChance()) {
            this.createObstacleOnPlatform(platformGO)
        }

        GameEngine.getInstance()
            .getCollisionManager()
            .addCollider(platformGO.getComponent(Collider as ComponentConstructor<Collider>)!)

        return platformGO
    }

    private generateObstacles(): void {
        if (Date.now() - this.lastObstacleSpawn > this.getObstacleSpawnInterval()) {
            if (Math.random() < this.getObstacleSpawnChance()) {
                this.createFlyingObstacle()
                this.lastObstacleSpawn = Date.now()
            }
        }
    }

    private getObstacleSpawnChance(): number {
        return Math.min(0.7, 0.2 + this.difficultyLevel * 0.05)
    }

    private getObstacleSpawnInterval(): number {
        return Math.max(1000, 3000 - this.difficultyLevel * 200)
    }

    private createObstacleOnPlatform(platformGO: IGameObject): void {
        const platformPos = platformGO.getPosition()
        const obstaclePos = new Vector2(
            platformPos.x,
            platformPos.y - GAME_CONFIG.PLATFORM.HEIGHT / 2 - 20
        )

        const obstacleTypes = ['cactus', 'spike', 'rock']
        const obstacleType = MathUtils.randomChoice(obstacleTypes)

        this.createObstacle(obstaclePos, obstacleType, true)
    }

    private createFlyingObstacle(): void {
        const x = MathUtils.random(0, CONFIG.CANVAS.WIDTH)
        const y = -50
        const position = new Vector2(x, y)

        const weights = [
            { type: 'bird', weight: 60 },
            { type: 'cloud', weight: 25 },
            { type: 'ufo', weight: 15 },
        ]

        const obstacleType = this.weightedRandomChoice(weights) as string
        this.createObstacle(position, obstacleType, false)
    }

    private createObstacle(
        position: Vector2,
        obstacleType: string,
        isStatic: boolean
    ): IGameObject {
        let obstacleGO = this.getFromPool(this.obstaclePool)

        if (!obstacleGO) {
            obstacleGO = new GameObject({
                name: `Obstacle_${obstacleType}_${Date.now()}`,
                tag: 'Obstacle',
                layer: 2,
                position: position,
            })

            const renderer = new Renderer(obstacleGO)
            obstacleGO.addComponent(renderer)

            const size = this.getObstacleSize(obstacleType)
            const collider = Collider.createBox(obstacleGO, size.width, size.height)
            collider.layers = [CollisionLayer.ENVIRONMENT]
            collider.mask = [CollisionLayer.PLAYER]
            collider.isTrigger = true
            obstacleGO.addComponent(collider)
        } else {
            const transform = obstacleGO.getComponent(Transform as ComponentConstructor<Transform>)
            if (transform) {
                transform.setPosition(position)
            }
            obstacleGO.setActive(true)
        }

        let obstacle: StaticObstacle | MovingObstacle
        if (isStatic) {
            obstacle = new StaticObstacle(obstacleGO, obstacleType as StaticType)
        } else {
            const patterns = ['horizontal', 'circular', 'zigzag']
            const pattern = MathUtils.randomChoice(patterns) as MovingPattern
            obstacle = new MovingObstacle(obstacleGO, obstacleType as MovingType, pattern)
        }

        obstacleGO.addComponent(obstacle)

        obstacle.addEventListener(
            GAME_EVENTS.PLAYER_HIT_OBSTACLE,
            this.onPlayerHitObstacle.bind(this)
        )
        obstacle.addEventListener(GAME_EVENTS.PLAYER_PUSHED, this.onPlayerPushed.bind(this))

        this.scene.addGameObject(obstacleGO)

        const worldObject: IWorldObject = {
            gameObject: obstacleGO,
            initialY: position.y,
            isActive: true,
            type: 'obstacle',
            cleanup: () => this.returnToPool(obstacleGO!, this.obstaclePool),
        }

        this.obstacles.push(worldObject)
        this.worldObjects.push(worldObject)

        return obstacleGO
    }

    private getObstacleSize(type: string): { width: number; height: number } {
        switch (type) {
            case 'cactus':
                return { width: 24, height: 32 }
            case 'spike':
                return { width: 20, height: 30 }
            case 'rock':
                return { width: 25, height: 25 }
            case 'bird':
                return { width: 32, height: 24 }
            case 'cloud':
                return { width: 60, height: 30 }
            case 'ufo':
                return { width: 40, height: 20 }
            default:
                return { width: 24, height: 24 }
        }
    }

    private generateDecorations(): void {
        if (Math.random() < 0.1) {
            this.createBackgroundCloud()
        }
    }

    private createBackgroundCloud(): void {
        const cloudGO = new GameObject({
            name: `Cloud_${Date.now()}`,
            tag: 'Background',
            layer: -1,
            position: new Vector2(MathUtils.random(0, CONFIG.CANVAS.WIDTH), -100),
        })

        const renderer = new Renderer(cloudGO)
        renderer.setColor(new Color(255, 255, 255, 0.6))
        cloudGO.addComponent(renderer)

        this.scene.addGameObject(cloudGO)

        const worldObject: IWorldObject = {
            gameObject: cloudGO,
            initialY: -100,
            isActive: true,
            type: 'decoration',
            cleanup: () => {
                this.scene.removeGameObject(cloudGO)
                cloudGO.destroy()
            },
        }

        this.worldObjects.push(worldObject)
    }

    private cleanupWorldObjects(): void {
        this.worldObjects = this.worldObjects.filter((worldObj) => {
            const pos = worldObj.gameObject.getPosition()

            if (pos.y > CONFIG.CANVAS.HEIGHT + this.CLEANUP_BEHIND) {
                worldObj.cleanup()
                return false
            }

            if (!worldObj.isActive) {
                worldObj.cleanup()
                return false
            }

            return true
        })

        this.platforms = this.platforms.filter((p) => this.worldObjects.includes(p))
        this.obstacles = this.obstacles.filter((o) => this.worldObjects.includes(o))
    }

    private getFromPool(pool: IGameObject[]): IGameObject | null {
        return pool.pop() || null
    }

    private returnToPool(gameObject: IGameObject, pool: IGameObject[]): void {
        gameObject.setActive(false)
        this.scene.removeGameObject(gameObject)

        const components = gameObject.getAllComponents()
        components.forEach((comp) => {
            if (
                comp.getType() !== 'Transform' &&
                comp.getType() !== 'Renderer' &&
                comp.getType() !== 'Collider'
            ) {
                gameObject.removeComponent(comp.constructor as ComponentConstructor<Component>)
            }
        })

        pool.push(gameObject)
    }

    private onPlayerJump(event: GameEvent): void {
        this.worldSpeed *= 1.5
        setTimeout(() => {
            this.worldSpeed = 200 * this.speedMultiplier
        }, 200)
    }

    private onPlayerLanded(event: GameEvent): void {
        this.gameStats.platformsJumped++

        this.gameStats.score += 10
    }

    private onPlayerHitObstacle(event: GameEvent): void {
        const { obstacleType, damage } = event.data as { obstacleType: string; damage: number }
        console.log(`Player hit ${obstacleType} for ${damage} damage!`)

        this.triggerGameOver()
    }

    private onPlayerPushed(event: GameEvent): void {
        const { pushDirection } = event.data as { pushDirection: Vector2 }
        console.log('Player pushed by cloud')

        const playerRigidBody = this.playerGameObject.getComponent(
            RigidBody as ComponentConstructor<RigidBody>
        )
        if (playerRigidBody) {
            playerRigidBody.addForce(pushDirection.multiply(300))
        }
    }

    private checkGameOverConditions(): void {
        const nearbyPlatforms = this.platforms.filter((p) => {
            const pos = p.gameObject.getPosition()
            return pos.y > this.PLAYER_FIXED_Y && pos.y < this.PLAYER_FIXED_Y + 200
        })

        if (nearbyPlatforms.length === 0 && this.gameStats.timeAlive > 5) {
            console.log('No platforms ahead! Game Over')
            this.triggerGameOver()
        }
    }

    private triggerGameOver(): void {
        this.gameState = GameState.GAMEOVER

        console.log(`🎮 Game Over! Final Stats:`, this.gameStats)

        this.dispatchEvent('gameOver', {
            stats: this.gameStats,
            finalScore: this.gameStats.score,
            highScore: this.gameStats.highScore,
        })
    }

    private weightedRandomChoice<T extends { type: U; weight: number }, U>(items: T[]): U {
        const totalWeight = items.reduce((sum, item) => sum + item.weight, 0)
        let random = Math.random() * totalWeight

        for (const item of items) {
            random -= item.weight
            if (random <= 0) {
                return item.type
            }
        }

        return items[0].type
    }

    private loadHighScore(): number {
        try {
            return parseInt(localStorage.getItem('doodleJump_highScore') || '0', 10)
        } catch {
            return 0
        }
    }

    private saveHighScore(score: number): void {
        try {
            localStorage.setItem('doodleJump_highScore', score.toString())
        } catch (error) {
            console.warn('Could not save high score:', error)
        }
    }

    public getGameStats(): GameStats {
        return { ...this.gameStats }
    }

    public getGameState(): GameState {
        return this.gameState
    }

    public pauseGame(): void {
        this.gameState = GameState.PAUSED
    }

    public resumeGame(): void {
        this.gameState = GameState.PLAYING
    }

    public restartGame(): void {
        this.gameState = GameState.RESTART

        this.worldObjects.forEach((obj) => obj.cleanup())
        this.worldObjects = []
        this.platforms = []
        this.obstacles = []

        this.initializeGameStats()
        this.difficultyLevel = 1
        this.speedMultiplier = 1
        this.worldSpeed = 200
        this.lastPlatformY = 0

        this.setupPlayer()
        this.generateInitialWorld()

        this.gameState = GameState.PLAYING
    }

    public setWorldSpeed(speed: number): void {
        this.worldSpeed = speed
    }

    public getWorldSpeed(): number {
        return this.worldSpeed
    }

    public render(ctx: CanvasRenderingContext2D): void {
        this.renderGameStats(ctx)
    }

    private renderGameStats(ctx: CanvasRenderingContext2D): void {
        ctx.save()

        ctx.fillStyle = 'white'
        ctx.font = 'bold 24px Arial'
        ctx.fillText(`Score: ${this.gameStats.score}`, 20, 40)

        ctx.fillStyle = 'gold'
        ctx.font = '18px Arial'
        ctx.fillText(`High: ${this.gameStats.highScore}`, 20, 65)

        ctx.fillStyle = 'lightblue'
        ctx.fillText(`Height: ${Math.floor(this.gameStats.height)}m`, 20, 85)

        ctx.fillStyle = 'orange'
        ctx.fillText(`Level: ${this.difficultyLevel}`, 20, 105)

        ctx.restore()
    }
}
