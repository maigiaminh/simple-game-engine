import { EnhancedButton } from '../../components/EnhancedButton'
import { EnhancedLabel } from '../../components/EnhancedLabel'
import { EnhancedPanel } from '../../components/EnhancedPanel'
import { ParticleSystem } from '../../components/ParticleSystem'
import { Renderer } from '../../components/Renderer'
import { UIAnimator, Easing } from '../../components/UIAnimator'
import { CONFIG } from '../../config/Config'
import { GameEngine } from '../../core/GameEngine'
import { GameObject } from '../../core/GameObject'
import { Scene } from '../../core/Scene'
import { UIAnchor, AnimationType } from '../../types/enums'
import { Color } from '../../utils/Color'
import { Vector2 } from '../../utils/Vector2'
import { GAME_CONFIG } from '../config/GameplayConfig'

export class GameOverScene extends Scene {
    private gameEngine!: GameEngine
    private finalScore = 0
    private highScore = 0
    private isNewHighScore = false
    private animator!: UIAnimator
    private particleSystem!: ParticleSystem

    private backgroundPanel!: EnhancedPanel
    private gameOverLabel!: EnhancedLabel
    private scorePanel!: EnhancedPanel
    private finalScoreLabel!: EnhancedLabel
    private highScoreLabel!: EnhancedLabel
    private performanceLabel!: EnhancedLabel
    private restartButton!: EnhancedButton
    private menuButton!: EnhancedButton

    private animationComplete = false
    private celebrationTime = 0

    constructor(name = 'GameOverScene') {
        super(name)
    }

    protected async onLoad(): Promise<void> {
        console.log('Loading Enhanced Game Over Scene...')
        this.gameEngine = GameEngine.getInstance()

        this.loadScores()

        await this.createEffectSystems()

        await this.createUI()

        await this.playEntranceAnimation()

        console.log('Enhanced Game Over Scene loaded!')
    }

    protected async onUnload(): Promise<void> {
        console.log('Unloading Enhanced Game Over Scene...')
    }

    private loadScores(): void {
        try {
            const savedHighScore = localStorage.getItem(GAME_CONFIG.HIGH_SCORE_KEY)
            const savedFinalScore = localStorage.getItem(GAME_CONFIG.CURRENT_SCORE_KEY)
            this.finalScore = savedFinalScore ? parseInt(savedFinalScore, 10) : 0
            this.highScore = savedHighScore ? parseInt(savedHighScore, 10) : 0

            this.isNewHighScore = this.finalScore > this.highScore
            if (this.isNewHighScore) {
                this.highScore = this.finalScore
                localStorage.setItem(GAME_CONFIG.HIGH_SCORE_KEY, this.highScore.toString())
            }
        } catch (error) {
            console.warn('Error loading scores:', error)
            this.finalScore = 0
            this.highScore = 0
        }
    }

    private async createEffectSystems(): Promise<void> {
        const animatorGO = new GameObject({ name: 'GameOverAnimator' })
        this.animator = new UIAnimator(animatorGO)
        animatorGO.addComponent(this.animator)
        this.addGameObject(animatorGO)

        const particleGO = new GameObject({ name: 'GameOverParticles' })
        this.particleSystem = new ParticleSystem(particleGO, 300)
        particleGO.addComponent(this.particleSystem)
        this.addGameObject(particleGO)
    }

    private async createUI(): Promise<void> {
        await this.createBackgroundPanel()
        await this.createGameOverTitle()
        await this.createScorePanel()
        await this.createButtons()

        this.addUIToManager()
    }

