import { Renderer } from '../../components/Renderer'
import { Component } from '../../core/Component'
import { IGameObject, ComponentConstructor } from '../../types/interface'
import { Color } from '../../utils/Color'

export class Platform extends Component {
    private hasObstacle = false

    constructor(gameObject: IGameObject) {
        super(gameObject)
    }

    public onAwake(): void {
        const renderer = this.gameObject.getComponent(Renderer as ComponentConstructor<Renderer>)
        if (renderer) {
            renderer.setColor(Color.GREEN)
        }
    }

    public setHasObstacle(hasObstacle: boolean): void {
        this.hasObstacle = hasObstacle
    }

    public getHasObstacle(): boolean {
        return this.hasObstacle
    }

    public update(deltaTime: number): void {}

    public render(ctx: CanvasRenderingContext2D): void {}
}
