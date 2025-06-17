
// ==================== CORE INTERFACES ====================
// #region Core Interfaces
interface IUpdatable {
    update(deltaTime: number): void;
    setEnabled(enabled: boolean): void;
    isEnabled(): boolean;
}

interface IRenderable {
    render(ctx: CanvasRenderingContext2D): void;
    setVisible(visible: boolean): void;
    isVisible(): boolean;
}

interface ICollidable {
    getBounds(): Rectangle;
    onCollision(other: ICollidable, collisionInfo: CollisionInfo): void;
    getCollisionLayers(): number[];
    setCollisionLayers(layers: number[]): void;
}

interface IDestroyable {
    destroy(): void;
    isDestroyed(): boolean;
    onDestroy(): void;
}

interface ISerializable {
    serialize(): SerializedData;
    deserialize(data: SerializedData): void;
}

interface ILifecycle {
    awake(): void;
    start(): void;
    onEnable(): void;
    onDisable(): void;
    onDestroy(): void;
}
// #endregion

// ==================== COMPONENT INTERFACES ====================
// #region Component Interfaces
interface IComponent extends IUpdatable, IRenderable, ILifecycle, ISerializable {
    getGameObject(): IGameObject;
    getType(): string;
}

interface ITransform extends IComponent {
    position: Vector2D;
    rotation: number;
    scale: Vector2D;
    
    translate(delta: Vector2D): void;
    rotate(angle: number): void;
    setPosition(position: Vector2D): void;
    setRotation(rotation: number): void;
    setScale(scale: Vector2D): void;
    
    getWorldPosition(): Vector2D;
    getWorldRotation(): number;
    getWorldScale(): Vector2D;
    
    setParent(parent: ITransform | null): void;
    getParent(): ITransform | null;
    getChildren(): ITransform[];
}

interface IRenderer extends IComponent {
    color: RGBAColor;
    visible: boolean;
    
    setImage(image: HTMLImageElement): void;
    setColor(color: RGBAColor): void;
}

interface ICollider extends IComponent, ICollidable {
    type: ColliderType;
    width: number;
    height: number;
    radius: number;
    offset: Vector2D;
    isTrigger: boolean;
    layers: number;
    mask: number;
    
    canCollideWith(other: ICollider): boolean;
}

interface IRigidBody extends IComponent {
    velocity: Vector2D;
    acceleration: Vector2D;
    mass: number;
    drag: number;
    useGravity: boolean;
    isKinematic: boolean;
    
    addForce(force: Vector2D): void;
    setVelocity(velocity: Vector2D): void;
    getVelocity(): Vector2D;
}

interface ICamera extends IComponent {
    type: CameraType;
    size: number;
    fieldOfView: number;
    
    worldToScreen(worldPoint: Vector2D, canvasSize: Vector2D): Vector2D;
    screenToWorld(screenPoint: Vector2D, canvasSize: Vector2D): Vector2D;
    isInView(bounds: Rectangle, canvasSize: Vector2D): boolean;
    
    setTarget(target: IGameObject | null): void;
    shake(intensity: number, duration: number): void;
}
// #endregion

// ==================== GAME OBJECT INTERFACE ====================
// #region Game Object Interface
interface IGameObject extends IUpdatable, IRenderable, IDestroyable, ISerializable, ILifecycle {
    readonly id: string;
    name: string;
    tag: string;
    layer: number;
    
    addComponent<T extends IComponent>(component: T): T;
    getComponent<T extends IComponent>(componentClass: ComponentConstructor<T>): T | null;
    removeComponent<T extends IComponent>(componentClass: ComponentConstructor<T>): void;
    hasComponent<T extends IComponent>(componentClass: ComponentConstructor<T>): boolean;
    getAllComponents(): IComponent[];
    
    getTransform(): ITransform;
    setActive(active: boolean): void;
    isActive(): boolean;
    
    // Transform shortcuts
    getPosition(): Vector2D;
    setPosition(position: Vector2D): void;
    getRotation(): number;
    setRotation(rotation: number): void;
    translate(delta: Vector2D): void;
    rotate(angle: number): void;
}
// #endregion

// ==================== SCENE INTERFACE ====================
// #region Scene Interface
interface IScene extends IUpdatable, IRenderable, ISerializable {
    getName(): string;
    getState(): SceneState;
    getLoadProgress(): number;
    
