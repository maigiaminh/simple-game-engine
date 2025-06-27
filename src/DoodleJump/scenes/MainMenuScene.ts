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

export class MainMenuScene extends Scene {
    private gameEngine!: GameEngine
    private animator!: UIAnimator
    private particleSystem!: ParticleSystem

    private backgroundPanel!: EnhancedPanel
    private titleLabel!: EnhancedLabel
    private subtitleLabel!: EnhancedLabel
    private playButton!: EnhancedButton
    private highScoreLabel!: EnhancedLabel
    private instructionsLabel!: EnhancedLabel
    private soundToggleButton!: EnhancedButton
    private isSoundOn = localStorage.getItem(GAME_CONFIG.AUDIO_ENABLED_KEY) === 'true'

    private introAnimationComplete = false
    private backgroundAnimationTime = 0

    constructor(name = 'MainMenuScene') {
        super(name)
    }

    protected async onLoad(): Promise<void> {
        console.log('Loading Main Menu Scene...')
        this.gameEngine = GameEngine.getInstance()
        this.gameEngine
            .getAudioManager()
            .playBackgroundMusic(GAME_CONFIG.AUDIO.MUSIC.BACKGROUND_MUSIC, {
                loop: true,
                volume: 0.5,
            })
        await this.createBackground()

        await this.createEffectSystems()

        await this.createUI()

        await this.playIntroAnimation()

        console.log('Main Menu Scene loaded successfully!')
    }

    protected async onUnload(): Promise<void> {
        console.log('Unloading Main Menu Scene...')
        const uiManager = this.gameEngine.getUIManager()
        if (uiManager && this.backgroundPanel) {
            uiManager.removeRootElement(this.backgroundPanel)
        }
    }

    private async createBackground(): Promise<void> {
        const backgroundGO = new GameObject({
            name: 'MenuBackground',
        })

        this.addGameObject(backgroundGO)
    }

    private async createEffectSystems(): Promise<void> {
        const animatorGO = new GameObject({
            name: 'UIAnimator',
        })
        this.animator = new UIAnimator(animatorGO)
        animatorGO.addComponent(this.animator)
        this.addGameObject(animatorGO)

        const particleGO = new GameObject({
            name: 'MenuParticles',
        })
        this.particleSystem = new ParticleSystem(particleGO, 200)
        particleGO.addComponent(this.particleSystem)
        this.addGameObject(particleGO)
    }

    private async createUI(): Promise<void> {
        await this.createBackgroundPanel()

        await this.createTitle()

        await this.createSubtitle()

        await this.createHighScoreDisplay()

        await this.createPlayButton()

        await this.createInstructions()

        await this.createSoundToggleButton()

        this.addUIToManager()
    }

    private async createBackgroundPanel(): Promise<void> {
        const panelGO = new GameObject({
            name: 'MenuBackgroundPanel',
            position: new Vector2(0, 0),
        })

        this.backgroundPanel = new EnhancedPanel(panelGO)
        this.backgroundPanel.setAnchor(UIAnchor.MIDDLE_CENTER)
        this.backgroundPanel.size = new Vector2(800, 700)

        this.backgroundPanel.setGradient([
            new Color(20, 30, 60, 0.95),
            new Color(40, 20, 80, 0.95),
            new Color(60, 30, 100, 0.95),
        ])

        this.backgroundPanel.enableAnimatedGradient(true)
        this.backgroundPanel.enableGlassEffect(true)
        this.backgroundPanel.enableBorderGlow(true)
        this.backgroundPanel.enableFloating(true, 3)
        this.backgroundPanel.cornerRadius = 25
        this.backgroundPanel.borderColor = new Color(100, 200, 255, 0.6)
        this.backgroundPanel.borderWidth = 3

        const bgReder = new GameObject({
            name: 'BackgroundRenderer',
            position: new Vector2(CONFIG.CANVAS.WIDTH / 2, CONFIG.CANVAS.HEIGHT / 2 - 50),
        })
        const bgRenderer = bgReder.addComponent(new Renderer(bgReder))
        bgRenderer.setColor(new Color(255, 255, 255, 0.1))
        const bgImage = this.gameEngine
            .getResourceManager()
            .getResource(GAME_CONFIG.IMAGES.BACKGROUND.MAINMENU_BACKGROUND)
        bgRenderer.setImage(bgImage as HTMLImageElement)
        bgRenderer.setImageSize(CONFIG.CANVAS.WIDTH * 0.75, CONFIG.CANVAS.HEIGHT * 0.75)

        panelGO.addComponent(this.backgroundPanel)
        this.addGameObject(bgReder)
        this.addGameObject(panelGO)
    }

