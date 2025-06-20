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
// #endregion
