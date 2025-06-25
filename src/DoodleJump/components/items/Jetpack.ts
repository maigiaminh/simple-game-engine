import { IGameObject, ComponentConstructor } from '../../../types/interface'
import { Player } from '../Player'
import { Items } from './Items'

export class Jetpack extends Items {
    protected updateItem(deltaTime: number): void {}
    constructor(gameObject: IGameObject) {
        super(gameObject, 'jetpack')
    }

    protected setupRenderer(): void {}

    protected setupItemSpecific(): void {}

    public onPlayerHit(player: IGameObject): void {
        super.onPlayerHit(player)
        const playerComp = player.getComponent(Player as ComponentConstructor<Player>)
        if (playerComp) {
            playerComp.setUsingJetpack(true)
        }
    }
}
