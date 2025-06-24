export const GAME_EVENTS = {
    PLAYER_FELL: 'player_fell',
    PLAYER_JUMP: 'player_jump',
    PLAYER_HIT_OBSTACLE: 'player_hit_obstacle',
    PLAYER_PUSHED: 'player_pushed',
    PLAYER_HIT_ENEMY: 'player_hit_enemy',
    PLAYER_HIT_POWERUP: 'player_hit_powerup',
    PLAYER_HIT_FLOOR: 'player_hit_floor',
    PLAYER_HIT_CEILING: 'player_hit_ceiling',
    PLAYER_HIT_WALL: 'player_hit_wall',
    PLAYER_HIT_PLATFORM: 'player_hit_platform',
    PLAYER_LANDED: 'player_landed',
    PLAYER_USED_SPRING: 'player_used_spring',
    PLAYER_WRAPPED_SCREEN: 'player_wrapped_screen',
    PLAYER_SPEED_BOOST: 'player_speed_boost',
}

export enum PlayerState {
    IDLE = 'idle',
    MOVING_LEFT = 'moving_left',
    MOVING_RIGHT = 'moving_right',
    ON_PLATFORM = 'on_platform',
    IN_AIR = 'in_air',
}
