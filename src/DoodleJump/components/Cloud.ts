import { Transform } from '../../components/Transform'
import { CONFIG } from '../../config/Config'
import { Component } from '../../core/Component'
import { ComponentConstructor, IGameObject } from '../../types/interface'
import { MathUtils } from '../../utils/MathUtils'
import { Vector2 } from '../../utils/Vector2'
import { GAME_CONFIG } from '../config/GameplayConfig'

export class Cloud extends Component {
    private speed: number
    private direction: number

    constructor(gameObject: IGameObject, speed: number = GAME_CONFIG.BACKGROUND.CLOUD.MOVE_SPEED) {
        super(gameObject)
        this.speed = speed
        this.direction = MathUtils.randomSign()
    }

    public update(deltaTime: number): void {
        const transform = this.gameObject.getComponent(Transform as ComponentConstructor<Transform>)
        if (!transform) return

        const currentPos = transform.getWorldPosition()
        const newX = currentPos.x + this.direction * this.speed * (deltaTime / 1000)

        if (newX < -GAME_CONFIG.BACKGROUND.CLOUD.WIDTH) {
            transform.setPosition(
                new Vector2(CONFIG.CANVAS.WIDTH + GAME_CONFIG.BACKGROUND.CLOUD.WIDTH, currentPos.y)
            )
        } else if (newX > CONFIG.CANVAS.WIDTH + GAME_CONFIG.BACKGROUND.CLOUD.WIDTH) {
            transform.setPosition(new Vector2(-GAME_CONFIG.BACKGROUND.CLOUD.WIDTH, currentPos.y))
        } else {
            transform.setPosition(new Vector2(newX, currentPos.y))
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        //
    }
}
