import { Component } from '../core/Component';
import { GameObject } from '../core/GameObject';
import { Transform } from './Transform';
import { Collider } from './Collider';
import { Renderer } from './Renderer';
import { ComponentConstructor, IGameObject, IScene } from '../types/interface';
import { ColliderType, CollisionLayer } from '../types/enums';
import { Vector2 } from '../utils/Vector2';
import { Color } from '../utils/Color';
import { MathUtils } from '../utils/MathUtils';
import { GAME_CONFIG } from '../config/GameConfig';

export class Platform extends Component {
    private hasObstacle: boolean = false;

    constructor(gameObject: IGameObject) {
        super(gameObject);
    }

    public onAwake(): void {
        const renderer = this.gameObject.getComponent(Renderer as ComponentConstructor<Renderer>);
        if (renderer) {
            renderer.setColor(Color.GREEN);
        }
    }

    public setHasObstacle(hasObstacle: boolean): void {
        this.hasObstacle = hasObstacle;
    }

    public getHasObstacle(): boolean {
        return this.hasObstacle;
    }

    public update(deltaTime: number): void { }

    public render(ctx: CanvasRenderingContext2D): void { }
}