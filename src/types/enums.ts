
// ==================== ENUMS ====================
// #region Enums
export enum InputType {
    Keyboard = 'keyboard',
    Mouse = 'mouse',
    Touch = 'touch',
}

export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2
}

export enum TouchPhase {
    Began = 'began',
    Moved = 'moved',
    Stationary = 'stationary',
    Ended = 'ended',
    Canceled = 'canceled'
}

export enum ColliderType {
    Box = 'Box',
    Circle = 'Circle',
    Polygon = 'Circle'
}

export enum CollisionLayer {
    Default = 0,
    Player = 1,
    Enemy = 2,
    Projectile = 3,
    Environment = 4,
    Trigger = 5,
    UI = 6,
    Ground = 7,
    All = 8
}

export enum ResourceType {
    Image = 'image',
    Audio = 'audio',
    Text = 'text',
    JSON = 'json',
    Font = 'font'
}

export enum LoadState {
    NotLoaded = 'not_loaded',
    Loading = 'loading',
    Loaded = 'loaded',
    Error = 'error'
}

export enum SceneState {
    NotLoaded = 'not_loaded',
    Loading = 'loading',
    Loaded = 'loaded',
    Unloading = 'unloading'
}

export enum CameraType {
    Orthographic = 'Orthographic',
    Perspective = 'Perspective'
}

export enum EventPhase {
    Capture = 'capture',
    Target = 'target',
    Bubble = 'bubble'
}

export enum UIAnchor {
    TopLeft = 'TopLeft',
    TopCenter = 'TopCenter',
    TopRight = 'TopRight',
    MiddleLeft = 'MiddleLeft',
    MiddleCenter = 'MiddleCenter',
    MiddleRight = 'MiddleRight',
    BottomLeft = 'BottomLeft',
    BottomCenter = 'BottomCenter',
    BottomRight = 'BottomRight'
}

export enum ButtonState {
    Normal = 'Normal',
    Hovered = 'Hovered',
    Pressed = 'Pressed',
    Disabled = 'Disabled'
}
// #endregion
