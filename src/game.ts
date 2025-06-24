import { GameCore } from './core/GameCore'
import { Scene } from './core/Scene'
import { GAME_CONFIG } from './DoodleJump/config/GameplayConfig'
import { GameplayScene } from './DoodleJump/scenes/GameplayScene'

class SimpleScene extends Scene {
    protected async onLoad(): Promise<void> {
        console.log('SimpleScene loaded')
    }

    protected async onUnload(): Promise<void> {
        console.log('SimpleScene unloaded')
    }

    protected onUpdate(deltaTime: number): void {}

    protected onRender(ctx: CanvasRenderingContext2D): void {
        ctx.save()
        ctx.font = '32px Arial'
        ctx.fillStyle = '#fff'
        ctx.textAlign = 'center'
        ctx.fillText('Welcome to Simple Game Engine!', 500, 200)
        ctx.restore()
    }

    constructor() {
        super('MainScene')
    }
}

(async () => {
    await GameCore.start({
        width: 1000,
        height: 800,
        targetFPS: 60,
        scenes: [new GameplayScene('GameplayScene')],
        preloadAssets: {
            images: [
                {
                    name: GAME_CONFIG.IMAGES.BACKGROUND,
                    url: 'assets/images/background/background.jpg',
                },
                { name: GAME_CONFIG.IMAGES.CLOUD, url: 'assets/images/decoration/cloud.png' },
                {
                    name: GAME_CONFIG.IMAGES.PLATFORMS.GROUND,
                    url: 'assets/images/platform/ground.png',
                },
                {
                    name: GAME_CONFIG.IMAGES.PLATFORMS.PLATFORM_1,
                    url: 'assets/images/platform/platform_1.png',
                },
                {
                    name: GAME_CONFIG.IMAGES.PLATFORMS.PLATFORM_2,
                    url: 'assets/images/platform/platform_2.png',
                },
                {
                    name: GAME_CONFIG.IMAGES.PLAYERS.PLAYER_IDLE + '_1',
                    url: 'assets/images/player/idle/player_idle_1.png',
                },
                {
                    name: GAME_CONFIG.IMAGES.PLAYERS.PLAYER_IDLE + '_2',
                    url: 'assets/images/player/idle/player_idle_2.png',
                },
                {
                    name: GAME_CONFIG.IMAGES.PLAYERS.PLAYER_IDLE + '_3',
                    url: 'assets/images/player/idle/player_idle_3.png',
                },
                {
                    name: GAME_CONFIG.IMAGES.PLAYERS.PLAYER_IDLE + '_4',
                    url: 'assets/images/player/idle/player_idle_4.png',
                },

                {
                    name: GAME_CONFIG.IMAGES.PLAYERS.PLAYER_IDLE + '_5',
                    url: 'assets/images/player/idle/player_idle_5.png',
                },
                {
                    name: GAME_CONFIG.IMAGES.PLAYERS.PLAYER_IDLE + '_6',
                    url: 'assets/images/player/idle/player_idle_6.png',
                },
                {
                    name: GAME_CONFIG.IMAGES.PLAYERS.PLAYER_MOVE_LEFT + '_1',
                    url: 'assets/images/player/move_left/player_move_left_1.png',
                },
                {
                    name: GAME_CONFIG.IMAGES.PLAYERS.PLAYER_MOVE_LEFT + '_2',
                    url: 'assets/images/player/move_left/player_move_left_2.png',
                },
                {
                    name: GAME_CONFIG.IMAGES.PLAYERS.PLAYER_MOVE_LEFT + '_3',
                    url: 'assets/images/player/move_left/player_move_left_3.png',
                },
                {
                    name: GAME_CONFIG.IMAGES.PLAYERS.PLAYER_MOVE_LEFT + '_4',
                    url: 'assets/images/player/move_left/player_move_left_4.png',
                },
                {
                    name: GAME_CONFIG.IMAGES.PLAYERS.PLAYER_MOVE_RIGHT + '_1',
                    url: 'assets/images/player/move_right/player_move_right_1.png',
                },
                {
                    name: GAME_CONFIG.IMAGES.PLAYERS.PLAYER_MOVE_RIGHT + '_2',
                    url: 'assets/images/player/move_right/player_move_right_2.png',
                },
                {
                    name: GAME_CONFIG.IMAGES.PLAYERS.PLAYER_MOVE_RIGHT + '_3',
                    url: 'assets/images/player/move_right/player_move_right_3.png',
                },
                {
                    name: GAME_CONFIG.IMAGES.PLAYERS.PLAYER_MOVE_RIGHT + '_4',
                    url: 'assets/images/player/move_right/player_move_right_4.png',
                },
                {
                    name: GAME_CONFIG.IMAGES.PLAYERS.PLAYER_JUMP + '_1',
                    url: 'assets/images/player/jump/player_jump_1.png',
                },
                {
                    name: GAME_CONFIG.IMAGES.PLAYERS.PLAYER_JUMP + '_2',
                    url: 'assets/images/player/jump/player_jump_2.png',
                },
                {
                    name: GAME_CONFIG.IMAGES.PLAYERS.PLAYER_JUMP + '_3',
                    url: 'assets/images/player/jump/player_jump_3.png',
                },
                {
                    name: 'landed_spike',
                    url: 'assets/images/obstacle/landed_spike.png',
                },
            ],
            audio: [],
        },
    })
})()
