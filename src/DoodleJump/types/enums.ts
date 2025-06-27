export const GAME_EVENTS = {
    PLAYER_FELL: 'player_fell',
    PLAYER_JUMP: 'player_jump',
    PLAYER_HIT_OBSTACLE: 'player_hit_obstacle',
    PLAYER_HIT_ITEM: 'player_hit_item',
    PLAYER_SHOOT: 'player_shoot',
    GAME_OVER: 'game_over',
}

export enum PlayerState {
    IDLE = 'idle',
    MOVING_LEFT = 'moving_left',
    MOVING_RIGHT = 'moving_right',
    ON_PLATFORM = 'on_platform',
    IN_AIR = 'in_air',
}
