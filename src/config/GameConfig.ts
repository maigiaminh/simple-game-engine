export const GAME_CONFIG = {
    CANVAS: {
        WIDTH: 1000,
        HEIGHT: 800
    },
    PLAYER: {
        WIDTH: 32,
        HEIGHT: 32,
        JUMP_FORCE: -300,
        MOVE_SPEED: 300,
        MAX_FALL_SPEED: 1000
    },
    PLATFORM: {
        WIDTH: 80,
        HEIGHT: 20,
        SPAWN_DISTANCE: 120,
        INITIAL_COUNT: 10
    },
    OBSTACLES: {
        CACTUS: {
            WIDTH: 24,
            HEIGHT: 32,
            SPAWN_CHANCE: 0.3
        },
        BIRD: {
            WIDTH: 32,
            HEIGHT: 24,
            SPAWN_CHANCE: 0.2,
            MOVE_SPEED: 150
        }
    },
    CLOUDS: {
        WIDTH: 64,
        HEIGHT: 32,
        COUNT: 5,
        SPEED: 50
    },
    CAMERA: {
        FOLLOW_OFFSET: 200
    },
    PHYSICS: {
        GRAVITY: 1500
    }
} as const;