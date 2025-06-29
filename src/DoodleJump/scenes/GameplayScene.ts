import { CameraFollow } from '../../components/CameraFollow'
import { Collider } from '../../components/Collider'
import { RigidBody } from '../../components/RigidBody'
import { CONFIG, KEY } from '../../config/Config'
import { GameEngine } from '../../core/GameEngine'
import { GameObject } from '../../core/GameObject'
import { Scene } from '../../core/Scene'
import { CollisionLayer, GameState } from '../../types/enums'
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
import { Transform } from '../../components/Transform'
import { PauseManager } from '../game_manager/PauseManager'

export class GameplayScene extends Scene {
    private gameEngine: GameEngine
    private player: GameObject
    private playerComponent: Player
    private camera: GameObject
    private platformManager: PlatformManager
    private backgroundManager: BackgroundManager
    private scoreManager: ScoreManager
    private inputManager: GameInput
    private pauseManager: PauseManager
    private gameState = GameState.PLAYING

    private isGameOver = false

    constructor(name = 'GameplayScene') {
        super(name)
    }

    protected onLoad(): void {
        console.log('Loading Gameplay Scene...')
        this.gameEngine = GameEngine.getInstance()
        this.gameState = GameState.PLAYING
        this.isGameOver = false
        this.createCamera()
        this.createPlayer()
        this.createPlatformManager()
        this.createBackgroundManager()
        this.createScoreManager()
        this.createInputManager()
        this.createPauseManager()

        this.setupSystemConnections()

        console.log('Gameplay Scene loaded successfully!')
    }

    protected onUnload(): void {
        console.log('Unloading Gameplay Scene...')
        const uiManager = this.gameEngine.getUIManager()
        if (uiManager && this.pauseManager) {
            uiManager.removeRootElement(this.pauseManager.getPauseOverlay())
            uiManager.removeRootElement(this.pauseManager.getSoundToggleButton())
            uiManager.removeRootElement(this.pauseManager.getPauseButton())
        }
    }

    private createCamera(): void {
        this.camera = new GameObject({
            name: 'MainCamera',
            position: new Vector2(CONFIG.CANVAS.WIDTH / 2, CONFIG.CANVAS.HEIGHT / 2),
        })

        const cameraComponent = new CameraFollow(this.camera)
        this.camera.addComponent(cameraComponent)

        this.addGameObject(this.camera)
        this.mainCamera = cameraComponent
    }

