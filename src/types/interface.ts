import { Camera } from '../components/Camera'
import { Collider } from '../components/Collider'
import { Renderer } from '../components/Renderer'
import { RigidBody } from '../components/RigidBody'
import { Transform } from '../components/Transform'
import { Vector2 } from '../utils/Vector2'
import {
    AnimationType,
    ColliderType,
    EventPhase,
    LoadState,
    ResourceType,
    TouchPhase,
} from './enums'
// ==================== CORE INTERFACES ====================
// #region Core Interfaces
export interface IUpdatable {
    update(deltaTime: number): void
    setEnabled(enabled: boolean): void
    isEnabled(): boolean
}

export interface IRenderable {
    render(ctx: CanvasRenderingContext2D): void
    setVisible(visible: boolean): void
    isVisible(): boolean
}

export interface ICollidable {
    getBounds(): Rectangle
    onCollision(other: ICollidable, collisionInfo: CollisionInfo): void
    onCollisionExit(other: ICollidable): void
    getCollisionLayers(): number[]
    getCollisionMask(): number[]
    setCollisionMask(mask: number[]): void
    setCollisionLayers(layers: number[]): void
}

export interface IDestroyable {
    destroy(): void
    destroyComponent<T extends IComponent>(componentClass: ComponentConstructor<T>): void
    isDestroyed(): boolean
    onDestroy(): void
}

export interface ISerializable {
    serialize(): SerializedData
    deserialize(data: SerializedData): void
}

export interface ILifecycle {
    awake(): void
    start(): void
    onEnable(): void
    onDisable(): void
    onDestroy(): void
}
// #endregion

// ==================== COMPONENT INTERFACES ====================
// #region Component Interfaces
export interface IComponent extends IUpdatable, IRenderable, ILifecycle, ISerializable {
    getGameObject(): IGameObject
    getType(): string
}

// ==================== GAME OBJECT INTERFACE ====================
// #region Game Object Interface
export interface IGameObject
    extends IUpdatable,
        IRenderable,
        IDestroyable,
        ISerializable,
        ILifecycle {
    readonly id: string
    name: string
    tag: string
    layer: number

    addComponent<T extends IComponent>(component: T): T
    getComponent<T extends IComponent>(componentClass: ComponentConstructor<T>): T | null
    removeComponent<T extends IComponent>(componentClass: ComponentConstructor<T>): void
    hasComponent<T extends IComponent>(componentClass: ComponentConstructor<T>): boolean
    getAllComponents(): IComponent[]

    getTransform(): Transform
    setActive(active: boolean): void
    isActive(): boolean

    // Transform shortcuts
    getPosition(): Vector2
    setPosition(position: Vector2): void
    getRotation(): number
    setRotation(rotation: number): void
    translate(delta: Vector2): void
    rotate(angle: number): void
}
// #endregion

// ==================== EVENT INTERFACES ====================
// #region Event Interfaces
export interface GameEvent {
    type: string
    target: unknown
    currentTarget: unknown
    phase: EventPhase
    bubbles: boolean
    cancelable: boolean
    defaultPrevented: boolean
    timeStamp: number
    data?: unknown

    preventDefault(): void
    stopPropagation(): void
    stopImmediatePropagation(): void
}
// #endregion

// ==================== DATA STRUCTURES ====================
// #region Data Structures
export interface CollisionInfo {
    point: Vector2
    normal: Vector2
    penetration: number
    colliderA: Collider
    colliderB: Collider
    relativeVelocity: Vector2
}

export interface RaycastHit {
    collider: Collider
    point: Vector2
    normal: Vector2
    distance: number
    gameObject: IGameObject
}

export interface RaycastAABB {
    point: Vector2
    normal: Vector2
    distance: number
}

export interface GameTouch {
    id: number
    position: Vector2
    deltaPosition: Vector2
    startPosition: Vector2
    phase: TouchPhase
    pressure: number
    timestamp: number
}

export interface LoadProgress {
    totalResources: number
    loadedResources: number
    failedResources: number
    currentResource: string
    percentage: number
}

export interface PerformanceStats {
    fps: number
    frameTime: number
    updateTime: number
    renderTime: number
    memoryUsage: number
}

