import { GameObject } from '../../../core/GameObject'
import { IGameObject } from '../../../types/interface'
import { Vector2 } from '../../../utils/Vector2'
import { Renderer } from '../../../components/Renderer'
import { GAME_CONFIG } from '../../config/GameplayConfig'
import { GameEngine } from '../../../core/GameEngine'
import { Collider } from '../../../components/Collider'
import { Trampoline } from './Trampoline'
import { ColliderType } from '../../../types/enums'
import { Jetpack } from './Jetpack'
import { MathUtils } from '../../../utils/MathUtils'

export class ItemFactory {
    private static createItems(position: Vector2, type: ItemType): IGameObject {
        const itemGO = new GameObject({
            name: `${type}_${Date.now()}`,
            tag: 'Item',
            layer: 2,
            position,
        })
        const renderer = new Renderer(itemGO)
        const collider = new Collider(itemGO)
        if (type === 'trampoline') {
            renderer.setImageSize(
                GAME_CONFIG.ITEMS.TRAMPOLINE.WIDTH,
                GAME_CONFIG.ITEMS.TRAMPOLINE.HEIGHT
            )
            const image = GameEngine.getInstance()
                .getResourceManager()
                .getResource(GAME_CONFIG.ITEMS.TRAMPOLINE.ICON) as HTMLImageElement
            renderer.setImage(image)
            collider.type = ColliderType.BOX
            collider.setRenderer(renderer)
            itemGO.addComponent(renderer)
            itemGO.addComponent(collider)
            const item = new Trampoline(itemGO)
            itemGO.addComponent(item)
        } else if (type === 'jetpack') {
            renderer.setImageSize(GAME_CONFIG.ITEMS.JETPACK.WIDTH, GAME_CONFIG.ITEMS.JETPACK.HEIGHT)
            const image = GameEngine.getInstance()
                .getResourceManager()
                .getResource(GAME_CONFIG.ITEMS.JETPACK.ICON) as HTMLImageElement
            renderer.setImage(image)
            collider.type = ColliderType.BOX
            collider.setRenderer(renderer)
            itemGO.addComponent(renderer)
            itemGO.addComponent(collider)

            const item = new Jetpack(itemGO)
            itemGO.addComponent(item)
        }

        GameEngine.getInstance().getCollisionManager().addCollider(collider)
        const currentScene = GameEngine.getInstance().getCurrentScene()
        if (currentScene) {
            currentScene.addGameObject(itemGO)
        }
        return itemGO
    }

    public static createTrampoline(position: Vector2): IGameObject {
        return this.createItems(position, 'trampoline')
    }

    public static createJetpack(position: Vector2): IGameObject {
        return this.createItems(position, 'jetpack')
    }

    public static createRandomItem(position: Vector2): IGameObject {
        const chances = [
            { type: 'trampoline', chance: GAME_CONFIG.ITEMS.TRAMPOLINE.SPAWN_CHANCE },
            { type: 'jetpack', chance: GAME_CONFIG.ITEMS.JETPACK.SPAWN_CHANCE },
        ] as { type: ItemType; chance: number }[]

        const total = chances.reduce((sum, item) => sum + item.chance, 0)
        let rand = MathUtils.random() * total

        for (const item of chances) {
            if (rand < item.chance) {
                return this.createItems(position, item.type)
            }
            rand -= item.chance
        }

        return this.createItems(position, 'trampoline')
    }
}
