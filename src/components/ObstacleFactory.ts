import { GAME_CONFIG } from '../config/GameConfig'
import { GameObject } from '../core/GameObject'
import { IScene, IGameObject } from '../types/interface'
import { MathUtils } from '../utils/MathUtils'
import { Vector2 } from '../utils/Vector2'
import { Collider } from './Collider'
import { MovingObstacle } from './MovingObstacle'
import { Renderer } from './Renderer'
import { StaticObstacle } from './StaticObstacle'

export class ObstacleFactory {
    private scene: IScene

    constructor(scene: IScene) {
        this.scene = scene
    }

    private createStaticObstacle(position: Vector2, type: StaticType): IGameObject {
        const staticTypeMap = {
            cactus: 'CACTUS',
            spike: 'SPIKE',
            rock: 'ROCK',
        } as const
        const config = GAME_CONFIG.OBSTACLES[staticTypeMap[type]]
        const size = { width: config.WIDTH, height: config.HEIGHT }
        const obstacleGO = new GameObject({
            name: `${type}_${Date.now()}`,
            tag: 'Obstacle',
            layer: 2,
            position,
        })
        obstacleGO.addComponent(new Renderer(obstacleGO))
        obstacleGO.addComponent(Collider.createBox(obstacleGO, size.width, size.height))
        obstacleGO.addComponent(new StaticObstacle(obstacleGO, type))
        this.scene.addGameObject(obstacleGO)
        return obstacleGO
    }

    public createCactus(position: Vector2): IGameObject {
        return this.createStaticObstacle(position, 'cactus')
    }
    public createSpike(position: Vector2): IGameObject {
        return this.createStaticObstacle(position, 'spike')
    }
    public createRock(position: Vector2): IGameObject {
        return this.createStaticObstacle(position, 'rock')
    }
    private createMovingObstacle(
        position: Vector2,
        type: MovingType,
        pattern: MovingPattern | undefined,
        size: { width: number; height: number }
    ): IGameObject {
        const obstacleGO = new GameObject({
            name: `${type}_${Date.now()}`,
            tag: 'Obstacle',
            layer: 2,
            position,
        })
        obstacleGO.addComponent(new Renderer(obstacleGO))
        obstacleGO.addComponent(Collider.createBox(obstacleGO, size.width, size.height))
        obstacleGO.addComponent(new MovingObstacle(obstacleGO, type, pattern))
        this.scene.addGameObject(obstacleGO)
        return obstacleGO
    }

    public createBird(position: Vector2, pattern: BirdPattern = 'horizontal'): IGameObject {
        return this.createMovingObstacle(position, 'bird', pattern, {
            width: GAME_CONFIG.OBSTACLES.BIRD.WIDTH,
            height: GAME_CONFIG.OBSTACLES.BIRD.HEIGHT,
        })
    }
    public createCloud(position: Vector2, pattern: CloudPattern = 'horizontal'): IGameObject {
        return this.createMovingObstacle(position, 'cloud', pattern, {
            width: 60,
            height: 30,
        })
    }
    public createUfo(position: Vector2, pattern: UfoPattern = 'circular'): IGameObject {
        return this.createMovingObstacle(position, 'ufo', pattern, {
            width: 40,
            height: 20,
        })
    }

    public createRandomObstacle(position: Vector2): IGameObject {
        const obstacleTypes = [
            {
                type: 'static',
                subtype: 'cactus',
                chance: GAME_CONFIG.OBSTACLES.CACTUS.SPAWN_CHANCE,
            },
            { type: 'static', subtype: 'spike', chance: GAME_CONFIG.OBSTACLES.SPIKE.SPAWN_CHANCE },
            { type: 'static', subtype: 'rock', chance: GAME_CONFIG.OBSTACLES.ROCK.SPAWN_CHANCE },
            { type: 'moving', subtype: 'bird', chance: GAME_CONFIG.OBSTACLES.BIRD.SPAWN_CHANCE },
            { type: 'moving', subtype: 'cloud', chance: GAME_CONFIG.OBSTACLES.CLOUD.SPAWN_CHANCE },
            { type: 'moving', subtype: 'ufo', chance: GAME_CONFIG.OBSTACLES.UFO.SPAWN_CHANCE },
        ] as const

        const randomValue = MathUtils.random(0, 1)
        let cumulativeChance = 0

        for (const obstacle of obstacleTypes) {
            cumulativeChance += obstacle.chance
            if (randomValue <= cumulativeChance) {
                if (obstacle.type === 'static') {
                    return this.createStaticObstacle(position, obstacle.subtype)
                } else {
                    if (obstacle.subtype === 'bird') {
                        const patterns: BirdPattern[] = ['horizontal', 'circular', 'zigzag']
                        const randomPattern = MathUtils.randomChoice(patterns)
                        return this.createBird(position, randomPattern)
                    }
                    if (obstacle.subtype === 'cloud') {
                        const patterns: CloudPattern[] = ['horizontal', 'circular']
                        const randomPattern = MathUtils.randomChoice(patterns)
                        return this.createCloud(position, randomPattern)
                    }
                    if (obstacle.subtype === 'ufo') {
                        const patterns: UfoPattern[] = ['circular', 'zigzag']
                        const randomPattern = MathUtils.randomChoice(patterns)
                        return this.createUfo(position, randomPattern)
                    }
                }
                break
            }
        }
        return this.createCactus(position)
    }
}
