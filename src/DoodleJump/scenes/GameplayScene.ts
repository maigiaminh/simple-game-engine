import { CameraFollow } from '../../components/CameraFollow'
import { Collider } from '../../components/Collider'
import { RigidBody } from '../../components/RigidBody'
import { CONFIG, KEY } from '../../config/Config'
import { GameEngine } from '../../core/GameEngine'
import { GameObject } from '../../core/GameObject'
import { Scene } from '../../core/Scene'
import { CollisionLayer } from '../../types/enums'
import { ComponentConstructor, GameEvent } from '../../types/interface'
import { Vector2 } from '../../utils/Vector2'
import { BackgroundManager } from '../game_manager/BackgroundManager'
import { Player } from '../components/Player'
import { GAME_CONFIG } from '../config/GameplayConfig'
import { GameInput } from '../game_manager/GameInput'
import { ScoreManager } from '../game_manager/ScoreManager'
import { GAME_EVENTS } from '../types/enums'
import { PlatformManager } from '../game_manager/PlatformManager'
import { AnimatedRenderer } from '../../components/AnimatedRenderer'

export class GameplayScene extends Scene {
    private gameEngine!: GameEngine
    private player!: GameObject
    private camera!: GameObject
    private platformManager!: PlatformManager
    private backgroundManager!: BackgroundManager
    private scoreManager!: ScoreManager
    private inputManager!: GameInput

    private isGameOver = false

    constructor(name = 'GameplayScene') {
        super(name)
    }

    protected async onLoad(): Promise<void> {
        console.log('Loading Gameplay Scene...')
        this.gameEngine = GameEngine.getInstance()
        await this.createCamera()
        await this.createPlayer()
        await this.createPlatformManager()
        await this.createBackgroundManager()
        await this.createScoreManager()
        await this.createInputManager()

        this.setupSystemConnections()

        console.log('Gameplay Scene loaded successfully!')
    }

    protected async onUnload(): Promise<void> {
        console.log('Unloading Gameplay Scene...')
    }

    private async createCamera(): Promise<void> {
        this.camera = new GameObject({
            name: 'MainCamera',
            position: new Vector2(CONFIG.CANVAS.WIDTH / 2, CONFIG.CANVAS.HEIGHT / 2),
        })

        const cameraComponent = new CameraFollow(this.camera)
        this.camera.addComponent(cameraComponent)

        this.addGameObject(this.camera)
        this.mainCamera = cameraComponent
    }

    private async createPlayer(): Promise<void> {
        this.player = new GameObject({
            name: 'Player',
            tag: 'Player',
            layer: 2,
            position: new Vector2(CONFIG.CANVAS.WIDTH / 2, CONFIG.CANVAS.HEIGHT - 120),
        })

        const rigidBody = new RigidBody(this.player)
        rigidBody.mass = 1
        rigidBody.drag = 0.98
        rigidBody.useGravity = true
        rigidBody.setVelocity(new Vector2(0, 0))
        this.player.addComponent(rigidBody)

        const animatedRenderer = new AnimatedRenderer(this.player)
        animatedRenderer.addAnimation(
            GAME_CONFIG.ANIMATIONS.PLAYER_IDLE.name,
            GAME_CONFIG.ANIMATIONS.PLAYER_IDLE.frames,
            this.gameEngine,
            GAME_CONFIG.ANIMATIONS.PLAYER_IDLE.frameRate,
            GAME_CONFIG.ANIMATIONS.PLAYER_IDLE.loop
        )

        animatedRenderer.addAnimation(
            GAME_CONFIG.ANIMATIONS.PLAYER_MOVE_LEFT.name,
            GAME_CONFIG.ANIMATIONS.PLAYER_MOVE_LEFT.frames,
            this.gameEngine,
            GAME_CONFIG.ANIMATIONS.PLAYER_MOVE_LEFT.frameRate,
            GAME_CONFIG.ANIMATIONS.PLAYER_MOVE_LEFT.loop
        )

        animatedRenderer.addAnimation(
            GAME_CONFIG.ANIMATIONS.PLAYER_MOVE_RIGHT.name,
            GAME_CONFIG.ANIMATIONS.PLAYER_MOVE_RIGHT.frames,
            this.gameEngine,
            GAME_CONFIG.ANIMATIONS.PLAYER_MOVE_RIGHT.frameRate,
            GAME_CONFIG.ANIMATIONS.PLAYER_MOVE_RIGHT.loop
        )

        animatedRenderer.addAnimation(
            GAME_CONFIG.ANIMATIONS.PLAYER_JUMP.name,
            GAME_CONFIG.ANIMATIONS.PLAYER_JUMP.frames,
            this.gameEngine,
            GAME_CONFIG.ANIMATIONS.PLAYER_JUMP.frameRate,
            GAME_CONFIG.ANIMATIONS.PLAYER_JUMP.loop
        )

        animatedRenderer.playAnimation(GAME_CONFIG.ANIMATIONS.PLAYER_IDLE.name)
        this.player.addComponent(animatedRenderer)

        const collider = Collider.createBox(
            this.player,
            GAME_CONFIG.PLAYER.WIDTH,
            GAME_CONFIG.PLAYER.HEIGHT
        )
        collider.layers = [CollisionLayer.PLAYER]
        collider.mask = [CollisionLayer.GROUND, CollisionLayer.ENVIRONMENT]
        this.player.addComponent(collider)

        const playerComponent = new Player(this.player)
        this.player.addComponent(playerComponent)

        playerComponent.addEventListener(GAME_EVENTS.PLAYER_FELL, this.onPlayerFell.bind(this))
        playerComponent.addEventListener(
            GAME_EVENTS.PLAYER_HIT_OBSTACLE,
            this.onPlayerHitObstacle.bind(this)
        )
        playerComponent.addEventListener(GAME_EVENTS.PLAYER_JUMP, this.onPlayerJump.bind(this))

        this.addGameObject(this.player)
    }

