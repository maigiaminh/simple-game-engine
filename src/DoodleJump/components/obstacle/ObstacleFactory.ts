import { Collider } from '../../../components/Collider'
import { Renderer } from '../../../components/Renderer'
import { GameEngine } from '../../../core/GameEngine'
import { GameObject } from '../../../core/GameObject'
import { ColliderType } from '../../../types/enums'
import { IGameObject } from '../../../types/interface'
import { MathUtils } from '../../../utils/MathUtils'
import { Vector2 } from '../../../utils/Vector2'
import { GAME_CONFIG } from '../../config/GameplayConfig'
import { ScoreManager } from '../../game_manager/ScoreManager'
import { MovingObstacle } from './MovingObstacle'
import { StaticObstacle } from './StaticObstacle'

export class ObstacleFactory {
    private static createStaticObstacle(position: Vector2, type: StaticType): IGameObject {
        const obstacle = new GameObject({
            name: `${type}_${Date.now()}`,
            tag: 'Item',
            layer: 2,
            position,
        })
        const renderer = new Renderer(obstacle)
        const collider = new Collider(obstacle)
        if (type === 'landed_spike') {
            obstacle.tag = 'landed_spike'
            renderer.setImageSize(
                GAME_CONFIG.OBSTACLES.LANDED_SPIKE.WIDTH,
                GAME_CONFIG.OBSTACLES.LANDED_SPIKE.HEIGHT
            )
            const image = GameEngine.getInstance()
                .getResourceManager()
                .getResource(GAME_CONFIG.OBSTACLES.LANDED_SPIKE.ICON) as HTMLImageElement
            renderer.setImage(image)
            collider.type = ColliderType.BOX
            collider.setRenderer(renderer)
            obstacle.addComponent(renderer)
            obstacle.addComponent(collider)
            const staticObstacle = new StaticObstacle(obstacle, type)
            obstacle.addComponent(staticObstacle)
        }

        GameEngine.getInstance().getCollisionManager().addCollider(collider)
        const currentScene = GameEngine.getInstance().getCurrentScene()
        if (currentScene) {
            currentScene.addGameObject(obstacle)
        }
        return obstacle
    }

    public static createLandedSpike(position: Vector2): IGameObject {
        return this.createStaticObstacle(position, 'landed_spike')
    }

    public static createRandomStaticObstacle(position: Vector2): IGameObject {
        const chances = [
            { type: 'landed_spike', chance: GAME_CONFIG.OBSTACLES.LANDED_SPIKE.SPAWN_CHANCE },
        ] as { type: StaticType; chance: number }[]

        const total = chances.reduce((sum, item) => sum + item.chance, 0)
        let rand = MathUtils.random() * total

        for (const item of chances) {
            if (rand < item.chance) {
                return this.createStaticObstacle(position, item.type)
            }
            rand -= item.chance
        }

        return this.createStaticObstacle(position, 'landed_spike')
    }

    private static createMovingObstacle(position: Vector2, type: MovingType): IGameObject {
        const obstacle = new GameObject({
            name: `${type}_${Date.now()}`,
            tag: 'Item',
            layer: 2,
            position,
        })
        const renderer = new Renderer(obstacle)
        const collider = new Collider(obstacle)
        if (type === 'witch') {
            renderer.setImageSize(
                GAME_CONFIG.OBSTACLES.WITCH.WIDTH,
                GAME_CONFIG.OBSTACLES.WITCH.HEIGHT
            )
            const image = GameEngine.getInstance()
                .getResourceManager()
                .getResource(GAME_CONFIG.OBSTACLES.WITCH.ICON) as HTMLImageElement
            renderer.setImage(image)
            collider.type = ColliderType.BOX
            collider.setRenderer(renderer)
            obstacle.addComponent(renderer)
            obstacle.addComponent(collider)
            const movingObstacle = new MovingObstacle(obstacle, type)
            obstacle.addComponent(movingObstacle)
        } else if (type === 'flying_monster') {
            renderer.setImageSize(
                GAME_CONFIG.OBSTACLES.FLYING_MONSTER.WIDTH,
                GAME_CONFIG.OBSTACLES.FLYING_MONSTER.HEIGHT
            )
            const image = GameEngine.getInstance()
                .getResourceManager()
                .getResource(GAME_CONFIG.OBSTACLES.FLYING_MONSTER.ICON) as HTMLImageElement
            renderer.setImage(image)
            collider.type = ColliderType.BOX
            collider.setRenderer(renderer)
            obstacle.addComponent(renderer)
            obstacle.addComponent(collider)
            const movingObstacle = new MovingObstacle(obstacle, type)
            obstacle.addComponent(movingObstacle)
        }

        GameEngine.getInstance().getCollisionManager().addCollider(collider)
        const currentScene = GameEngine.getInstance().getCurrentScene()
        if (currentScene) {
            currentScene.addGameObject(obstacle)
        }
        return obstacle
    }

    public static createWitch(position: Vector2): IGameObject {
        return this.createMovingObstacle(position, 'witch')
    }
    public static createFlyingMonster(position: Vector2): IGameObject {
        return this.createMovingObstacle(position, 'flying_monster')
    }

    public static createRandomMovingObstacle(position: Vector2): IGameObject {
        const chances = [
            { type: 'witch', chance: GAME_CONFIG.OBSTACLES.WITCH.SPAWN_CHANCE },
            { type: 'flying_monster', chance: GAME_CONFIG.OBSTACLES.FLYING_MONSTER.SPAWN_CHANCE },
        ] as { type: MovingType; chance: number }[]

        const total = chances.reduce((sum, item) => sum + item.chance, 0)
        let rand = MathUtils.random() * total

        for (const item of chances) {
            if (rand < item.chance) {
                return this.createMovingObstacle(position, item.type)
            }
            rand -= item.chance
        }

        return this.createMovingObstacle(position, 'witch')
    }

    public static createRandomObstacleByLevel(position: Vector2): IGameObject {
        const level = ScoreManager.getCurrentDifficultyLevel()
        const candidates: {
            type: StaticType | MovingType
            chance: number
            create: (pos: Vector2) => IGameObject
        }[] = []

        if (level >= GAME_CONFIG.OBSTACLES.LANDED_SPIKE.SPAWN_LEVEL) {
            candidates.push({
                type: 'landed_spike',
                chance: GAME_CONFIG.OBSTACLES.LANDED_SPIKE.SPAWN_CHANCE,
                create: (pos) => this.createLandedSpike(pos),
            })
        }

        if (level >= GAME_CONFIG.OBSTACLES.FLYING_MONSTER.SPAWN_LEVEL) {
            candidates.push({
                type: 'flying_monster',
                chance: GAME_CONFIG.OBSTACLES.FLYING_MONSTER.SPAWN_CHANCE,
                create: (pos) => this.createFlyingMonster(pos),
            })
        }
        if (level >= GAME_CONFIG.OBSTACLES.WITCH.SPAWN_LEVEL) {
            candidates.push({
                type: 'witch',
                chance: GAME_CONFIG.OBSTACLES.WITCH.SPAWN_CHANCE,
                create: (pos) => this.createWitch(pos),
            })
        }

        const total = candidates.reduce((sum, item) => sum + item.chance, 0)
        if (total === 0) {
            return this.createLandedSpike(position)
        }

        let rand = MathUtils.random() * total
        for (const item of candidates) {
            if (rand < item.chance) {
                return item.create(position)
            }
            rand -= item.chance
        }

        return this.createLandedSpike(position)
    }
}