    private async createBackgroundPanel(): Promise<void> {
        const panelGO = new GameObject({
            name: 'GameOverPanel',
            position: new Vector2(0, 0),
        })

        this.backgroundPanel = new EnhancedPanel(panelGO)
        this.backgroundPanel.setAnchor(UIAnchor.MIDDLE_CENTER)
        this.backgroundPanel.size = new Vector2(CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT)

        this.backgroundPanel.setGradient([
            new Color(40, 20, 20, 0.95),
            new Color(20, 20, 40, 0.95),
            new Color(40, 20, 60, 0.95),
        ])

        this.backgroundPanel.enableAnimatedGradient(true)
        this.backgroundPanel.enableGlassEffect(true)
        this.backgroundPanel.enableBorderGlow(true)
        this.backgroundPanel.cornerRadius = 25
        this.backgroundPanel.borderColor = new Color(255, 100, 100, 0.8)
        this.backgroundPanel.borderWidth = 3

        const backgroundRenderer = new GameObject({
            name: 'BackgroundRenderer',
            position: new Vector2(CONFIG.CANVAS.WIDTH / 2, CONFIG.CANVAS.HEIGHT / 2),
            layer: -100,
        })

        const renderer = new Renderer(backgroundRenderer)
        const bgImage = GameEngine.getInstance()
            .getResourceManager()
            .getResource(GAME_CONFIG.IMAGES.BACKGROUND.GAMEPLAY_BACKGROUND)

        renderer.setImage(bgImage as HTMLImageElement)
        renderer.setImageSize(CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT)
        backgroundRenderer.addComponent(renderer)

        panelGO.addComponent(this.backgroundPanel)
        this.addGameObject(backgroundRenderer)
        this.addGameObject(panelGO)
    }

    private async createGameOverTitle(): Promise<void> {
        const titleGO = new GameObject({
            name: 'GameOverTitle',
            position: new Vector2(CONFIG.CANVAS.WIDTH / 2 - 250, 100),
        })

        this.gameOverLabel = new EnhancedLabel(titleGO, 'GAME OVER')
        this.gameOverLabel.setAnchor(UIAnchor.MIDDLE_CENTER)
        this.gameOverLabel.setFont('42px "Arial Black", Arial')
        this.gameOverLabel.setColor(new Color(255, 100, 100, 1))
        this.gameOverLabel.setTextAlign('center')
        this.gameOverLabel.setTextBaseline('middle')
        this.gameOverLabel.size = new Vector2(500, 60)
        this.gameOverLabel.enableGlow(true)
        this.gameOverLabel.enablePulse(true)

        titleGO.addComponent(this.gameOverLabel)
        titleGO.setActive(false)
        this.backgroundPanel.addChild(this.gameOverLabel)
    }

    private async createScorePanel(): Promise<void> {
        const scorePanelGO = new GameObject({
            name: 'ScorePanel',
            position: new Vector2(CONFIG.CANVAS.WIDTH / 2 - 200, 300),
        })

        this.scorePanel = new EnhancedPanel(scorePanelGO)

        scorePanelGO.addComponent(this.scorePanel)
        this.backgroundPanel.addChild(this.scorePanel)

        const finalScoreGO = new GameObject({
            name: 'FinalScoreLabel',
            position: new Vector2(0, -60),
        })

        this.finalScoreLabel = new EnhancedLabel(finalScoreGO, `Your Score: ${this.finalScore}`)
        this.finalScoreLabel.setAnchor(UIAnchor.MIDDLE_CENTER)
        this.finalScoreLabel.setFont('28px "Arial Black", Arial')
        this.finalScoreLabel.setColor(new Color(255, 255, 100, 1))
        this.finalScoreLabel.setTextAlign('center')
        this.finalScoreLabel.size = new Vector2(400, 40)
        this.finalScoreLabel.enableGlow(true)

        finalScoreGO.addComponent(this.finalScoreLabel)
        this.scorePanel.addChild(this.finalScoreLabel)
        finalScoreGO.setActive(false)

        const highScoreGO = new GameObject({
            name: 'HighScoreLabel',
            position: new Vector2(0, -10),
        })

        const highScoreText = this.isNewHighScore
            ? `NEW HIGH SCORE: ${this.highScore}`
            : `High Score: ${this.highScore}`

        this.highScoreLabel = new EnhancedLabel(highScoreGO, highScoreText)
        this.highScoreLabel.setAnchor(UIAnchor.MIDDLE_CENTER)
        this.highScoreLabel.setFont('20px Arial')
        this.highScoreLabel.setColor(
            this.isNewHighScore ? new Color(255, 215, 0, 1) : new Color(200, 200, 255, 1)
        )
        this.highScoreLabel.setTextAlign('center')
        this.highScoreLabel.size = new Vector2(400, 30)
        this.highScoreLabel.getGameObject().setActive(false)

        highScoreGO.addComponent(this.highScoreLabel)
        this.scorePanel.addChild(this.highScoreLabel)

        const performanceGO = new GameObject({
            name: 'PerformanceLabel',
            position: new Vector2(0, 40),
        })

        const performanceText = this.getPerformanceMessage()
        this.performanceLabel = new EnhancedLabel(performanceGO, performanceText)
        this.performanceLabel.setAnchor(UIAnchor.MIDDLE_CENTER)
        this.performanceLabel.setFont('16px Arial')
        this.performanceLabel.setColor(new Color(180, 180, 255, 0.8))
        this.performanceLabel.setTextAlign('center')
        this.performanceLabel.size = new Vector2(400, 25)
        performanceGO.setActive(false)
        performanceGO.addComponent(this.performanceLabel)
        this.scorePanel.addChild(this.performanceLabel)
        scorePanelGO.setActive(false)
    }