    private async createTitle(): Promise<void> {
        const titleGO = new GameObject({
            name: 'GameTitle',
            position: new Vector2(CONFIG.CANVAS.WIDTH / 2 - 300, 150),
            layer: 10,
        })

        this.titleLabel = new EnhancedLabel(titleGO, 'DOODLE JUMP')
        this.titleLabel.setAnchor(UIAnchor.MIDDLE_CENTER)
        this.titleLabel.setFont('48px "Arial Black", Arial')
        this.titleLabel.setColor(Color.BLACK)
        this.titleLabel.setTextAlign('center')
        this.titleLabel.size = new Vector2(600, 80)
        this.titleLabel.enableGlow(true)
        this.titleLabel.enablePulse(true)

        titleGO.setActive(false)
        titleGO.addComponent(this.titleLabel)
        this.backgroundPanel.addChild(this.titleLabel)
    }

    private async createSubtitle(): Promise<void> {
        const subtitleGO = new GameObject({
            name: 'GameSubtitle',
            position: new Vector2(CONFIG.CANVAS.WIDTH / 2 - 200, 225),
        })

        this.subtitleLabel = new EnhancedLabel(subtitleGO, 'Jump to the Sky!')
        this.subtitleLabel.setAnchor(UIAnchor.MIDDLE_CENTER)
        this.subtitleLabel.setFont('24px Arial')
        this.subtitleLabel.setColor(new Color(200, 200, 200, 0.9))
        this.subtitleLabel.setTextAlign('center')
        this.subtitleLabel.size = new Vector2(400, 40)
        // this.subtitleLabel.enableRainbow(true)

        subtitleGO.addComponent(this.subtitleLabel)
        subtitleGO.setActive(false)
        this.backgroundPanel.addChild(this.subtitleLabel)
    }

    private async createHighScoreDisplay(): Promise<void> {
        const highScore = this.getHighScore()
        const highScoreGO = new GameObject({
            name: 'HighScoreDisplay',
            position: new Vector2(CONFIG.CANVAS.WIDTH / 2 - 150, 325),
        })

        this.highScoreLabel = new EnhancedLabel(highScoreGO, `🏆 High Score: ${highScore}`)
        this.highScoreLabel.setAnchor(UIAnchor.MIDDLE_CENTER)
        this.highScoreLabel.setFont('20px Arial')
        this.highScoreLabel.setColor(new Color(255, 215, 0, 1))
        this.highScoreLabel.setTextAlign('center')
        this.highScoreLabel.size = new Vector2(300, 30)
        this.highScoreLabel.enableGlow(true)

        highScoreGO.addComponent(this.highScoreLabel)
        highScoreGO.setActive(false)
        this.backgroundPanel.addChild(this.highScoreLabel)
    }

    private async createPlayButton(): Promise<void> {
        const playButtonGO = new GameObject({
            name: 'PlayButton',
            position: new Vector2(CONFIG.CANVAS.WIDTH / 2 - 100, CONFIG.CANVAS.HEIGHT / 2 + 50),
        })

        this.playButton = new EnhancedButton(playButtonGO, 'PLAY GAME')
        this.playButton.setAnchor(UIAnchor.MIDDLE_CENTER)
        this.playButton.size = new Vector2(210, 64)
        this.playButton.setColors(
            new Color(50, 200, 50, 1),
            new Color(255, 255, 255, 1),
            new Color(80, 230, 80, 1)
        )

        this.playButton.enableHoverEffect = true
        this.playButton.enableClickEffect = true
        this.playButton.enableGlow = true
        this.playButton.enablePulse = true

        this.playButton.cornerRadius = 15
        this.playButton.borderWidth = 3
        this.playButton.borderColor = new Color(255, 255, 255, 0.5)

        if (this.playButton.label) {
            this.playButton.label.setFont('24px "Arial Black", Arial')
        }

        this.playButton.setOnClick(() => this.onPlayButtonClick())

        playButtonGO.addComponent(this.playButton)
        playButtonGO.setActive(false)
        this.backgroundPanel.addChild(this.playButton)
    }

    private async createInstructions(): Promise<void> {
        const instructionsGO = new GameObject({
            name: 'Instructions',
            position: new Vector2(CONFIG.CANVAS.WIDTH / 2 - 300, CONFIG.CANVAS.HEIGHT - 100),
        })

        const instructionText = '🎮 Controls: ← → or A D to move • ↑ or W to shoot'
        this.instructionsLabel = new EnhancedLabel(instructionsGO, instructionText)
        this.instructionsLabel.setAnchor(UIAnchor.MIDDLE_CENTER)
        this.instructionsLabel.setFont('16px Arial')
        this.instructionsLabel.setColor(new Color(180, 180, 255, 0.8))
        this.instructionsLabel.setTextAlign('center')
        this.instructionsLabel.size = new Vector2(600, 40)

        instructionsGO.addComponent(this.instructionsLabel)
        instructionsGO.setActive(false)
        this.backgroundPanel.addChild(this.instructionsLabel)
    }

