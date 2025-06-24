import { Camera } from '../../components/Camera'
import { Renderer } from '../../components/Renderer'
import { Transform } from '../../components/Transform'
import { CONFIG } from '../../config/Config'
import { Component } from '../../core/Component'
import { GameEngine } from '../../core/GameEngine'
import { GameObject } from '../../core/GameObject'
import { ComponentConstructor, IGameObject, IScene } from '../../types/interface'
import { Color } from '../../utils/Color'
import { MathUtils } from '../../utils/MathUtils'
import { Vector2 } from '../../utils/Vector2'
import { Cloud } from '../components/Cloud'
import { GAME_CONFIG } from '../config/GameplayConfig'

export class BackgroundManager extends Component {
    private bgImage: HTMLImageElement
    private cloudImage: HTMLImageElement
    private clouds: IGameObject[] = []
    private scene!: IScene
    private camera: Camera | null = null
    constructor(gameObject: IGameObject, scene: IScene) {
        super(gameObject)
        this.scene = scene
    }

    public setCamera(camera: Camera): void {
        this.camera = camera
    }

    public onStart(): void {
        this.bgImage = GameEngine.getInstance()
            .getResourceManager()
            .getResource(GAME_CONFIG.IMAGES.BACKGROUND) as HTMLImageElement
        this.cloudImage = GameEngine.getInstance()
            .getResourceManager()
            .getResource(GAME_CONFIG.IMAGES.CLOUD) as HTMLImageElement
        this.generateClouds()
    }

    public update(deltaTime: number): void {
        this.updateClouds()
        this.manageClouds()
    }

    private generateClouds(): void {
        for (let i = 0; i < GAME_CONFIG.BACKGROUND.CLOUD.COUNT; i++) {
            this.createCloud(
                new Vector2(
                    MathUtils.random(0, CONFIG.CANVAS.WIDTH),
                    MathUtils.random(-500, CONFIG.CANVAS.HEIGHT)
                )
            )
        }
    }

    private createCloud(position: Vector2): IGameObject {
        const cloudGO = new GameObject({
            name: 'Cloud',
            tag: 'Background',
            layer: 1,
            position: position,
        })

        const renderer = new Renderer(cloudGO)
        renderer.setColor(new Color(255, 255, 255, 0.7))
        renderer.setImage(this.cloudImage)
        renderer.setImageSize(
            GAME_CONFIG.BACKGROUND.CLOUD.WIDTH,
            GAME_CONFIG.BACKGROUND.CLOUD.HEIGHT
        )
        cloudGO.addComponent(renderer)

        const cloud = new Cloud(cloudGO)
        cloudGO.addComponent(cloud)

        this.scene.addGameObject(cloudGO)
        this.clouds.push(cloudGO)

        return cloudGO
    }

    private updateClouds(): void {}

    private manageClouds(): void {
        if (!this.camera) return

        const cameraTransform = this.camera
            .getGameObject()
            .getComponent(Transform as ComponentConstructor<Transform>)
        if (!cameraTransform) return

        const cameraY = cameraTransform.getWorldPosition().y
        const viewTop = cameraY - CONFIG.CANVAS.HEIGHT / 2 - 200
        const viewBottom = cameraY + CONFIG.CANVAS.HEIGHT / 2 + 200

        this.clouds = this.clouds.filter((cloud) => {
            const pos = cloud.getPosition()
            if (pos.y > viewBottom + 300) {
                this.scene.removeGameObject(cloud)
                cloud.destroy()
                return false
            }
            return true
        })

        while (this.clouds.length < GAME_CONFIG.BACKGROUND.CLOUD.COUNT) {
            this.createCloud(
                new Vector2(
                    MathUtils.random(0, CONFIG.CANVAS.WIDTH),
                    viewTop - MathUtils.random(50, 200)
                )
            )
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        this.renderImageBackground(ctx)
    }

    private renderImageBackground(ctx: CanvasRenderingContext2D): void {
        if (!this.camera) return
        const cameraTransform = this.camera
            .getGameObject()
            .getComponent(Transform as ComponentConstructor<Transform>)
        if (!cameraTransform) return
        if (!this.bgImage) return

        const bgY = cameraTransform.getWorldPosition().y
        ctx.drawImage(
            this.bgImage,
            0,
            bgY - CONFIG.CANVAS.HEIGHT / 2,
            CONFIG.CANVAS.WIDTH,
            CONFIG.CANVAS.HEIGHT
        )
    }
}