    private async createPlatformManager(): Promise<void> {
        const platformManagerGO = new GameObject({
            name: 'PlatformManager',
        })

        this.platformManager = new PlatformManager(platformManagerGO, this)
        platformManagerGO.addComponent(this.platformManager)

        this.addGameObject(platformManagerGO)
    }

    private async createBackgroundManager(): Promise<void> {
        const backgroundManagerGO = new GameObject({
            name: 'BackgroundManager',
        })

        this.backgroundManager = new BackgroundManager(backgroundManagerGO, this)
        backgroundManagerGO.addComponent(this.backgroundManager)

        this.addGameObject(backgroundManagerGO)
    }

    private async createScoreManager(): Promise<void> {
        const scoreManagerGO = new GameObject({
            name: 'ScoreManager',
        })

        this.scoreManager = new ScoreManager(scoreManagerGO)
        scoreManagerGO.addComponent(this.scoreManager)

        this.addGameObject(scoreManagerGO)
    }

    private async createInputManager(): Promise<void> {
        const inputManagerGO = new GameObject({
            name: 'InputManager',
        })

        this.inputManager = new GameInput(inputManagerGO, this.gameEngine.getInputManager())
        inputManagerGO.addComponent(this.inputManager)

        this.addGameObject(inputManagerGO)
    }

    private setupSystemConnections(): void {
        const cameraComponent = this.camera.getComponent(
            CameraFollow as ComponentConstructor<CameraFollow>
        )
        if (cameraComponent) {
            cameraComponent.setTarget(this.player)
        }

        if (this.backgroundManager && this.mainCamera) {
            this.backgroundManager.setCamera(this.mainCamera)
        }

        if (this.scoreManager) {
            this.scoreManager.setPlayer(this.player)
        }

        const playerComponent = this.player.getComponent(Player as ComponentConstructor<Player>)
        if (this.inputManager && playerComponent) {
            this.inputManager.setPlayer(playerComponent)
        }
    }

    private onPlayerFell(event: GameEvent): void {
        console.log('Player fell! Game Over')
        this.triggerGameOver()
    }

    private onPlayerHitObstacle(event: GameEvent): void {
        console.log('Player hit obstacle! Game Over')
        this.triggerGameOver()
    }

    private onPlayerJump(event: GameEvent): void {
        // this.gameEngine.getAudioManager().playSound('jump');
    }

    private triggerGameOver(): void {
        if (this.isGameOver) return

        this.isGameOver = true

        const finalScore = this.scoreManager.getCurrentScore()
        const highScore = this.scoreManager.getHighScore()

        console.log(`Game Over! Score: ${finalScore}, High Score: ${highScore}`)

        setTimeout(() => {
            this.gameEngine.setScene('GameOverScene')
        }, 1000)
    }

    protected onUpdate(deltaTime: number): void {
        const inputManager = this.gameEngine.getInputManager()
        if (inputManager.isKeyJustPressed(KEY.R) && this.isGameOver) {
            this.restartGame()
        }
    }

    protected onRender(ctx: CanvasRenderingContext2D): void {
        if (this.backgroundManager) {
            this.backgroundManager.render(ctx)
        }
        ctx.save()
        ctx.font = '24px Arial'
        ctx.fillStyle = '#fff'
        ctx.textAlign = 'left'

        ctx.fillText(`Score: ${this.scoreManager.getCurrentScore()}`, 100, 300)
        ctx.restore()
    }

    public restartGame(): void {
        console.log('Restarting game...')
        this.gameEngine.setScene('GameplayScene')
    }

    public getScore(): number {
        return this.scoreManager ? this.scoreManager.getCurrentScore() : 0
    }

    public getHighScore(): number {
        return this.scoreManager ? this.scoreManager.getHighScore() : 0
    }
}
