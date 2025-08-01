import { Transform } from '../../../components/Transform'
import { CONFIG } from '../../../config/Config'
import { IGameObject, ComponentConstructor } from '../../../types/interface'
import { MathUtils } from '../../../utils/MathUtils'
import { Vector2 } from '../../../utils/Vector2'
import { ScoreManager } from '../../game_manager/ScoreManager'
import { Platform } from './Platform'

export class MovingPlatform extends Platform {
    private moveSpeed = 50
    private moveDirection = MathUtils.randomSign()
    private transform!: Transform | null

    constructor(gameObject: IGameObject) {
        super(gameObject)
        this.transform = this.gameObject.getComponent(Transform as ComponentConstructor<Transform>)
        this.setPlatformType('moving')
    }

    update(deltaTime: number): void {
        super.update(deltaTime)
        if (this.transform) {
            const pos = this.transform.getWorldPosition()
            const newX =
                pos.x +
                this.moveDirection *
                    this.moveSpeed *
                    (deltaTime / 1000) *
                    ScoreManager.getCurrentDifficultyLevel()

            if (newX < 50 || newX > CONFIG.CANVAS.WIDTH - 50) {
                this.moveDirection *= -1
            }

            this.transform.setPosition(
                new Vector2(Math.max(50, Math.min(CONFIG.CANVAS.WIDTH - 50, newX)), pos.y)
            )
        }
    }
}