    private async createButtons(): Promise<void> {
        const restartGO = new GameObject({
            name: 'RestartButton',
            position: new Vector2(CONFIG.CANVAS.WIDTH / 2 - 250, CONFIG.CANVAS.HEIGHT / 2 + 75),
        })

        this.restartButton = new EnhancedButton(restartGO, 'PLAY AGAIN')
        this.restartButton.setAnchor(UIAnchor.MIDDLE_CENTER)
        this.restartButton.size = new Vector2(200, 60)
        this.restartButton.setColors(
            new Color(50, 200, 50, 1),
            new Color(255, 255, 255, 1),
            new Color(80, 230, 80, 1)
        )
        this.restartButton.enableHoverEffect = true
        this.restartButton.enableClickEffect = true
        this.restartButton.enableGlow = true
        this.restartButton.setOnClick(() => this.onRestartClick())

        restartGO.addComponent(this.restartButton)
        this.backgroundPanel.addChild(this.restartButton)
        restartGO.setActive(false)
        const menuGO = new GameObject({
            name: 'MenuButton',
            position: new Vector2(CONFIG.CANVAS.WIDTH / 2 + 50, CONFIG.CANVAS.HEIGHT / 2 + 75),
        })

        this.menuButton = new EnhancedButton(menuGO, 'MENU')
        this.menuButton.setAnchor(UIAnchor.MIDDLE_CENTER)
        this.menuButton.size = new Vector2(200, 60)
        this.menuButton.setColors(
            new Color(100, 100, 200, 1),
            new Color(255, 255, 255, 1),
            new Color(130, 130, 230, 1)
        )
        this.menuButton.enableHoverEffect = true
        this.menuButton.enableClickEffect = true
        this.menuButton.setOnClick(() => this.onMenuClick())

        menuGO.addComponent(this.menuButton)
        this.backgroundPanel.addChild(this.menuButton)
        menuGO.setActive(false)
    }

    private addUIToManager(): void {
        const uiManager = this.gameEngine.getUIManager()
        if (uiManager && this.backgroundPanel) {
            uiManager.addRootElement(this.backgroundPanel)
        }
    }

    private async playEntranceAnimation(): Promise<void> {
        this.animator.animate(this.backgroundPanel, {
            type: AnimationType.FadeIn,
            duration: 800,
            easing: Easing.easeOutCubic,
        })

        setTimeout(() => {
            this.gameOverLabel.getGameObject().setActive(true)
            this.animator.animate(this.gameOverLabel, {
                type: AnimationType.SLIDE_IN_FROM_TOP,
                duration: 600,
                easing: Easing.easeOutBounce,
            })
        }, 300)

        setTimeout(() => {
            this.scorePanel.getGameObject().setActive(true)
            this.animator.animate(this.scorePanel, {
                type: AnimationType.SCALE_IN,
                duration: 500,
                easing: Easing.easeOutElastic,
            })
        }, 800)

        setTimeout(() => {
            this.finalScoreLabel.getGameObject().setActive(true)
            this.finalScoreLabel.startTypewriter(40)
        }, 1200)

        setTimeout(() => {
            this.highScoreLabel.getGameObject().setActive(true)
            this.highScoreLabel.startTypewriter(50)
        }, 1800)

        setTimeout(() => {
            this.performanceLabel.getGameObject().setActive(true)
            this.performanceLabel.startTypewriter(50)
        }, 2400)

        setTimeout(() => {
            this.restartButton.getGameObject().setActive(true)
            this.animator.animate(this.restartButton, {
                type: AnimationType.SLIDE_IN_FROM_BOTTOM,
                duration: 400,
                easing: Easing.easeOutQuad,
            })
        }, 2800)

        setTimeout(() => {
            this.menuButton.getGameObject().setActive(true)
            this.animator.animate(this.menuButton, {
                type: AnimationType.SLIDE_IN_FROM_BOTTOM,
                duration: 300,
                easing: Easing.easeOutQuad,
            })
        }, 3000)

        if (this.isNewHighScore) {
            this.startCelebration()
        }
    }