    addGameObject(gameObject: IGameObject): void;
    removeGameObject(gameObject: IGameObject): void;
    findGameObject(id: string): IGameObject | null;
    findGameObjectByName(name: string): IGameObject | null;
    findGameObjectByTag(tag: string): IGameObject | null;
    findGameObjectsByTag(tag: string): IGameObject[];
    getAllGameObjects(): IGameObject[];
    getGameObjectCount(): number;
    
    load(): Promise<void>;
    unload(): Promise<void>;
    
    getMainCamera(): ICamera | null;
}
// #endregion

// ==================== SYSTEM INTERFACES ====================
// #region System Interfaces
interface IInputManager {
    update(): void;
    
    // Keyboard
    isKeyPressed(keyCode: string): boolean;
    isKeyJustPressed(keyCode: string): boolean;
    isKeyJustReleased(keyCode: string): boolean;
    
    // Mouse
    isMouseButtonPressed(button: MouseButton): boolean;
    isMouseButtonJustPressed(button: MouseButton): boolean;
    getMousePosition(): Vector2D;
    getMouseDelta(): Vector2D;
    
    // Touch
    getTouches(): GameTouch[];
    getTouchCount(): number;
    
    setEnabled(enabled: boolean): void;
    isEnabled(): boolean;
}

interface IAudioManager {
    loadSound(name: string, url: string): Promise<void>;
    playSound(name: string, options?: PlaySoundOptions): void;
    stopSound(name: string): void;
    stopAllSounds(): void;
    
    setMasterVolume(volume: number): void;
    getMasterVolume(): number;
    
    setEnabled(enabled: boolean): void;
    isEnabled(): boolean;
}

interface IResourceManager {
    loadResource(name: string, url: string, type: ResourceType): Promise<any>;
    getResource<T = any>(name: string): T | null;
    hasResource(name: string): boolean;
    unloadResource(name: string): void;
    unloadAll(): void;
    
    getLoadProgress(): LoadProgress;
}

interface ICollisionManager {
    addCollider(collider: ICollider): void;
    removeCollider(collider: ICollider): void;
    checkCollisions(): void;
    clear(): void;
    
    queryAABB(bounds: Rectangle): ICollider[];
    queryPoint(point: Vector2D): ICollider[];
    raycast(origin: Vector2D, direction: Vector2D, maxDistance?: number): RaycastHit | null;
    
    getColliderCount(): number;
    getActiveCollisionCount(): number;
}

interface IGameEngine {
    // Scene management
    addScene(name: string, scene: IScene): void;
    setScene(name: string): Promise<void>;
    getCurrentScene(): IScene | null;
    
    // Engine control
    start(): void;
    stop(): void;
    pause(): void;
    resume(): void;
    
    // System access
    getInputManager(): IInputManager;
    getAudioManager(): IAudioManager;
    getResourceManager(): IResourceManager;
    getCollisionManager(): ICollisionManager;
    
    // Canvas access
    getCanvas(): HTMLCanvasElement;
    getContext(): CanvasRenderingContext2D;
    
    // Configuration
    setTargetFPS(fps: number): void;
    getTargetFPS(): number;
    getCurrentFPS(): number;
    
    destroy(): void;
}
// #endregion

// ==================== EVENT INTERFACES ====================
// #region Event Interfaces
interface GameEvent {
    type: string;
    target: any;
    currentTarget: any;
    phase: EventPhase;
    bubbles: boolean;
    cancelable: boolean;
    defaultPrevented: boolean;
    timeStamp: number;
    data?: any;
    
    preventDefault(): void;
    stopPropagation(): void;
    stopImmediatePropagation(): void;
}

interface IEventEmitter {
    addEventListener(type: string, listener: GameEventListener, options?: GameEventListenerOptions): void;
    removeEventListener(type: string, listener: GameEventListener): void;
    dispatchEvent(event: GameEvent | string, data?: any): boolean;
    removeAllEventListeners(type?: string): void;
}
// #endregion

// ==================== DATA STRUCTURES ====================
// #region Data Structures
interface CollisionInfo {
    point: Vector2D;
    normal: Vector2D;
    penetration: number;
    colliderA: ICollider;
    colliderB: ICollider;
    relativeVelocity: Vector2D;
}

interface RaycastHit {
    collider: ICollider;
    point: Vector2D;
    normal: Vector2D;
    distance: number;
    gameObject: IGameObject;
}

interface GameTouch {
    id: number;
    position: Vector2D;
    deltaPosition: Vector2D;
    startPosition: Vector2D;
    phase: TouchPhase;
    pressure: number;
    timestamp: number;
}

