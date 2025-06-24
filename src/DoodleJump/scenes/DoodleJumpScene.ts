import { Scene } from '../../core/Scene'
import { GameObject } from '../../core/GameObject'
import { Player } from '../components/Player'
import { Transform } from '../../components/Transform'
import { RigidBody } from '../../components/RigidBody'
import { Renderer } from '../../components/Renderer'
import { Collider } from '../../components/Collider'
import { CameraFollow } from '../../components/CameraFollow'
import { GameInput } from '../game_manager/GameInput'
import { GameEngine } from '../../core/GameEngine'
import { ScoreManager } from '../game_manager/ScoreManager'

export class DoodleJumpScene extends Scene {
    protected onUpdate(deltaTime: number): void {}
    protected onRender(ctx: CanvasRenderingContext2D): void {}
    protected onUnload(): Promise<void> {
        return Promise.resolve()
    }
    protected async onLoad(): Promise<void> {
        const playerGO = new GameObject({ name: 'Player', tag: 'Player', layer: 2 })
        playerGO.addComponent(new Transform(playerGO))
        const rigidBody = new RigidBody(playerGO)
        rigidBody.useGravity = false
        playerGO.addComponent(rigidBody)
        playerGO.addComponent(new Collider(playerGO))
        playerGO.addComponent(new Renderer(playerGO))
        const player = new Player(playerGO)
        playerGO.addComponent(player)
        this.addGameObject(playerGO)

        // const managerGO = new GameObject({ name: 'GameplayManager' })
        // const manager = new GameplayManager(managerGO, this, player, playerGO)
        // managerGO.addComponent(manager)
        // this.addGameObject(managerGO)

        const gameInputGO = new GameObject({ name: 'GameInput' })
        const gameInput = new GameInput(gameInputGO, GameEngine.getInstance().getInputManager())
        gameInput.setPlayer(player)
        gameInputGO.addComponent(gameInput)
        this.addGameObject(gameInputGO)

        const scoreManagerGO = new GameObject({ name: 'ScoreManager' })
        scoreManagerGO.addComponent(new ScoreManager(scoreManagerGO))
        this.addGameObject(scoreManagerGO)

        const cameraGO = new GameObject({ name: 'MainCamera' })
        cameraGO.addComponent(new Transform(cameraGO))
        const camera = new CameraFollow(cameraGO)
        camera.setTarget(playerGO)
        cameraGO.addComponent(camera)
        this.addGameObject(cameraGO)
        this.setMainCamera(camera)
    }
}
