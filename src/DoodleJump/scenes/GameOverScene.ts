import { UIButton } from '../../components/UIButton'
import { UILabel } from '../../components/UILabel'
import { UIPanel } from '../../components/UIPanel'
import { CONFIG, KEY } from '../../config/Config'
import { GameEngine } from '../../core/GameEngine'
import { GameObject } from '../../core/GameObject'
import { Scene } from '../../core/Scene'
import { UIAnchor } from '../../types/enums'
import { Color } from '../../utils/Color'
import { Vector2 } from '../../utils/Vector2'

export class GameOverScene extends Scene {
    private gameEngine!: GameEngine
    private finalScore = 0
    private highScore = 0
    private isNewHighScore = false

    private backgroundPanel!: UIPanel
    private gameOverLabel!: UILabel
    private scoreLabel!: UILabel
    private highScoreLabel!: UILabel
    private newRecordLabel!: UILabel
    private restartButton!: UIButton
    private menuButton!: UIButton

    constructor(name = 'GameOverScene') {
        super(name)
    }

    protected async onLoad(): Promise<void> {
        console.log('Loading Game Over Scene...')
        this.gameEngine = GameEngine.getInstance()
        this.loadScores()

        await this.createUI()

        this.setupInput()

        console.log('Game Over Scene loaded successfully!')
    }

    protected async onUnload(): Promise<void> {
        console.log('Unloading Game Over Scene...')
    }

    private loadScores(): void {
        try {
            const savedHighScore = localStorage.getItem('doodleJump_highScore')
            this.highScore = savedHighScore ? parseInt(savedHighScore, 10) : 0

            this.finalScore = Math.floor(Math.random() * 1000)

            this.isNewHighScore = this.finalScore > this.highScore
            if (this.isNewHighScore) {
                this.highScore = this.finalScore
                localStorage.setItem('doodleJump_highScore', this.highScore.toString())
            }
        } catch (error) {
            console.warn('Error loading scores:', error)
            this.finalScore = 0
            this.highScore = 0
        }
    }

    private async createUI(): Promise<void> {
        await this.createBackgroundPanel()

        await this.createLabels()

        await this.createButtons()

        this.addUIToManager()
    }

    private async createBackgroundPanel(): Promise<void> {
        const panelGO = new GameObject({
            name: 'GameOverPanel',
            position: new Vector2(0, 0),
        })

        this.backgroundPanel = new UIPanel(panelGO)
        this.backgroundPanel.setAnchor(UIAnchor.MIDDLE_CENTER)
        this.backgroundPanel.size = new Vector2(CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT)
        this.backgroundPanel.setBackgroundColor(new Color(200, 200, 200, 0))
        this.backgroundPanel.setBorderColor(Color.WHITE)
        this.backgroundPanel.setBorderWidth(3)
        this.backgroundPanel.setCornerRadius(20)
        this.backgroundPanel.setCanvas(this.gameEngine.getCanvas())
        panelGO.addComponent(this.backgroundPanel)

        this.addGameObject(panelGO)
    }

    private async createLabels(): Promise<void> {
        const gameOverGO = new GameObject({
            name: 'GameOverTitle',
            position: new Vector2(CONFIG.CANVAS.WIDTH / 2 - 150, 100),
        })

        this.gameOverLabel = new UILabel(gameOverGO, 'GAME OVER')
        this.gameOverLabel.setFont('48px Arial')
        this.gameOverLabel.setColor(Color.RED)
        this.gameOverLabel.size = new Vector2(400, 60)
        gameOverGO.addComponent(this.gameOverLabel)
        this.backgroundPanel.addChild(this.gameOverLabel)

        const scoreGO = new GameObject({
            name: 'ScoreLabel',
            position: new Vector2(200, 200),
        })

        this.scoreLabel = new UILabel(scoreGO, `Score: ${this.finalScore}`)
        this.scoreLabel.setFont('32px Arial')
        this.scoreLabel.setColor(Color.WHITE)
        this.scoreLabel.setTextAlign('center')
        this.scoreLabel.size = new Vector2(300, 40)
        scoreGO.addComponent(this.scoreLabel)
        this.backgroundPanel.addChild(this.scoreLabel)

        const highScoreGO = new GameObject({
            name: 'HighScoreLabel',
            position: new Vector2(200, 300),
        })

        this.highScoreLabel = new UILabel(highScoreGO, `High Score: ${this.highScore}`)
        this.highScoreLabel.setFont('24px Arial')
        this.highScoreLabel.setColor(Color.YELLOW)
        this.highScoreLabel.setTextAlign('center')
        this.highScoreLabel.size = new Vector2(300, 30)
        highScoreGO.addComponent(this.highScoreLabel)
        this.backgroundPanel.addChild(this.highScoreLabel)

        if (this.isNewHighScore) {
            const newRecordGO = new GameObject({
                name: 'NewRecordLabel',
                position: new Vector2(300, 400),
            })

            this.newRecordLabel = new UILabel(newRecordGO, '🎉 NEW RECORD! 🎉')
            this.newRecordLabel.setFont('20px Arial')
            this.newRecordLabel.setColor(Color.GOLD)
            this.newRecordLabel.setTextAlign('center')
            this.newRecordLabel.size = new Vector2(300, 25)
            newRecordGO.addComponent(this.newRecordLabel)
            this.backgroundPanel.addChild(this.newRecordLabel)
        }
    }

