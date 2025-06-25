import { Renderer } from '../../components/Renderer'
import { Component } from '../../core/Component'
import { IGameObject, ComponentConstructor } from '../../types/interface'
import { Color } from '../../utils/Color'

export class Platform extends Component {
    private hasObject = false
    private type: PlatformType = 'normal'
    private object: IGameObject | null = null
    constructor(gameObject: IGameObject) {
        super(gameObject)
    }

    public onAwake(): void {
        const renderer = this.gameObject.getComponent(Renderer as ComponentConstructor<Renderer>)
        if (renderer) {
            renderer.setColor(Color.GREEN)
        }
    }

    public updateObjectStatus(hasObject: boolean): void {
        this.hasObject = hasObject
    }

    public containsObject(): boolean {
        return this.hasObject
    }

    public setObject(object: IGameObject | null): void {
        this.object = object
    }

    public getObject(): IGameObject | null {
        return this.object
    }

    public update(deltaTime: number): void {}

    public render(ctx: CanvasRenderingContext2D): void {}

    public getPlatformType(): PlatformType {
        return this.type
    }
}