export interface ResourceInfo<T = unknown> {
    name: string
    url: string
    type: ResourceType
    state: LoadState
    data: unknown
    error?: Error
}
// #endregion

// ==================== CONFIGURATION INTERFACES ====================
// #region Configuration Interfaces
export interface EngineConfig {
    canvasId: string
    width?: number
    height?: number
    targetFPS?: number
    enableDebug?: boolean
    enablePhysics?: boolean
    enableAudio?: boolean
}

export interface GameObjectConfig {
    position?: Vector2
    rotation?: number
    scale?: Vector2
    tag?: string
    layer?: number
    active?: boolean
    name?: string
}

export interface PlaySoundOptions {
    volume?: number
    pitch?: number
    loop?: boolean
    position?: Vector2
    fadeIn?: number
}

export interface GameEventListenerOptions {
    once?: boolean
    capture?: boolean
    priority?: number
}

export type GameEventOptions = {
    bubbles?: boolean
    cancelable?: boolean
    data?: unknown
}
// #endregion

// ==================== UTILITY TYPES ====================
// #region Utility Types
export type ComponentConstructor<T extends IComponent> = new (...args: unknown[]) => T
export type GameEventListener = (event: GameEvent) => void
export type UpdateFunction = (deltaTime: number) => void
export type RenderFunction = (ctx: CanvasRenderingContext2D) => void

// ==================== FACTORY TYPES ====================

export interface ComponentFactory {
    createTransform(gameObject: IGameObject, position?: Vector2): Transform
    createRenderer(gameObject: IGameObject): Renderer
    createCollider(
        gameObject: IGameObject,
        type: ColliderType,
        width?: number,
        height?: number
    ): Collider
    createRigidBody(gameObject: IGameObject, mass?: number): RigidBody
    createCamera(gameObject: IGameObject): Camera
}

export interface GameObjectFactory {
    createEmpty(name?: string): IGameObject
    createWithTransform(position?: Vector2, rotation?: number, scale?: Vector2): IGameObject
    createSprite(imageName: string, position?: Vector2): IGameObject
    createRigidBody(position?: Vector2, mass?: number): IGameObject
}
// #endregion

// ==================== ANIMATION INTERFACES ====================
// #region Animation Interfaces
export interface IAnimation {
    name: string
    frames: number[]
    frameTime: number
    loop: boolean
}

export interface IAnimator extends IComponent {
    playAnimation(name: string): void
    stopAnimation(): void
    addAnimation(animation: IAnimation): void
    getCurrentAnimation(): string | null
    isAnimationPlaying(): boolean
}

export interface AnimationConfig {
    type: AnimationType
    duration: number
    delay?: number
    easing?: (t: number) => number
    onComplete?: () => void
    loop?: boolean
}
// #endregion

// ==================== PARTICLE SYSTEM INTERFACES ====================
// #region Particle System Interfaces
export interface IParticle {
    position: Vector2
    velocity: Vector2
    life: number
    maxLife: number
    size: number
    color: RGBAColor

    update(deltaTime: number): boolean
    render(ctx: CanvasRenderingContext2D): void
}

export interface IParticleSystem extends IComponent {
    emit(count: number): void
    burst(count: number): void
    clear(): void

    setEmissionRate(rate: number): void
    setParticleLife(min: number, max: number): void
    setParticleVelocity(min: Vector2, max: Vector2): void
    setParticleColor(color: RGBAColor): void

    startEmission(): void
    stopEmission(): void
    getParticleCount(): number
}

export interface ParticleConfig {
    position: Vector2
    velocity?: Vector2
    acceleration?: Vector2
    life: number
    size: number
    color: RGBAColor
    fadeOut?: boolean
    shrink?: boolean
    gravity?: boolean
}

// #endregion

// ==================== AUDIO INTERFACES ====================
// #region Audio Interfaces
export interface AudioClip {
    name: string
    buffer: AudioBuffer
    volume: number
    loop: boolean
}

export interface AudioSource {
    clip: AudioClip
    source: AudioBufferSourceNode
    gainNode: GainNode
    isPlaying: boolean
}
//#endregion

// ==================== ANIMATION INTERFACES ====================
// #region Animation Interfaces
export interface GameAnimation {
    name: string
    frames: HTMLImageElement[]
    frameTime: number
    loop: boolean
    currentFrame: number
}