    private async createButtons(): Promise<void> {
        const restartGO = new GameObject({
            name: 'RestartButton',
            position: new Vector2(CONFIG.CANVAS.WIDTH / 2 - 250, CONFIG.CANVAS.HEIGHT / 2 + 50),
        })

        this.restartButton = new UIButton(restartGO, 'PLAY AGAIN')
        this.restartButton.size = new Vector2(200, 50)
        this.restartButton.setColors(Color.GREEN, Color.WHITE, Color.LIGHT_GREEN)
        this.restartButton.setOnClick(() => this.onRestartClick())
        restartGO.addComponent(this.restartButton)
        this.backgroundPanel.addChild(this.restartButton)

        const menuGO = new GameObject({
            name: 'MenuButton',
            position: new Vector2(CONFIG.CANVAS.WIDTH / 2 + 50, CONFIG.CANVAS.HEIGHT / 2 + 50),
        })

        this.menuButton = new UIButton(menuGO, 'MAIN MENU')
        this.menuButton.size = new Vector2(200, 50)
        this.menuButton.setColors(Color.GRAY, Color.WHITE, Color.LIGHT_GRAY)
        this.menuButton.setOnClick(() => this.onMenuClick())
        menuGO.addComponent(this.menuButton)
        this.backgroundPanel.addChild(this.menuButton)
    }

    private addUIToManager(): void {
        const uiManager = this.gameEngine.getUIManager()
        if (uiManager && this.backgroundPanel) {
            uiManager.addRootElement(this.backgroundPanel)
        }
    }

    private setupInput(): void {
        document.addEventListener('keydown', this.onKeyDown.bind(this))
    }

    private onKeyDown(event: KeyboardEvent): void {
        switch (event.code) {
            case KEY.SPACE:
            case KEY.ENTER:
                this.onRestartClick()
                break
            case KEY.ESCAPE:
                this.onMenuClick()
                break
        }
    }

    private onRestartClick(): void {
        console.log('Restart button clicked')
        this.gameEngine.setScene('GameplayScene')
    }

    private onMenuClick(): void {
        console.log('Menu button clicked')
        this.gameEngine.setScene('GameplayScene')
    }

    public setScores(finalScore: number, highScore: number): void {
        this.finalScore = finalScore
        this.highScore = highScore
        this.isNewHighScore = finalScore > highScore

        if (this.scoreLabel) {
            this.scoreLabel.setText(`Score: ${this.finalScore}`)
        }
        if (this.highScoreLabel) {
            this.highScoreLabel.setText(`High Score: ${this.highScore}`)
        }
    }

    protected onUpdate(deltaTime: number): void {
        const inputManager = this.gameEngine.getInputManager()

        if (inputManager.isKeyJustPressed(KEY.SPACE) || inputManager.isKeyJustPressed(KEY.ENTER)) {
            this.onRestartClick()
        }

        if (inputManager.isKeyJustPressed(KEY.ESCAPE)) {
            this.onMenuClick()
        }

        if (inputManager.isMouseButtonJustPressed()) {
            this.onRestartClick()
        }

        if (inputManager.getTouchCount() > 0) {
            this.onRestartClick()
        }
    }

    protected onRender(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
        ctx.fillRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT)

        const uiManager = this.gameEngine.getUIManager()
        if (uiManager) {
            uiManager.render(ctx)
        }

        if (this.isNewHighScore) {
            this.drawCelebrationEffect(ctx)
        }

        this.drawMobileInstructions(ctx)
    }

    private drawCelebrationEffect(ctx: CanvasRenderingContext2D): void {
        const time = Date.now() * 0.01
        ctx.save()

        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2 + time
            const radius = 100 + Math.sin(time + i) * 20
            const x = CONFIG.CANVAS.WIDTH / 2 + Math.cos(angle) * radius
            const y = CONFIG.CANVAS.HEIGHT / 2 + Math.sin(angle) * radius

            ctx.fillStyle = `hsl(${(time * 10 + i * 18) % 360}, 70%, 60%)`
            ctx.beginPath()
            ctx.arc(x, y, 5, 0, Math.PI * 2)
            ctx.fill()
        }

        ctx.restore()
    }

    private drawMobileInstructions(ctx: CanvasRenderingContext2D): void {
        if ('ontouchstart' in window) {
            ctx.save()
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
            ctx.font = '18px Arial'
            ctx.textAlign = 'center'
            ctx.fillText(
                'Tap anywhere to play again',
                CONFIG.CANVAS.WIDTH / 2,
                CONFIG.CANVAS.HEIGHT - 50
            )
            ctx.restore()
        } else {
            ctx.save()
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
            ctx.font = '16px Arial'
            ctx.textAlign = 'center'
            ctx.fillText(
                'Press SPACE or ENTER to play again, ESC for menu',
                CONFIG.CANVAS.WIDTH / 2,
                CONFIG.CANVAS.HEIGHT - 30
            )
            ctx.restore()
        }
    }
}
