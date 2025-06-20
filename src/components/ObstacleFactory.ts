import { GAME_CONFIG } from "../config/GameConfig";
import { GameObject } from "../core/GameObject";
import { IScene, IGameObject } from "../types/interface";
import { MathUtils } from "../utils/MathUtils";
import { Vector2 } from "../utils/Vector2";
import { Collider } from "./Collider";
import { MovingObstacle } from "./MovingObstacle";
import { Renderer } from "./Renderer";
import { StaticObstacle } from "./StaticObstacle";

export class ObstacleFactory {
    private scene: IScene;

    constructor(scene: IScene) {
        this.scene = scene;
    }

    public createCactus(position: Vector2): IGameObject {
        return this.createStaticObstacle(position, 'cactus', {
            width: GAME_CONFIG.OBSTACLES.CACTUS.WIDTH,
            height: GAME_CONFIG.OBSTACLES.CACTUS.HEIGHT
        });
    }

    public createSpike(position: Vector2): IGameObject {
        return this.createStaticObstacle(position, 'spike', {
            width: GAME_CONFIG.OBSTACLES.SPIKE.WIDTH,
            height: GAME_CONFIG.OBSTACLES.SPIKE.HEIGHT
        });
    }

    public createRock(position: Vector2): IGameObject {
        return this.createStaticObstacle(position, 'rock', {
            width: GAME_CONFIG.OBSTACLES.ROCK.WIDTH,
            height: GAME_CONFIG.OBSTACLES.ROCK.HEIGHT
        });
    }

    private createStaticObstacle(
        position: Vector2, 
        type: 'cactus' | 'spike' | 'rock',
        size: { width: number, height: number }
    ): IGameObject {
        const obstacleGO = new GameObject({
            name: `${type}_${Date.now()}`,
            tag: 'Obstacle',
            layer: 2,
            position: position
        });

        const renderer = new Renderer(obstacleGO);
        obstacleGO.addComponent(renderer);

        const collider = Collider.createBox(obstacleGO, size.width, size.height);
        obstacleGO.addComponent(collider);

        const obstacle = new StaticObstacle(obstacleGO, type);
        obstacleGO.addComponent(obstacle);

        this.scene.addGameObject(obstacleGO);
        console.log('scene:', this.scene.getAllGameObjects());
        return obstacleGO;
    }

    public createBird(position: Vector2, pattern: 'horizontal' | 'circular' | 'zigzag' = 'horizontal'): IGameObject {
        return this.createMovingObstacle(position, 'bird', pattern, {
            width: GAME_CONFIG.OBSTACLES.BIRD.WIDTH,
            height: GAME_CONFIG.OBSTACLES.BIRD.HEIGHT
        });
    }

    public createCloud(position: Vector2, pattern: 'horizontal' | 'circular' = 'horizontal'): IGameObject {
        return this.createMovingObstacle(position, 'cloud', pattern, {
            width: 60,
            height: 30
        });
    }

    public createUfo(position: Vector2, pattern: 'circular' | 'zigzag' = 'circular'): IGameObject {
        return this.createMovingObstacle(position, 'ufo', pattern, {
            width: 40,
            height: 20
        });
    }

    private createMovingObstacle(
        position: Vector2,
        type: 'bird' | 'cloud' | 'ufo',
        pattern: 'horizontal' | 'circular' | 'zigzag' | 'vertical',
        size: { width: number, height: number }
    ): IGameObject {
        const obstacleGO = new GameObject({
            name: `${type}_${Date.now()}`,
            tag: 'Obstacle',
            layer: 2,
            position: position
        });

        const renderer = new Renderer(obstacleGO);
        obstacleGO.addComponent(renderer);

        const collider = Collider.createBox(obstacleGO, size.width, size.height);
        obstacleGO.addComponent(collider);

        const obstacle = new MovingObstacle(obstacleGO, type, pattern);
        obstacleGO.addComponent(obstacle);

        this.scene.addGameObject(obstacleGO);
        return obstacleGO;
    }

    public createRandomObstacle(position: Vector2): IGameObject {
        const obstacleTypes = [
            { type: 'static', subtype: 'cactus', chance: GAME_CONFIG.OBSTACLES.CACTUS.SPAWN_CHANCE },
            { type: 'static', subtype: 'spike', chance: GAME_CONFIG.OBSTACLES.SPIKE.SPAWN_CHANCE },
            { type: 'static', subtype: 'rock', chance: GAME_CONFIG.OBSTACLES.ROCK.SPAWN_CHANCE },
            { type: 'moving', subtype: 'bird', chance: GAME_CONFIG.OBSTACLES.BIRD.SPAWN_CHANCE },
            { type: 'moving', subtype: 'cloud', chance: GAME_CONFIG.OBSTACLES.CLOUD.SPAWN_CHANCE },
            { type: 'moving', subtype: 'ufo', chance: GAME_CONFIG.OBSTACLES.UFO.SPAWN_CHANCE }
        ];

        const randomValue = MathUtils.random(0, 1)
        let cumulativeChance = 0;

        for (const obstacle of obstacleTypes) {
            cumulativeChance += obstacle.chance;
            if (randomValue <= cumulativeChance) {
                if (obstacle.type === 'static') {
                    switch (obstacle.subtype) {
                        case 'cactus': return this.createCactus(position);
                        case 'spike': return this.createSpike(position);
                        case 'rock': return this.createRock(position);
                    }
                } else {
                    const patterns = ['horizontal', 'circular', 'zigzag'];
                    const randomPattern = MathUtils.randomChoice(patterns);

                    switch (obstacle.subtype) {
                        case 'bird':
                            return this.createBird(position, randomPattern as 'horizontal' | 'circular' | 'zigzag');
                        case 'cloud':
                            return this.createCloud(position, randomPattern as 'horizontal' | 'circular');
                        case 'ufo':
                            return this.createUfo(position, randomPattern as 'circular' | 'zigzag');
                    }
                }
                break;
            }
        }

        return this.createCactus(position);
    }
}