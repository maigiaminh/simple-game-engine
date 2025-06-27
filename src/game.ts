import { GameCore } from './core/GameCore'
import { GAME_CONFIG } from './DoodleJump/config/GameplayConfig'
import { GameOverScene } from './DoodleJump/scenes/GameOverScene'
import { GameplayScene } from './DoodleJump/scenes/GameplayScene'
import { MainMenuScene } from './DoodleJump/scenes/MainMenuScene'

{
    (async () => {
        await GameCore.start({
            width: 1000,
            height: 800,
            targetFPS: 60,
            scenes: [new MainMenuScene(), new GameplayScene(), new GameOverScene()],
            preloadAssets: {
                images: [
                    {
                        name: GAME_CONFIG.IMAGES.BACKGROUND.GAMEPLAY_BACKGROUND,
                        url: 'assets/images/background/gameplay_background.png',
                    },
                    {
                        name: GAME_CONFIG.IMAGES.BACKGROUND.MAINMENU_BACKGROUND,
                        url: 'assets/images/background/main_menu_background.png',
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
                        name: GAME_CONFIG.IMAGES.BREAKABLE_PLATFORM,
                        url: 'assets/images/platform/breakable_platform.png',
                    },
                    {
                        name: GAME_CONFIG.IMAGES.BROKEN_PLATFORM,
                        url: 'assets/images/platform/broken_platform.png',
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
                        name: GAME_CONFIG.IMAGES.PLAYERS.PLAYER_DEAD,
                        url: 'assets/images/player/dead/player_dead.png',
                    },
                    {
                        name: GAME_CONFIG.IMAGES.PROJECTILE + '_1',
                        url: 'assets/images/projectile/projectile_1.png',
                    },
                    {
                        name: GAME_CONFIG.IMAGES.PROJECTILE + '_2',
                        url: 'assets/images/projectile/projectile_2.png',
                    },
                    {
                        name: GAME_CONFIG.IMAGES.PROJECTILE + '_3',
                        url: 'assets/images/projectile/projectile_3.png',
                    },
                    {
                        name: GAME_CONFIG.IMAGES.PROJECTILE + '_4',
                        url: 'assets/images/projectile/projectile_4.png',
                    },
                    {
                        name: GAME_CONFIG.IMAGES.PROJECTILE + '_5',
                        url: 'assets/images/projectile/projectile_5.png',
                    },
                    {
                        name: GAME_CONFIG.OBSTACLES.LANDED_SPIKE.ICON,
                        url: 'assets/images/obstacle/landed_spike.png',
                    },
                    {
                        name: GAME_CONFIG.OBSTACLES.FLYING_MONSTER.ICON,
                        url: 'assets/images/obstacle/flying_monster.png',
                    },
                    {
                        name: GAME_CONFIG.OBSTACLES.WITCH.ICON,
                        url: 'assets/images/obstacle/witch.png',
                    },
                    {
                        name: GAME_CONFIG.ITEMS.TRAMPOLINE.ICON,
                        url: 'assets/images/items/trampoline.png',
                    },
                    {
                        name: GAME_CONFIG.ITEMS.JETPACK.ICON,
                        url: 'assets/images/items/jetpack.png',
                    },
                    {
                        name: GAME_CONFIG.IMAGES.DECORATIONS.TREE_1,
                        url: 'assets/images/decoration/tree_1.png',
                    },
                    {
                        name: GAME_CONFIG.IMAGES.DECORATIONS.TREE_2,
                        url: 'assets/images/decoration/tree_2.png',
                    },
                    {
                        name: GAME_CONFIG.IMAGES.DECORATIONS.TREE_3,
                        url: 'assets/images/decoration/tree_3.png',
                    },
                    {
                        name: GAME_CONFIG.IMAGES.DECORATIONS.TREE_4,
                        url: 'assets/images/decoration/tree_4.png',
                    },
                    {
                        name: GAME_CONFIG.IMAGES.DECORATIONS.LAMP_POST_1,
                        url: 'assets/images/decoration/lamp_post_1.png',
                    },
                    {
                        name: GAME_CONFIG.IMAGES.DECORATIONS.LAMP_POST_2,
                        url: 'assets/images/decoration/lamp_post_2.png',
                    },
                    {
                        name: GAME_CONFIG.IMAGES.BUTTON.SOUND_ON_BUTTON,
                        url: 'assets/images/button/sound_on_button.png',
                    },
                    {
                        name: GAME_CONFIG.IMAGES.BUTTON.SOUND_OFF_BUTTON,
                        url: 'assets/images/button/sound_off_button.png',
                    },
                ],
                audio: [
                    {
                        name: GAME_CONFIG.AUDIO.SFX.JUMP,
                        url: 'assets/audio/sfx/jump.mp3',
                    },
                    {
                        name: GAME_CONFIG.AUDIO.SFX.TRAMPOLINE,
                        url: 'assets/audio/sfx/trampoline.m4a',
                    },
                    {
                        name: GAME_CONFIG.AUDIO.SFX.JETPACK,
                        url: 'assets/audio/sfx/jetpack.mp3',
                    },
                    {
                        name: GAME_CONFIG.AUDIO.SFX.WALK,
                        url: 'assets/audio/sfx/walk.mp3',
                    },
                    {
                        name: GAME_CONFIG.AUDIO.SFX.BUTTON_CLICK,
                        url: 'assets/audio/sfx/button_click.mp3',
                    },
                    {
                        name: GAME_CONFIG.AUDIO.MUSIC.BACKGROUND_MUSIC,
                        url: 'assets/audio/music/background_music.mp3',
                    },
                    {
                        name: GAME_CONFIG.AUDIO.SFX.HIT,
                        url: 'assets/audio/sfx/hit.mp3',
                    },
                    {
                        name: GAME_CONFIG.AUDIO.SFX.SHOOT,
                        url: 'assets/audio/sfx/shoot.mp3',
                    },
                    {
                        name: GAME_CONFIG.AUDIO.SFX.PLATFORM_BREAK,
                        url: 'assets/audio/sfx/platform_break.mp3',
                    },
                    {
                        name: GAME_CONFIG.AUDIO.SFX.DESTROY_OBSTACLE,
                        url: 'assets/audio/sfx/destroy_obstacle.mp3',
                    },
                ],
            },
        })
    })()
}
