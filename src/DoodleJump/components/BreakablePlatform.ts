import { Renderer } from '../../components/Renderer'
import { RigidBody } from '../../components/RigidBody'
import { GameEngine } from '../../core/GameEngine'
import { ComponentConstructor, IGameObject } from '../../types/interface'
import { GAME_CONFIG } from '../config/GameplayConfig'
import { Platform } from './Platform'

export class BreakablePlatform extends Platform {
    private isBroken = false
    private breakableImg: HTMLImageElement
    private brokenImg: HTMLImageElement

    public constructor(gameObject: IGameObject) {
        super(gameObject)
        this.breakableImg = GameEngine.getInstance()
            .getResourceManager()
            .getResource(GAME_CONFIG.IMAGES.BREAKABLE_PLATFORM) as HTMLImageElement
        this.brokenImg = GameEngine.getInstance()
            .getResourceManager()
            .getResource(GAME_CONFIG.IMAGES.BROKEN_PLATFORM) as HTMLImageElement

        const renderer = this.gameObject.getComponent(Renderer as ComponentConstructor<Renderer>)
        if (renderer) {
            renderer.setImage(this.breakableImg)
        }
        const rigidBody = new RigidBody(this.gameObject, 1)
        rigidBody.useGravity = false
        rigidBody.isKinematic = true
        this.gameObject.addComponent(rigidBody)

        this.setPlatformType('breakable')
        this.gameObject.tag = 'breakable_platform'
    }

    public isPlatformBroken(): boolean {
        return this.isBroken
    }

    public breakPlatform(): void {
        if (this.isBroken) return
        this.isBroken = true
        const renderer = this.gameObject.getComponent(Renderer as ComponentConstructor<Renderer>)
        if (renderer) {
            renderer.setImage(this.brokenImg)
        }
        const rigidBody = this.gameObject.getComponent(RigidBody as ComponentConstructor<RigidBody>)
        if (rigidBody) {
            rigidBody.useGravity = true
            rigidBody.isKinematic = false
        }
    }
}
