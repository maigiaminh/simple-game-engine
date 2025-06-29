export const GAME_EVENTS = {
    PLAYER_HIT_OBSTACLE: 'player_hit_obstacle',
}

export enum PlayerState {
    IDLE = 'idle',
    MOVING_LEFT = 'moving_left',
    MOVING_RIGHT = 'moving_right',
    ON_PLATFORM = 'on_platform',
    IN_AIR = 'in_air',
}
