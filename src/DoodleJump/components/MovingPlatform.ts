import { CONFIG } from '../../config/Config'
import { ComponentConstructor, IGameObject } from '../../types/interface'
import { MathUtils } from '../../utils/MathUtils'
import { Vector2 } from '../../utils/Vector2'
import { Platform } from './Platform'
import { Transform } from '../../components/Transform'

export class MovingPlatform extends Platform {
    private moveSpeed = 80
    private moveDirection = MathUtils.randomSign()
    private transform!: Transform | null

    constructor(gameObject: IGameObject) {
        super(gameObject)
        this.transform = this.gameObject.getComponent(Transform as ComponentConstructor<Transform>)
    }

    update(deltaTime: number): void {
        super.update(deltaTime)
        if (this.transform) {
            const pos = this.transform.getWorldPosition()
            const newX = pos.x + this.moveDirection * this.moveSpeed * (deltaTime / 1000)

            if (newX < 50 || newX > CONFIG.CANVAS.WIDTH - 50) {
                this.moveDirection *= -1
            }

            this.transform.setPosition(
                new Vector2(Math.max(50, Math.min(CONFIG.CANVAS.WIDTH - 50, newX)), pos.y)
            )
        }
    }
}