    private createPlayer(): void {
        this.player = new GameObject({
            name: 'Player',
            tag: 'Player',
            layer: 1000,
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
            GAME_CONFIG.ANIMATIONS.PLAYER_IDLE.Name,
            GAME_CONFIG.ANIMATIONS.PLAYER_IDLE.Frames,
            this.gameEngine,
            GAME_CONFIG.ANIMATIONS.PLAYER_IDLE.FrameRate,
            GAME_CONFIG.ANIMATIONS.PLAYER_IDLE.Loop
        )

        animatedRenderer.addAnimation(
            GAME_CONFIG.ANIMATIONS.PLAYER_IDLE_JETPACK.Name,
            GAME_CONFIG.ANIMATIONS.PLAYER_IDLE_JETPACK.Frames,
            this.gameEngine,
            GAME_CONFIG.ANIMATIONS.PLAYER_IDLE_JETPACK.FrameRate,
            GAME_CONFIG.ANIMATIONS.PLAYER_IDLE_JETPACK.Loop
        )

        animatedRenderer.addAnimation(
            GAME_CONFIG.ANIMATIONS.PLAYER_MOVE_LEFT.Name,
            GAME_CONFIG.ANIMATIONS.PLAYER_MOVE_LEFT.Frames,
            this.gameEngine,
            GAME_CONFIG.ANIMATIONS.PLAYER_MOVE_LEFT.FrameRate,
            GAME_CONFIG.ANIMATIONS.PLAYER_MOVE_LEFT.Loop
        )

        animatedRenderer.addAnimation(
            GAME_CONFIG.ANIMATIONS.PLAYER_MOVE_LEFT_JETPACK.Name,
            GAME_CONFIG.ANIMATIONS.PLAYER_MOVE_LEFT_JETPACK.Frames,
            this.gameEngine,
            GAME_CONFIG.ANIMATIONS.PLAYER_MOVE_LEFT_JETPACK.FrameRate,
            GAME_CONFIG.ANIMATIONS.PLAYER_MOVE_LEFT_JETPACK.Loop
        )

        animatedRenderer.addAnimation(
            GAME_CONFIG.ANIMATIONS.PLAYER_MOVE_RIGHT.Name,
            GAME_CONFIG.ANIMATIONS.PLAYER_MOVE_RIGHT.Frames,
            this.gameEngine,
            GAME_CONFIG.ANIMATIONS.PLAYER_MOVE_RIGHT.FrameRate,
            GAME_CONFIG.ANIMATIONS.PLAYER_MOVE_RIGHT.Loop
        )

        animatedRenderer.addAnimation(
            GAME_CONFIG.ANIMATIONS.PLAYER_MOVE_RIGHT_JETPACK.Name,
            GAME_CONFIG.ANIMATIONS.PLAYER_MOVE_RIGHT_JETPACK.Frames,
            this.gameEngine,
            GAME_CONFIG.ANIMATIONS.PLAYER_MOVE_RIGHT_JETPACK.FrameRate,
            GAME_CONFIG.ANIMATIONS.PLAYER_MOVE_RIGHT_JETPACK.Loop
        )

        animatedRenderer.addAnimation(
            GAME_CONFIG.ANIMATIONS.PLAYER_JUMP.Name,
            GAME_CONFIG.ANIMATIONS.PLAYER_JUMP.Frames,
            this.gameEngine,
            GAME_CONFIG.ANIMATIONS.PLAYER_JUMP.FrameRate,
            GAME_CONFIG.ANIMATIONS.PLAYER_JUMP.Loop
        )

        animatedRenderer.addAnimation(
            GAME_CONFIG.ANIMATIONS.PLAYER_DEAD.Name,
            GAME_CONFIG.ANIMATIONS.PLAYER_DEAD.Frames,
            this.gameEngine,
            GAME_CONFIG.ANIMATIONS.PLAYER_DEAD.FrameRate,
            GAME_CONFIG.ANIMATIONS.PLAYER_DEAD.Loop
        )

        animatedRenderer.playAnimation(GAME_CONFIG.ANIMATIONS.PLAYER_IDLE.Name)
        this.player.addComponent(animatedRenderer)

        const collider = new Collider(this.player)
        collider.layers = [CollisionLayer.PLAYER]
        collider.mask = [CollisionLayer.GROUND, CollisionLayer.ENVIRONMENT]
        this.player.addComponent(collider)

        const playerComponent = new Player(this.player)
        this.playerComponent = playerComponent
        this.player.addComponent(playerComponent)

        playerComponent.addEventListener(
            GAME_EVENTS.PLAYER_HIT_OBSTACLE,
            this.onPlayerHitObstacle.bind(this)
        )

        this.addGameObject(this.player)
    }

    private createPlatformManager(): void {
        const platformManagerGO = new GameObject({
            name: 'PlatformManager',
        })

        this.platformManager = new PlatformManager(platformManagerGO, this)
        platformManagerGO.addComponent(this.platformManager)

        this.addGameObject(platformManagerGO)
    }

    private createBackgroundManager(): void {
        const backgroundManagerGO = new GameObject({
            name: 'BackgroundManager',
        })

        this.backgroundManager = new BackgroundManager(backgroundManagerGO, this)
        backgroundManagerGO.addComponent(this.backgroundManager)

        this.addGameObject(backgroundManagerGO)
    }

    private createScoreManager(): void {
        const scoreManagerGO = new GameObject({
            name: 'ScoreManager',
        })

        this.scoreManager = new ScoreManager(scoreManagerGO)
        scoreManagerGO.addComponent(this.scoreManager)

        this.addGameObject(scoreManagerGO)
    }

    private createInputManager(): void {
        const inputManagerGO = new GameObject({
            name: 'InputManager',
        })

        this.inputManager = new GameInput(inputManagerGO, this.gameEngine.getInputManager())
        inputManagerGO.addComponent(this.inputManager)

        this.addGameObject(inputManagerGO)
    }

    private createPauseManager(): void {
        const pauseManagerGO = new GameObject({
            name: 'PauseManager',
        })
        this.pauseManager = new PauseManager(pauseManagerGO)
        this.pauseManager.setOnResume(() => {
            this.gameState = GameState.PLAYING
            this.isGameOver = false
        })
        this.pauseManager.setOnMenu(() => {
            this.gameEngine.setScene('MainMenuScene')
        })
        this.pauseManager.setOnRestart(() => {
            this.restartGame()
        })
        pauseManagerGO.addComponent(this.pauseManager)
        this.addGameObject(pauseManagerGO)
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
        this.triggerGameOver()
    }

    private onPlayerHitObstacle(event: GameEvent): void {
        if (this.gameState === GameState.GAMEOVER || this.isGameOver) return
        this.gameState = GameState.GAMEOVER
        this.triggerGameOver()
    }

    private checkGameOver(): void {
        if (this.gameState === GameState.GAMEOVER) return

        const playerTransform = this.player.getComponent(
            Transform as ComponentConstructor<Transform>
        )

        if (!playerTransform) return

        const position = playerTransform.getWorldPosition()
        const mainCamera = this.getMainCamera()
        if (!mainCamera) return
        const cameraY = mainCamera.getGameObject().getPosition().y

        if (position.y > cameraY + CONFIG.CANVAS.HEIGHT / 2) {
            this.playerComponent.setPlayerDead(true)
            this.triggerGameOver()
            return
        }
    }

    private triggerGameOver(): void {
        if (this.isGameOver) return

        this.isGameOver = true

        const finalScore = this.scoreManager.getCurrentScore()
        const highScore = this.scoreManager.getHighScore()

        localStorage.setItem(GAME_CONFIG.HIGH_SCORE_KEY, highScore.toString())
        localStorage.setItem(GAME_CONFIG.CURRENT_SCORE_KEY, finalScore.toString())

        console.log(`Game Over! Score: ${finalScore}, High Score: ${highScore}`)

        setTimeout(() => {
            this.gameEngine.setScene('GameOverScene')
        }, 2000)
    }

    protected onUpdate(deltaTime: number): void {
        const inputManager = this.gameEngine.getInputManager()
        if (inputManager.isKeyJustPressed(KEY.R) && this.isGameOver) {
            this.restartGame()
        }
        this.checkGameOver()
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