    private async createSoundToggleButton(): Promise<void> {
        const btnGO = new GameObject({
            name: 'SoundToggleButton',
            position: new Vector2(CONFIG.CANVAS.WIDTH / 2 + 300, 75),
        })

        this.soundToggleButton = new EnhancedButton(btnGO, '')
        this.soundToggleButton.size = new Vector2(48, 48)
        this.soundToggleButton.setColors(
            new Color(220, 220, 220, 1),
            new Color(255, 255, 255, 1),
            new Color(180, 180, 180, 1)
        )
        const imgSoundOn = this.gameEngine
            .getResourceManager()
            .getResource(GAME_CONFIG.IMAGES.BUTTON.SOUND_ON_BUTTON)
        const imgSoundOff = this.gameEngine
            .getResourceManager()
            .getResource(GAME_CONFIG.IMAGES.BUTTON.SOUND_OFF_BUTTON)
        this.gameEngine.getAudioManager().setEnabled(this.isSoundOn)
        this.soundToggleButton.setBackgroundImage(
            this.isSoundOn ? (imgSoundOn as HTMLImageElement) : (imgSoundOff as HTMLImageElement)
        )
        this.soundToggleButton.enableHoverEffect = true
        this.soundToggleButton.enableClickEffect = true
        this.soundToggleButton.cornerRadius = 12
        this.soundToggleButton.borderWidth = 2
        this.soundToggleButton.borderColor = new Color(100, 100, 100, 0.4)

        this.soundToggleButton.setOnClick(() => this.toggleSound())

        btnGO.addComponent(this.soundToggleButton)
        btnGO.setActive(true)
        this.backgroundPanel.addChild(this.soundToggleButton)
    }

    private toggleSound(): void {
        this.isSoundOn = !this.isSoundOn
        localStorage.setItem(GAME_CONFIG.AUDIO_ENABLED_KEY, String(this.isSoundOn))
        const imgSoundOn = this.gameEngine
            .getResourceManager()
            .getResource(GAME_CONFIG.IMAGES.BUTTON.SOUND_ON_BUTTON)
        const imgSoundOff = this.gameEngine
            .getResourceManager()
            .getResource(GAME_CONFIG.IMAGES.BUTTON.SOUND_OFF_BUTTON)
        this.soundToggleButton.setBackgroundImage(
            this.isSoundOn ? (imgSoundOn as HTMLImageElement) : (imgSoundOff as HTMLImageElement)
        )

        this.gameEngine.getAudioManager().setEnabled(this.isSoundOn)
    }

    private addUIToManager(): void {
        const uiManager = this.gameEngine.getUIManager()
        if (uiManager && this.backgroundPanel) {
            uiManager.addRootElement(this.backgroundPanel)
        }
    }

    private async playIntroAnimation(): Promise<void> {
        this.animator.animate(this.backgroundPanel, {
            type: AnimationType.FadeIn,
            duration: 1000,
            easing: Easing.easeOutCubic,
        })

        setTimeout(() => {
            this.titleLabel.getGameObject().setActive(true)
            this.animator.animate(this.titleLabel, {
                type: AnimationType.SLIDE_IN_FROM_TOP,
                duration: 800,
                easing: Easing.easeOutBounce,
            })
        }, 200)
        setTimeout(() => {
            this.subtitleLabel.getGameObject().setActive(true)
            this.subtitleLabel.startTypewriter(30)
        }, 1000)

        setTimeout(() => {
            this.highScoreLabel.getGameObject().setActive(true)
            this.animator.animate(this.highScoreLabel, {
                type: AnimationType.SLIDE_IN_FROM_LEFT,
                duration: 600,
                easing: Easing.easeOutQuad,
            })
        }, 1200)

        setTimeout(() => {
            this.playButton.getGameObject().setActive(true)
            this.animator.animate(this.playButton, {
                type: AnimationType.BOUNCE,
                duration: 500,
                easing: Easing.easeOutElastic,
                onComplete: () => {
                    this.introAnimationComplete = true
                    this.startContinuousEffects()
                },
            })
        }, 1500)

        setTimeout(() => {
            this.instructionsLabel.getGameObject().setActive(true)
            this.instructionsLabel.startTypewriter(50)
        }, 1800)
    }

    private startContinuousEffects(): void {
        setInterval(() => {
            const x = Math.random() * CONFIG.CANVAS.WIDTH
            const y = Math.random() * CONFIG.CANVAS.HEIGHT
            this.particleSystem.emitStars(new Vector2(x, y), 1)
        }, 500)

        setInterval(() => {
            const titleBounds = this.titleLabel.getWorldBounds()
            const x = titleBounds.x + Math.random() * titleBounds.width
            const y = titleBounds.y + Math.random() * titleBounds.height
            this.particleSystem.emitSparkles(new Vector2(x, y), 3)
        }, 1000)
    }

