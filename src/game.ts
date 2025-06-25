import { GameCore } from './core/GameCore'
import { GAME_CONFIG } from './DoodleJump/config/GameplayConfig'
import { GameOverScene } from './DoodleJump/scenes/GameOverScene'
import { GameplayScene } from './DoodleJump/scenes/GameplayScene'

{
    (async () => {
        await GameCore.start({
            width: 1000,
            height: 800,
            targetFPS: 60,
            scenes: [new GameplayScene('GameplayScene'), new GameOverScene('GameOverScene')],
            preloadAssets: {
                images: [
                    {
                        name: GAME_CONFIG.IMAGES.BACKGROUND,
                        url: 'assets/images/background/background.jpg',
                    },
                    {
                        name: GAME_CONFIG.IMAGES.BACKGROUND_2,
                        url: 'assets/images/background/background_2.png',
                    },
                    { name: GAME_CONFIG.IMAGES.CLOUD, url: 'assets/images/decoration/cloud.png' },
                    {
                        name: GAME_CONFIG.IMAGES.GROUND,
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
                        name: GAME_CONFIG.IMAGES.PLATFORMS.PLATFORM_3,
                        url: 'assets/images/platform/platform_3.png',
                    },
                    {
                        name: GAME_CONFIG.IMAGES.PLATFORMS.PLATFORM_4,
                        url: 'assets/images/platform/platform_4.png',
                    },
                    {
                        name: GAME_CONFIG.IMAGES.PLATFORMS.PLATFORM_5,
                        url: 'assets/images/platform/platform_5.png',
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
                        name: GAME_CONFIG.IMAGES.PLAYERS.PLAYER_IDLE_JETPACK + '_1',
                        url: 'assets/images/player/jetpack/idle/player_idle_jetpack_1.png',
                    },
                    {
                        name: GAME_CONFIG.IMAGES.PLAYERS.PLAYER_IDLE_JETPACK + '_2',
                        url: 'assets/images/player/jetpack/idle/player_idle_jetpack_2.png',
                    },
                    {
                        name: GAME_CONFIG.IMAGES.PLAYERS.PLAYER_IDLE_JETPACK + '_3',
                        url: 'assets/images/player/jetpack/idle/player_idle_jetpack_3.png',
                    },
                    {
                        name: GAME_CONFIG.IMAGES.PLAYERS.PLAYER_IDLE_JETPACK + '_4',
                        url: 'assets/images/player/jetpack/idle/player_idle_jetpack_4.png',
                    },
                    {
                        name: GAME_CONFIG.IMAGES.PLAYERS.PLAYER_IDLE_JETPACK + '_5',
                        url: 'assets/images/player/jetpack/idle/player_idle_jetpack_5.png',
                    },
                    {
                        name: GAME_CONFIG.IMAGES.PLAYERS.PLAYER_IDLE_JETPACK + '_6',
                        url: 'assets/images/player/jetpack/idle/player_idle_jetpack_6.png',
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
                        name: GAME_CONFIG.IMAGES.PLAYERS.PLAYER_MOVE_LEFT_JETPACK + '_1',
                        url: 'assets/images/player/jetpack/move_left/player_move_left_jetpack_1.png',
                    },
                    {
                        name: GAME_CONFIG.IMAGES.PLAYERS.PLAYER_MOVE_LEFT_JETPACK + '_2',
                        url: 'assets/images/player/jetpack/move_left/player_move_left_jetpack_2.png',
                    },
                    {
                        name: GAME_CONFIG.IMAGES.PLAYERS.PLAYER_MOVE_LEFT_JETPACK + '_3',
                        url: 'assets/images/player/jetpack/move_left/player_move_left_jetpack_3.png',
                    },
                    {
                        name: GAME_CONFIG.IMAGES.PLAYERS.PLAYER_MOVE_LEFT_JETPACK + '_4',
                        url: 'assets/images/player/jetpack/move_left/player_move_left_jetpack_4.png',
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
                        name: GAME_CONFIG.IMAGES.PLAYERS.PLAYER_MOVE_RIGHT_JETPACK + '_1',
                        url: 'assets/images/player/jetpack/move_right/player_move_right_jetpack_1.png',
                    },
                    {
                        name: GAME_CONFIG.IMAGES.PLAYERS.PLAYER_MOVE_RIGHT_JETPACK + '_2',
                        url: 'assets/images/player/jetpack/move_right/player_move_right_jetpack_2.png',
                    },
                    {
                        name: GAME_CONFIG.IMAGES.PLAYERS.PLAYER_MOVE_RIGHT_JETPACK + '_3',
                        url: 'assets/images/player/jetpack/move_right/player_move_right_jetpack_3.png',
                    },
                    {
                        name: GAME_CONFIG.IMAGES.PLAYERS.PLAYER_MOVE_RIGHT_JETPACK + '_4',
                        url: 'assets/images/player/jetpack/move_right/player_move_right_jetpack_4.png',
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
                    {
                        name: 'trampoline',
                        url: 'assets/images/items/trampoline.png',
                    },
                    {
                        name: 'jetpack',
                        url: 'assets/images/items/jetpack.png',
                    },
                ],
                audio: [],
            },
        })
    })()
}
