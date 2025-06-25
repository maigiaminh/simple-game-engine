import { RigidBody } from '../../../components/RigidBody'
import { GameEngine } from '../../../core/GameEngine'
import { IGameObject, ComponentConstructor } from '../../../types/interface'
import { GAME_CONFIG } from '../../config/GameplayConfig'
import { Items } from './Items'

export class Trampoline extends Items {
    protected updateItem(deltaTime: number): void {}
    constructor(gameObject: IGameObject) {
        super(gameObject, 'trampoline')
    }

    protected setupRenderer(): void {}

    protected setupItemSpecific(): void {}

    public onPlayerHit(player: IGameObject): void {
        super.onPlayerHit(player)
        const playerRigidbody = player.getComponent(RigidBody as ComponentConstructor<RigidBody>)
        if (playerRigidbody) {
            const newVelocity = playerRigidbody.velocity.clone()
            newVelocity.y = -GAME_CONFIG.ITEMS.TRAMPOLINE.BOUNCE_FORCE
            playerRigidbody.setVelocity(newVelocity)
            GameEngine.getInstance()
                .getAudioManager()
                .playSound(GAME_CONFIG.AUDIO.SFX.TRAMPOLINE, false)
        }
    }
}
