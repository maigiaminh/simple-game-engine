import { UIButton } from '../components/UIButton'
import { EventEmitter } from '../core/EventEmitter'
import { UIElement } from '../core/UIElement'
import { Vector2 } from '../utils/Vector2'

export class UIManager extends EventEmitter {
    private canvas: HTMLCanvasElement
    private rootElements: UIElement[] = []

    constructor(canvas: HTMLCanvasElement) {
        super()
        this.canvas = canvas
        this.setupEventListeners()
    }

    private setupEventListeners(): void {
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this))
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this))
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this))
    }

    public addRootElement(element: UIElement): void {
        element.setCanvas(this.canvas)
        this.rootElements.push(element)
    }

    public removeRootElement(element: UIElement): void {
        const index = this.rootElements.indexOf(element)
        if (index !== -1) {
            this.rootElements.splice(index, 1)
        }
    }

    public update(deltaTime: number): void {
        this.rootElements.forEach((element) => {
            if (element.isEnabled()) {
                element.update(deltaTime)
            }
        })
    }

    public render(ctx: CanvasRenderingContext2D): void {
        this.rootElements.forEach((element) => {
            if (element.isVisible()) {
                element.render(ctx)
            }
        })
    }

    private handleMouseMove(event: MouseEvent): void {
        const rect = this.canvas.getBoundingClientRect()
        const mousePos = new Vector2(event.clientX - rect.left, event.clientY - rect.top)

        this.processUIElements(this.rootElements, (element) => {
            if (element instanceof UIButton) {
                element.handleMouseMove(mousePos)
            }
        })
    }

    private handleMouseDown(event: MouseEvent): void {
        const rect = this.canvas.getBoundingClientRect()
        const mousePos = new Vector2(event.clientX - rect.left, event.clientY - rect.top)

        this.processUIElements(this.rootElements, (element) => {
            if (element instanceof UIButton) {
                element.handleMouseDown(mousePos)
            }
        })
    }

    private handleMouseUp(event: MouseEvent): void {
        const rect = this.canvas.getBoundingClientRect()
        const mousePos = new Vector2(event.clientX - rect.left, event.clientY - rect.top)

        this.processUIElements(this.rootElements, (element) => {
            if (element instanceof UIButton) {
                element.handleMouseUp(mousePos)
            }
        })
    }

    private processUIElements(elements: UIElement[], callback: (element: UIElement) => void): void {
        elements.forEach((element) => {
            callback(element as UIElement)
            this.processUIElements(element.getChildren(), callback)
        })
    }
}
