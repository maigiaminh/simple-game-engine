import { Renderer } from '../../components/Renderer'
import { CONFIG } from '../../config/Config'
import { IGameObject, ComponentConstructor } from '../../types/interface'
import { Color } from '../../utils/Color'
import { Obstacle } from './Obstacle'

export class StaticObstacle extends Obstacle {
    protected staticType: StaticType

    constructor(gameObject: IGameObject, staticType: StaticType) {
        super(gameObject, `static_${staticType}`)
        this.staticType = staticType
    }

    protected setupRenderer(): void {
        const renderer = this.gameObject.getComponent(Renderer as ComponentConstructor<Renderer>)
        if (renderer) {
            switch (this.staticType) {
                case 'cactus':
                    renderer.setColor(Color.DARK_GREEN)
                    break
                case 'landed_spike':
                    renderer.setColor(Color.GRAY)
                    break
                case 'rock':
                    renderer.setColor(Color.BROWN)
                    break
            }
        }
    }

    protected setupObstacleSpecific(): void {}

    protected updateObstacle(deltaTime: number): void {
        this.updateIdleAnimation(deltaTime)
    }

    private updateIdleAnimation(deltaTime: number): void {
        if (this.staticType === 'cactus') {
            const renderer = this.gameObject.getComponent(
                Renderer as ComponentConstructor<Renderer>
            )
            if (renderer) {
                const time = Date.now() * 0.001
                const pulse = Math.sin(time) * 0.1 + 0.9
                const color = new Color(
                    Color.DARK_GREEN.r * pulse,
                    Color.DARK_GREEN.g,
                    Color.DARK_GREEN.b,
                    Color.DARK_GREEN.a
                )
                renderer.setColor(color)
            }
        }
    }

    protected checkBounds(): void {
        const position = this.gameObject.getPosition()
        if (position.y > CONFIG.CANVAS.HEIGHT + 500) {
            this.deactivate()
        }
    }

    public getStaticType(): StaticType {
        return this.staticType
    }
}
