import { IGameObject } from '../../types/interface'

export interface IWorldObject {
    gameObject: IGameObject
    initialY: number
    isActive: boolean
    type: 'platform' | 'obstacle' | 'decoration'
    cleanup(): void
}

export interface GameStats {
    score: number
    highScore: number
    height: number
    platformsGenerated: number
    obstaclesDestroyed: number
    timeAlive: number
    difficulty: number
    platformsJumped: number
}