    private onPlayButtonClick(): void {
        console.log('Starting game from menu...')

        if (this.playButton && this.particleSystem) {
            const bounds = this.playButton.getWorldBounds()
            const center = new Vector2(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2)
            this.particleSystem.emitConfetti(center, 30)
        }

        setTimeout(() => {
            this.gameEngine.setScene('GameplayScene')
        }, 300)
    }

    private getHighScore(): number {
        try {
            const saved = localStorage.getItem(GAME_CONFIG.HIGH_SCORE_KEY)
            return saved ? parseInt(saved, 10) : 0
        } catch (error) {
            return 0
        }
    }

    protected onUpdate(deltaTime: number): void {
        this.backgroundAnimationTime += deltaTime
    }

    protected onRender(ctx: CanvasRenderingContext2D): void {
        this.renderAnimatedBackground(ctx)

        if (this.particleSystem) {
            this.particleSystem.render(ctx)
        }

        this.drawDecorations(ctx)
    }

    private renderAnimatedBackground(ctx: CanvasRenderingContext2D): void {
        const time = this.backgroundAnimationTime * 0.001
        const hue1 = (time * 20) % 360
        const hue2 = (time * 30 + 180) % 360

        const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.CANVAS.HEIGHT)
        gradient.addColorStop(0, Color.fromHSL({ h: hue1, s: 60, l: 20 }).toString())
        gradient.addColorStop(0.5, Color.fromHSL({ h: hue2, s: 40, l: 15 }).toString())
        gradient.addColorStop(1, Color.fromHSL({ h: hue1 + 60, s: 50, l: 10 }).toString())

        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT)
    }

    private drawDecorations(ctx: CanvasRenderingContext2D): void {
        if (!this.introAnimationComplete) return

        ctx.save()

        this.drawFloatingShapes(ctx)

        this.drawCornerDecorations(ctx)

        this.drawMobileHint(ctx)

        ctx.restore()
    }

    private drawFloatingShapes(ctx: CanvasRenderingContext2D): void {
        const time = this.backgroundAnimationTime * 0.0005

        for (let i = 0; i < 8; i++) {
            const angle = time + (i * Math.PI) / 4
            const radius = 200 + Math.sin(time + i) * 50
            const x = CONFIG.CANVAS.WIDTH / 2 + Math.cos(angle) * radius
            const y = CONFIG.CANVAS.HEIGHT / 2 + Math.sin(angle) * radius
            const size = 3 + Math.sin(time * 2 + i) * 2

            ctx.fillStyle = `hsla(${(time * 100 + i * 45) % 360}, 70%, 60%, 0.3)`
            ctx.beginPath()
            ctx.arc(x, y, size, 0, Math.PI * 2)
            ctx.fill()
        }
    }

    private drawCornerDecorations(ctx: CanvasRenderingContext2D): void {
        const time = this.backgroundAnimationTime * 0.002

        this.drawCornerPattern(ctx, 50, 50, time)
        this.drawCornerPattern(ctx, CONFIG.CANVAS.WIDTH - 50, 50, time + Math.PI)

        this.drawCornerPattern(ctx, 50, CONFIG.CANVAS.HEIGHT - 50, time + Math.PI / 2)
        this.drawCornerPattern(
            ctx,
            CONFIG.CANVAS.WIDTH - 50,
            CONFIG.CANVAS.HEIGHT - 50,
            time + Math.PI * 1.5
        )
    }

    private drawCornerPattern(
        ctx: CanvasRenderingContext2D,
        centerX: number,
        centerY: number,
        timeOffset: number
    ): void {
        for (let i = 0; i < 3; i++) {
            const radius = (i + 1) * 15
            const alpha = 0.4 - i * 0.1
            const rotation = timeOffset + i * 0.5

            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.arc(centerX, centerY, radius, rotation, rotation + Math.PI)
            ctx.stroke()
        }
    }

    private drawMobileHint(ctx: CanvasRenderingContext2D): void {
        if ('ontouchstart' in window && this.introAnimationComplete) {
            ctx.save()
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
            ctx.font = '16px Arial'
            ctx.textAlign = 'center'

            const alpha = 0.5 + Math.sin(this.backgroundAnimationTime * 0.003) * 0.3
            ctx.globalAlpha = alpha

            ctx.fillText(
                'Tap anywhere to start!',
                CONFIG.CANVAS.WIDTH / 2,
                CONFIG.CANVAS.HEIGHT - 30
            )
            ctx.restore()
        }
    }

    public updateHighScore(): void {
        const newHighScore = this.getHighScore()
        if (this.highScoreLabel) {
            this.highScoreLabel.setText(`High Score: ${newHighScore}`)
        }
    }
}
