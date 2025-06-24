import { UILabel } from '../../components/UILabel'
import { Component } from '../../core/Component'
import { GameEngine } from '../../core/GameEngine'
import { GameObject } from '../../core/GameObject'
import { UIAnchor } from '../../types/enums'
import { IGameObject } from '../../types/interface'
import { Color } from '../../utils/Color'
import { Vector2 } from '../../utils/Vector2'

export class ScoreManager extends Component {
    private currentScore = 0
    private highScore = 0
    private baselineY = 0

    private scoreLabel: UILabel | null = null
    private highScoreLabel: UILabel | null = null

    private player: IGameObject | null = null

    constructor(gameObject: IGameObject) {
        super(gameObject)
        this.loadHighScore()
    }

    public onStart(): void {
        this.createScoreUI()
    }

    public setPlayer(player: IGameObject): void {
        this.player = player
        this.baselineY = player.getPosition().y
    }

    public update(deltaTime: number): void {
        this.updateScore()
        this.updateUI()
    }

    private createScoreUI(): void {
        const scoreLabelGO = new GameObject({
            name: 'ScoreLabel',
            position: new Vector2(100, -300),
        })

        this.scoreLabel = new UILabel(scoreLabelGO, 'Score: 0')
        this.scoreLabel.setCanvas(GameEngine.getInstance().getCanvas())
        this.scoreLabel.setFont('24px Arial')
        this.scoreLabel.setColor(Color.WHITE)
        this.scoreLabel.setAnchor(UIAnchor.TOP_LEFT)
        this.scoreLabel.size = new Vector2(200, 40)
        this.scoreLabel.margin = { top: 20, left: 20, bottom: 0, right: 0 }
        scoreLabelGO.addComponent(this.scoreLabel)

        const highScoreLabelGO = new GameObject({
            name: 'HighScoreLabel',
            position: new Vector2(0, 0),
        })

        this.highScoreLabel = new UILabel(highScoreLabelGO, `High: ${this.highScore}`)
        this.highScoreLabel.setCanvas(GameEngine.getInstance().getCanvas())
        this.highScoreLabel.setFont('24px Arial')
        this.highScoreLabel.setColor(Color.YELLOW)
        this.highScoreLabel.setAnchor(UIAnchor.TOP_RIGHT)
        this.highScoreLabel.size = new Vector2(200, 40)
        this.highScoreLabel.margin = { top: 20, right: 20, bottom: 0, left: 0 }
        highScoreLabelGO.addComponent(this.highScoreLabel)
    }

    private updateScore(): void {
        if (!this.player) return

        const playerY = this.player.getPosition().y

        const heightScore = Math.max(0, Math.floor((this.baselineY - playerY) / 10))

        if (heightScore > this.currentScore) {
            this.currentScore = heightScore

            if (this.currentScore > this.highScore) {
                this.highScore = this.currentScore
                this.saveHighScore()
            }
        }
    }

    private updateUI(): void {
        if (this.scoreLabel) {
            this.scoreLabel.setText(`Score: ${this.currentScore}`)
        }

        if (this.highScoreLabel) {
            this.highScoreLabel.setText(`High: ${this.highScore}`)
        }
    }

    public getCurrentScore(): number {
        return this.currentScore
    }

    public getHighScore(): number {
        return this.highScore
    }

    public resetScore(): void {
        this.currentScore = 0
        if (this.player) {
            this.baselineY = this.player.getPosition().y
        }
    }

    public addBonusScore(bonus: number): void {
        this.currentScore += bonus

        if (this.currentScore > this.highScore) {
            this.highScore = this.currentScore
            this.saveHighScore()
        }
    }

    private loadHighScore(): void {
        try {
            const saved = localStorage.getItem('doodleJump_highScore')
            this.highScore = saved ? parseInt(saved, 10) : 0
        } catch (error) {
            console.warn('Could not load high score:', error)
            this.highScore = 0
        }
    }

    private saveHighScore(): void {
        try {
            localStorage.setItem('doodleJump_highScore', this.highScore.toString())
        } catch (error) {
            console.warn('Could not save high score:', error)
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        this.scoreLabel?.render(ctx)
        this.highScoreLabel?.render(ctx)
    }
}
