import { IGameObject } from '../../../types/interface'
import { Obstacle } from './Obstacle'

export class StaticObstacle extends Obstacle {
    protected staticType: StaticType

    constructor(gameObject: IGameObject, staticType: StaticType) {
        super(gameObject, `static_${staticType}`)
        this.staticType = staticType
    }

    protected setupRenderer(): void {
        //
    }

    protected setupObstacleSpecific(): void {
        //
    }

    protected updateObstacle(deltaTime: number): void {
        //
    }

    protected checkBounds(): void {
        //
    }
}