    private startCelebration(): void {
        if (!this.isNewHighScore) return

        const center = new Vector2(CONFIG.CANVAS.WIDTH / 2, CONFIG.CANVAS.HEIGHT / 2)
        this.particleSystem.emitConfetti(center, 50)

        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const x = Math.random() * CONFIG.CANVAS.WIDTH
                const y = Math.random() * CONFIG.CANVAS.HEIGHT
                this.particleSystem.emitHearts(new Vector2(x, y), 3)
            }, i * 200)
        }
    }

    private getPerformanceMessage(): string {
        if (this.finalScore === 0) return 'Try again!'
        if (this.finalScore < 100) return 'Keep practicing!'
        if (this.finalScore < 500) return 'Not bad!'
        if (this.finalScore < 1000) return 'Good job!'
        if (this.finalScore < 2000) return 'Excellent!'
        return 'AMAZING!'
    }

    private onRestartClick(): void {
        console.log('Restarting game...')

        if (this.particleSystem) {
            const bounds = this.restartButton.getWorldBounds()
            const center = new Vector2(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2)
            this.particleSystem.emitSparkles(center, 10)
        }

        setTimeout(() => {
            this.gameEngine.setScene('GameplayScene')
        }, 200)
    }

    private onMenuClick(): void {
        console.log('Going to menu...')

        setTimeout(() => {
            this.gameEngine.setScene('MainMenuScene')
        }, 200)
    }

    public setScores(finalScore: number, highScore: number): void {
        this.finalScore = finalScore
        this.highScore = highScore
        this.isNewHighScore = finalScore > highScore

        if (this.finalScoreLabel) {
            this.finalScoreLabel.setText(`Your Score: ${this.finalScore}`)
        }
        if (this.highScoreLabel) {
            const text = this.isNewHighScore
                ? `NEW HIGH SCORE: ${this.highScore}`
                : `High Score: ${this.highScore}`
            this.highScoreLabel.setText(text)
        }
    }

    protected onUpdate(deltaTime: number): void {
        this.celebrationTime += deltaTime

        if (this.isNewHighScore && this.animationComplete) {
            if (Math.random() < 0.02) {
                const x = Math.random() * CONFIG.CANVAS.WIDTH
                const y = Math.random() * CONFIG.CANVAS.HEIGHT
                this.particleSystem.emitStars(new Vector2(x, y), 2)
            }
        }
    }

    protected onRender(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
        ctx.fillRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT)

        if (this.particleSystem) {
            this.particleSystem.render(ctx)
        }

        if (this.isNewHighScore && this.animationComplete) {
            this.drawCelebrationEffects(ctx)
        }

        this.drawMobileInstructions(ctx)
    }

    private drawCelebrationEffects(ctx: CanvasRenderingContext2D): void {
        const time = this.celebrationTime * 0.005

        ctx.save()
        ctx.strokeStyle = `hsla(${(time * 60) % 360}, 70%, 60%, 0.5)`
        ctx.lineWidth = 5 + Math.sin(time * 2) * 3
        ctx.strokeRect(10, 10, CONFIG.CANVAS.WIDTH - 20, CONFIG.CANVAS.HEIGHT - 20)
        ctx.restore()
    }

    private drawMobileInstructions(ctx: CanvasRenderingContext2D): void {
        if ('ontouchstart' in window && this.animationComplete) {
            ctx.save()
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
            ctx.font = '16px Arial'
            ctx.textAlign = 'center'
            ctx.fillText('Tap to play again', CONFIG.CANVAS.WIDTH / 2, CONFIG.CANVAS.HEIGHT - 20)
            ctx.restore()
        }
    }
}