interface LoadProgress {
    totalResources: number;
    loadedResources: number;
    failedResources: number;
    bytesLoaded: number;
    totalBytes: number;
    currentResource: string;
    percentage: number;
}

interface PerformanceStats {
    fps: number;
    frameTime: number;
    updateTime: number;
    renderTime: number;
    memoryUsage: number;
}
// #endregion

// ==================== CONFIGURATION INTERFACES ====================
// #region Configuration Interfaces
interface EngineConfig {
    canvasId: string;
    width?: number;
    height?: number;
    targetFPS?: number;
    enableDebug?: boolean;
    enablePhysics?: boolean;
    enableAudio?: boolean;
}

interface GameObjectConfig {
    position?: Vector2D;
    rotation?: number;
    scale?: Vector2D;
    tag?: string;
    layer?: number;
    active?: boolean;
    name?: string;
}

interface PlaySoundOptions {
    volume?: number;
    pitch?: number;
    loop?: boolean;
    position?: Vector2D;
    fadeIn?: number;
}

interface GameEventListenerOptions {
    once?: boolean;
    capture?: boolean;
    priority?: number;
}
// #endregion

// ==================== UTILITY TYPES ====================
// #region Utility Types
type ComponentConstructor<T extends IComponent> = new (...args: any[]) => T;
type GameEventListener = (event: GameEvent) => void;
type UpdateFunction = (deltaTime: number) => void;
type RenderFunction = (ctx: CanvasRenderingContext2D) => void;

// ==================== FACTORY TYPES ====================

interface ComponentFactory {
    createTransform(gameObject: IGameObject, position?: Vector2D): ITransform;
    createRenderer(gameObject: IGameObject): IRenderer;
    createCollider(gameObject: IGameObject, type: ColliderType, width?: number, height?: number): ICollider;
    createRigidBody(gameObject: IGameObject, mass?: number): IRigidBody;
    createCamera(gameObject: IGameObject): ICamera;
}

interface GameObjectFactory {
    createEmpty(name?: string): IGameObject;
    createWithTransform(position?: Vector2D, rotation?: number, scale?: Vector2D): IGameObject;
    createSprite(imageName: string, position?: Vector2D): IGameObject;
    createRigidBody(position?: Vector2D, mass?: number): IGameObject;
}
// #endregion

// ==================== ANIMATION INTERFACES ====================
// #region Animation Interfaces
interface IAnimation {
    name: string;
    frames: number[];
    frameTime: number;
    loop: boolean;
}

interface IAnimator extends IComponent {
    playAnimation(name: string): void;
    stopAnimation(): void;
    addAnimation(animation: IAnimation): void;
    getCurrentAnimation(): string | null;
    isAnimationPlaying(): boolean;
}
// #endregion

// ==================== PARTICLE SYSTEM INTERFACES ====================
// #region Particle System Interfaces
interface IParticle {
    position: Vector2D;
    velocity: Vector2D;
    life: number;
    maxLife: number;
    size: number;
    color: RGBAColor;
    
    update(deltaTime: number): boolean;
    render(ctx: CanvasRenderingContext2D): void;
}

interface IParticleSystem extends IComponent {
    emit(count: number): void;
    burst(count: number): void;
    clear(): void;
    
    setEmissionRate(rate: number): void;
    setParticleLife(min: number, max: number): void;
    setParticleVelocity(min: Vector2D, max: Vector2D): void;
    setParticleColor(color: RGBAColor): void;
    
    startEmission(): void;
    stopEmission(): void;
    getParticleCount(): number;
}
// #endregion

// ==================== UI INTERFACES ====================
// #region UI Interfaces
interface IUIElement extends IComponent {
    setLocalPosition(position: Vector2D): void;
    setAnchor(anchor: Vector2D): void;
    setPivot(pivot: Vector2D): void;
    
    addChild(child: IUIElement): void;
    removeChild(child: IUIElement): void;
    getParent(): IUIElement | null;
    getChildren(): IUIElement[];
}

interface IButton extends IUIElement {
    setText(text: string): void;
    setOnClick(callback: () => void): void;
    setColors(background: RGBAColor, text: RGBAColor, hover: RGBAColor): void;
}

interface ILabel extends IUIElement {
    setText(text: string): void;
    setColor(color: RGBAColor): void;
    setFont(font: string): void;
    setTextAlign(align: CanvasTextAlign): void;
}
// #endregion