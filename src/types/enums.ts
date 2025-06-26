// ==================== ENUMS ====================
// #region Enums
export enum InputType {
    KEYBOARD = 'keyboard',
    MOUSE = 'mouse',
    TOUCH = 'touch',
}

export enum MouseButton {
    LEFT = 0,
    MIDDLE = 1,
    RIGHT = 2,
}

export enum TouchPhase {
    BEGAN = 'began',
    MOVED = 'moved',
    STATIONARY = 'stationary',
    ENDED = 'ended',
    CANCELED = 'canceled',
}

export enum ColliderType {
    BOX = 'box',
    CIRCLE = 'circle',
    POLYGON = 'polygon',
}

export enum CollisionLayer {
    DEFAULT = 0,
    PLAYER = 1,
    ENEMY = 2,
    PROJECTILE = 3,
    ENVIRONMENT = 4,
    TRIGGER = 5,
    UI = 6,
    GROUND = 7,
    ALL = 8,
}

export enum ResourceType {
    IMAGE = 'image',
    AUDIO = 'audio',
    TEXT = 'text',
    JSON = 'json',
    FONT = 'font',
}

export enum LoadState {
    NOT_LOADED = 'not_loaded',
    LOADING = 'loading',
    LOADED = 'loaded',
    ERROR = 'error',
}

export enum SceneState {
    NOT_LOADED = 'not_loaded',
    LOADING = 'loading',
    LOADED = 'loaded',
    UNLOADING = 'unloading',
}

export enum GameState {
    PLAYING = 'playing',
    PAUSED = 'paused',
    GAMEOVER = 'game_over',
    RESTART = 'restart',
}

export enum CameraType {
    ORTHOGRAPHIC = 'orthographic',
    PERSPECTIVE = 'perspective',
}

export enum EventPhase {
    CAPTURE = 'capture',
    TARGET = 'target',
    BUBBLE = 'bubble',
}

export enum UIAnchor {
    TOP_LEFT = 'top_left',
    TOP_CENTER = 'top_center',
    TOP_RIGHT = 'top_right',
    MIDDLE_LEFT = 'middle_left',
    MIDDLE_CENTER = 'middle_center',
    MIDDLE_RIGHT = 'middle_right',
    BOTTOM_LEFT = 'bottom_left',
    BOTTOM_CENTER = 'bottom_center',
    BOTTOM_RIGHT = 'bottom_right',
}

export enum ButtonState {
    NORMAL = 'normal',
    HOVERED = 'hovered',
    PRESSED = 'pressed',
    DISABLED = 'disabled',
}

export const ENGINE_EVENTS = {
    TRIGGER_ENTER: 'trigger_enter',
    TRIGGER_EXIT: 'trigger_exit',
    COLLISION_ENTER: 'collision_enter',
    COLLISION_EXIT: 'collision_exit',
    ENGINE_INITIALIZED: 'engine_initialized',
    ENGINE_STARTED: 'engine_started',
    ENGINE_STOPPED: 'engine_stopped',
    ENGINE_PAUSED: 'engine_paused',
    ENGINE_RESUMED: 'engine_resumed',
    ENGINE_UPDATED: 'engine_updated',
    ENGINE_RENDERED: 'engine_rendered',
    ENGINE_DESTROYED: 'engine_destroyed',
    SCENE_ADDED: 'scene_added',
    SCENE_CHANGED: 'scene_changed',
    SCENE_LOADED: 'scene_loaded',
    SCENE_LOAD_ERROR: 'scene_load_error',
    SCENE_UNLOADED: 'scene_unloaded',
    SCENE_UNLOAD_ERROR: 'scene_unload_error',
    COMPONENT_ADDED: 'component_added',
    COMPONENT_REMOVED: 'component_removed',
    GAME_OBJECT_ADDED: 'game_object_added',
    GAME_OBJECT_REMOVED: 'game_object_removed',
    GAME_OBJECT_ACTIVATED: 'game_object_activated',
    GAME_OBJECT_DEACTIVATED: 'game_object_deactivated',
    GAME_OBJECT_DESTROYED: 'game_object_destroyed',
    MAIN_CAMERA_SET: 'main_camera_set',
    AUDIO_CLIP_LOADED: 'audio_clip_loaded',
    INPUT_KEY_DOWN: 'key_down',
    INPUT_KEY_UP: 'key_up',
    INPUT_MOUSE_DOWN: 'mouse_down',
    INPUT_MOUSE_UP: 'mouse_up',
    INPUT_MOUSE_MOVE: 'mouse_move',
    INPUT_TOUCH_START: 'touch_start',
    INPUT_TOUCH_MOVE: 'touch_move',
    INPUT_TOUCH_END: 'touch_end',
    RESOURCE_LOADED: 'resource_loaded',
    RESOURCE_LOAD_ERROR: 'resource_load_error',
}

export enum AnimationType {
    FADE_IN = 'fade_in',
    FADE_OUT = 'fade_out',
    SLIDE_IN_FROM_TOP = 'slide_in_from_top',
    SLIDE_IN_FROM_BOTTOM = 'slide_in_from_bottom',
    SLIDE_IN_FROM_LEFT = 'slide_in_from_left',
    SLIDE_IN_FROM_RIGHT = 'slide_in_from_right',
    SCALE_IN = 'scale_in',
    SCALE_OUT = 'scale_out',
    BOUNCE = 'bounce',
    PULSE = 'pulse',
    SHAKE = 'shake',
    FadeIn = 'FadeIn',
}

export enum ParticlePreset {
    EXPLOSION = 'explosion',
    STARS = 'stars',
    SPARKLES = 'sparkles',
    SMOKE = 'smoke',
    FIRE = 'fire',
    CONFETTI = 'confetti',
    HEARTS = 'hearts',
    SNOW = 'snow',
}
// #endregion
