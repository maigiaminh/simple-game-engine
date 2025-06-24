import { Component } from '../../core/Component'
import { IGameObject } from '../../types/interface'
import { MouseButton } from '../../types/enums'
import { InputManager } from '../../systems/InputManager'
import { CONFIG, KEY } from '../../config/Config'
import { Player } from '../components/Player'

export class GameInput extends Component {
    private inputManager: InputManager
    private player: Player | null = null

    private leftPressed = false
    private rightPressed = false
    private jumpPressed = false

    private isTouching = false

    constructor(gameObject: IGameObject, inputManager: InputManager) {
        super(gameObject)
        this.inputManager = inputManager
        this.setupTouchEvents()
    }

    public setPlayer(player: Player): void {
        this.player = player
    }

    public update(deltaTime: number): void {
        this.handleKeyboardInput()
        this.handleMouseInput()
        this.handleTouchInput()
        this.sendInputToPlayer()
    }

    private handleKeyboardInput(): void {
        this.leftPressed =
            this.inputManager.isKeyPressed(KEY.LEFT) || this.inputManager.isKeyPressed(KEY.A)

        this.rightPressed =
            this.inputManager.isKeyPressed(KEY.RIGHT) || this.inputManager.isKeyPressed(KEY.D)

        this.jumpPressed =
            this.inputManager.isKeyPressed(KEY.SPACE) ||
            this.inputManager.isKeyPressed(KEY.UP) ||
            this.inputManager.isKeyPressed(KEY.W)
    }

    private handleMouseInput(): void {
        if (this.inputManager.isMouseButtonPressed(MouseButton.LEFT)) {
            const mousePos = this.inputManager.getMousePosition()
            const canvasWidth = CONFIG.CANVAS.WIDTH

            if (mousePos.x < canvasWidth / 3) {
                this.leftPressed = true
            } else if (mousePos.x > (canvasWidth * 2) / 3) {
                this.rightPressed = true
            }

            this.jumpPressed = true
        }
    }

    private handleTouchInput(): void {
        const touches = this.inputManager.getTouches()

        if (touches.length > 0) {
            const touch = touches[0]
            const canvasWidth = CONFIG.CANVAS.WIDTH

            if (!this.isTouching) {
                this.isTouching = true
                this.jumpPressed = true
            } else {
                if (touch.position.x < canvasWidth / 3) {
                    this.leftPressed = true
                } else if (touch.position.x > (canvasWidth * 2) / 3) {
                    this.rightPressed = true
                }
            }
        } else {
            this.isTouching = false
        }
    }

    private setupTouchEvents(): void {
        const canvas = document.getElementById('game-canvas')
        if (canvas) {
            canvas.addEventListener('touchstart', (e) => e.preventDefault())
            canvas.addEventListener('touchmove', (e) => e.preventDefault())
            canvas.addEventListener('touchend', (e) => e.preventDefault())
        }
    }

    private sendInputToPlayer(): void {
        if (this.player) {
            this.player.setInput(this.leftPressed, this.rightPressed, this.jumpPressed)
        }

        this.resetInputStates()
    }

    private resetInputStates(): void {
        if (
            !this.inputManager.isKeyPressed(KEY.SPACE) &&
            !this.inputManager.isKeyPressed(KEY.UP) &&
            !this.inputManager.isKeyPressed(KEY.W) &&
            !this.inputManager.isMouseButtonPressed(MouseButton.LEFT) &&
            this.inputManager.getTouchCount() === 0
        ) {
            this.jumpPressed = false
        }

        if (
            !this.inputManager.isKeyPressed(KEY.LEFT) &&
            !this.inputManager.isKeyPressed(KEY.A) &&
            !this.inputManager.isMouseButtonPressed(MouseButton.LEFT) &&
            this.inputManager.getTouchCount() === 0
        ) {
            this.leftPressed = false
        }

        if (
            !this.inputManager.isKeyPressed(KEY.RIGHT) &&
            !this.inputManager.isKeyPressed(KEY.D) &&
            !this.inputManager.isMouseButtonPressed(MouseButton.LEFT) &&
            this.inputManager.getTouchCount() === 0
        ) {
            this.rightPressed = false
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        this.drawMobileInputGuide(ctx)
    }

    private drawMobileInputGuide(ctx: CanvasRenderingContext2D): void {
        if ('ontouchstart' in window) {
            ctx.save()
            ctx.globalAlpha = 0.3
            ctx.fillStyle = 'white'
            ctx.font = '16px Arial'
            ctx.textAlign = 'center'

            ctx.fillText('←', 166, 750)

            ctx.fillText('→', 833, 750)

            ctx.fillText('TAP TO JUMP', 500, 750)

            ctx.restore()
        }
    }
}
