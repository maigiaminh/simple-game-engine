import { AnimatedRenderer } from '../../../components/AnimatedRenderer'
import { Collider } from '../../../components/Collider'
import { RigidBody } from '../../../components/RigidBody'
import { CONFIG } from '../../../config/Config'
import { Component } from '../../../core/Component'
import { GameEngine } from '../../../core/GameEngine'
import { GameObject } from '../../../core/GameObject'
import type { Scene } from '../../../core/Scene'
import { ColliderType, CollisionLayer } from '../../../types/enums'
import { ComponentConstructor } from '../../../types/interface'
import { Vector2 } from '../../../utils/Vector2'
import { GAME_CONFIG } from '../../config/GameplayConfig'

export class Projectile extends Component {
    public render(ctx: CanvasRenderingContext2D): void {
        //
    }
    private gameEngine: GameEngine
    private scene: Scene | null = null
    private speed = 1500

    constructor(gameObject: GameObject) {
        super(gameObject)
        this.onAwake()
    }

    public onAwake(): void {
        this.gameEngine = GameEngine.getInstance()
        this.scene = this.gameEngine.getCurrentScene()
        const animatedRenderer = new AnimatedRenderer(this.gameObject)
        animatedRenderer.addAnimation(
            GAME_CONFIG.ANIMATIONS.PROJECTILE.Name,
            GAME_CONFIG.ANIMATIONS.PROJECTILE.Frames,
            this.gameEngine,
            GAME_CONFIG.ANIMATIONS.PROJECTILE.FrameRate,
            GAME_CONFIG.ANIMATIONS.PROJECTILE.Loop
        )

        const collider = new Collider(this.gameObject)
        collider.setColliderSize(animatedRenderer.getWidth(), animatedRenderer.getHeight())
        collider.setColliderType(ColliderType.BOX)
        collider.layers = [CollisionLayer.PLAYER]
        collider.mask = [CollisionLayer.ENVIRONMENT]
        collider.isTrigger = true
        this.gameObject.addComponent(collider)
        this.gameObject.addComponent(animatedRenderer)
        animatedRenderer.playAnimation(GAME_CONFIG.ANIMATIONS.PROJECTILE.Name)

        const rigidBody = new RigidBody(this.gameObject)
        rigidBody.useGravity = false
        rigidBody.setVelocity(new Vector2(0, -this.speed))
        this.gameObject.addComponent(rigidBody)
        if (this.scene) {
            this.scene.addGameObject(this.gameObject)
        }
        this.gameEngine.getCollisionManager().addCollider(collider)
    }

    public update(deltaTime: number): void {
        const pos = this.gameObject.getPosition()
        if (this.scene) {
            const mainCamera = this.scene.getMainCamera()
            if (
                mainCamera &&
                pos.y < mainCamera.getGameObject().getPosition().y - CONFIG.CANVAS.HEIGHT / 2
            ) {
                this.deactivate()
            }
        }
    }

    public deactivate(): void {
        const collider = this.gameObject.getComponent(Collider as ComponentConstructor<Collider>)
        if (collider && GameEngine.getInstance()) {
            GameEngine.getInstance().getCollisionManager().removeCollider(collider)
        }
        if (this.scene) {
            this.scene.removeGameObject(this.gameObject)
        }
        this.gameObject.destroy()
    }
}
