enum InputType {
    Keyboard = 'keyboard',
    Mouse = 'mouse',
    Touch = 'touch',
}

enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2
}

enum TouchPhase {
    Began = 'began',
    Moved = 'moved',
    Stationary = 'stationary',
    Ended = 'ended',
    Canceled = 'canceled'
}

enum ColliderType {
    Box = 'box',
    Circle = 'circle',
    Polygon = 'polygon'
}

enum CollisionLayer {
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

enum ResourceType {
    Image = 'image',
    Audio = 'audio',
    Text = 'text',
    JSON = 'json',
    Font = 'font'
}

enum LoadState {
    NotLoaded = 'not_loaded',
    Loading = 'loading',
    Loaded = 'loaded',
    Error = 'error'
}

enum SceneState {
    NotLoaded = 'not_loaded',
    Loading = 'loading',
    Loaded = 'loaded',
    Unloading = 'unloading'
}

enum CameraType {
    Orthographic = 'orthographic',
    Perspective = 'perspective'
}

enum EventPhase {
    Capture = 'capture',
    Target = 'target',
    Bubble = 'bubble'
}