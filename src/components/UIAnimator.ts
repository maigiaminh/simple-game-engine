import { Component } from '../core/Component'
import { UIElement } from '../core/UIElement'
import { AnimationType } from '../types/enums'
import { IGameObject, AnimationConfig } from '../types/interface'
import { Vector2 } from '../utils/Vector2'

export class UIAnimator extends Component {
    private animations: Map<string, Animation> = new Map()
    private activeAnimations: Set<string> = new Set()

    constructor(gameObject: IGameObject) {
        super(gameObject)
    }

    public animate(element: UIElement, config: AnimationConfig): string {
        const animationId = this.generateAnimationId()
        const animation = new Animation(element, config)

        this.animations.set(animationId, animation)
        this.activeAnimations.add(animationId)

        return animationId
    }

    public stopAnimation(animationId: string): void {
        const animation = this.animations.get(animationId)
        if (animation) {
            animation.stop()
            this.activeAnimations.delete(animationId)
        }
    }

    public stopAllAnimations(): void {
        this.activeAnimations.forEach((id) => {
            this.stopAnimation(id)
        })
    }

    public update(deltaTime: number): void {
        const completedAnimations: string[] = []

        this.activeAnimations.forEach((animationId) => {
            const animation = this.animations.get(animationId)
            if (animation) {
                animation.update(deltaTime)

                if (animation.isComplete()) {
                    completedAnimations.push(animationId)
                }
            }
        })

        completedAnimations.forEach((id) => {
            const animation = this.animations.get(id)
            if (animation && animation.config.onComplete) {
                animation.config.onComplete()
            }

            if (animation && !animation.config.loop) {
                this.animations.delete(id)
                this.activeAnimations.delete(id)
            } else if (animation && animation.config.loop) {
                animation.restart()
            }
        })
    }

    private generateAnimationId(): string {
        return `anim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    public render(ctx: CanvasRenderingContext2D): void {
        //
    }
}

type AnimationOrginalValues = {
    position: Vector2
    size: Vector2
}
class Animation {
    public config: AnimationConfig
    private element: UIElement
    private startTime = 0
    private currentTime = 0
    private isRunning = false
    private originalValues: AnimationOrginalValues = {
        position: new Vector2(0, 0),
        size: new Vector2(0, 0),
    }

    constructor(element: UIElement, config: AnimationConfig) {
        this.element = element
        this.config = config
        this.saveOriginalValues()

        if (config.delay) {
            setTimeout(() => this.start(), config.delay)
        } else {
            this.start()
        }
    }

    private saveOriginalValues(): void {
        this.originalValues = {
            position: this.element.getGameObject().getPosition(),
            size: new Vector2(this.element.size.x, this.element.size.y),
        }
    }

    public start(): void {
        this.isRunning = true
        this.startTime = Date.now()
        this.currentTime = 0
    }

    public stop(): void {
        this.isRunning = false
    }

    public restart(): void {
        this.currentTime = 0
        this.startTime = Date.now()
        this.isRunning = true
    }

    public update(deltaTime: number): void {
        if (!this.isRunning) return

        this.currentTime += deltaTime
        const progress = Math.min(this.currentTime / this.config.duration, 1)
        const easedProgress = this.config.easing ? this.config.easing(progress) : progress

        this.applyAnimation(easedProgress)

        if (progress >= 1) {
            this.isRunning = false
        }
    }

    private applyAnimation(progress: number): void {
        switch (this.config.type) {
            case AnimationType.FadeIn:
                this.applyFadeIn(progress)
                break
            case AnimationType.FADE_OUT:
                this.applyFadeOut(progress)
                break
            case AnimationType.SLIDE_IN_FROM_TOP:
                this.applySlideFromTop(progress)
                break
            case AnimationType.SLIDE_IN_FROM_BOTTOM:
                this.applySlideFromBottom(progress)
                break
            case AnimationType.SLIDE_IN_FROM_LEFT:
                this.applySlideFromLeft(progress)
                break
            case AnimationType.SLIDE_IN_FROM_RIGHT:
                this.applySlideFromRight(progress)
                break
            case AnimationType.SLIDE_OUT_TO_TOP:
                this.applySlideOutToTop(progress)
                break
            case AnimationType.SLIDE_OUT_TO_BOTTOM:
                this.applySlideOutToBottom(progress)
                break
            case AnimationType.SLIDE_OUT_TO_LEFT:
                this.applySlideOutToLeft(progress)
                break
            case AnimationType.SLIDE_OUT_TO_RIGHT:
                this.applySlideOutToRight(progress)
                break
            case AnimationType.SCALE_IN:
                this.applyScaleIn(progress)
                break
            case AnimationType.SCALE_OUT:
                this.applyScaleOut(progress)
                break
            case AnimationType.BOUNCE:
                this.applyBounce(progress)
                break
            case AnimationType.PULSE:
                this.applyPulse(progress)
                break
            case AnimationType.SHAKE:
                this.applyShake(progress)
                break
        }
    }

    private applyFadeIn(progress: number): void {
        //
    }

    private applyFadeOut(progress: number): void {
        //
    }

    private applySlideFromTop(progress: number): void {
        const originalY = this.originalValues.position.y
        const offsetY = -200
        const currentY = originalY + offsetY * (1 - progress)
        this.element
            .getGameObject()
            .setPosition(new Vector2(this.originalValues.position.x, currentY))
    }

    private applySlideFromBottom(progress: number): void {
        const originalY = this.originalValues.position.y
        const offsetY = 200
        const currentY = originalY + offsetY * (1 - progress)
        this.element
            .getGameObject()
            .setPosition(new Vector2(this.originalValues.position.x, currentY))
    }

    private applySlideFromLeft(progress: number): void {
        const originalX = this.originalValues.position.x
        const offsetX = -200
        const currentX = originalX + offsetX * (1 - progress)
        this.element
            .getGameObject()
            .setPosition(new Vector2(currentX, this.originalValues.position.y))
    }

    private applySlideFromRight(progress: number): void {
        const originalX = this.originalValues.position.x
        const offsetX = 200
        const currentX = originalX + offsetX * (1 - progress)
        this.element
            .getGameObject()
            .setPosition(new Vector2(currentX, this.originalValues.position.y))
    }

    private applySlideOutToTop(progress: number): void {
        const originalY = this.originalValues.position.y
        const offsetY = -200
        const currentY = originalY + offsetY * progress
        this.element
            .getGameObject()
            .setPosition(new Vector2(this.originalValues.position.x, currentY))
    }

    private applySlideOutToBottom(progress: number): void {
        const originalY = this.originalValues.position.y
        const offsetY = 200
        const currentY = originalY + offsetY * progress
        this.element
            .getGameObject()
            .setPosition(new Vector2(this.originalValues.position.x, currentY))
    }

    private applySlideOutToLeft(progress: number): void {
        const originalX = this.originalValues.position.x
        const offsetX = -200
        const currentX = originalX + offsetX * progress
        this.element
            .getGameObject()
            .setPosition(new Vector2(currentX, this.originalValues.position.y))
    }

    private applySlideOutToRight(progress: number): void {
        const originalX = this.originalValues.position.x
        const offsetX = 200
        const currentX = originalX + offsetX * progress
        this.element
            .getGameObject()
            .setPosition(new Vector2(currentX, this.originalValues.position.y))
    }

    private applyScaleIn(progress: number): void {
        const scale = progress
        this.element.size = new Vector2(
            this.originalValues.size.x * scale,
            this.originalValues.size.y * scale
        )
    }

    private applyScaleOut(progress: number): void {
        const scale = 1 - progress
        this.element.size = new Vector2(
            this.originalValues.size.x * scale,
            this.originalValues.size.y * scale
        )
    }

    private applyBounce(progress: number): void {
        const bounceHeight = Math.sin(progress * Math.PI) * 20
        const currentY = this.originalValues.position.y - bounceHeight
        this.element
            .getGameObject()
            .setPosition(new Vector2(this.originalValues.position.x, currentY))
    }

    applyPulse(progress: number): void {
        const scale = 1 + Math.sin(progress * Math.PI * 4) * 0.1
        this.element.size = new Vector2(
            this.originalValues.size.x * scale,
            this.originalValues.size.y * scale
        )
    }

    private applyShake(progress: number): void {
        const intensity = 5 * (1 - progress)
        const offsetX = (Math.random() - 0.5) * intensity
        const offsetY = (Math.random() - 0.5) * intensity
        this.element
            .getGameObject()
            .setPosition(
                new Vector2(
                    this.originalValues.position.x + offsetX,
                    this.originalValues.position.y + offsetY
                )
            )
    }

    public isComplete(): boolean {
        return !this.isRunning && this.currentTime >= this.config.duration
    }
}

export class Easing {
    public static easeInQuad(t: number): number {
        return t * t
    }

    public static easeOutQuad(t: number): number {
        return t * (2 - t)
    }

    public static easeInOutQuad(t: number): number {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
    }

    public static easeInCubic(t: number): number {
        return t * t * t
    }

    public static easeOutCubic(t: number): number {
        return --t * t * t + 1
    }

    public static easeInOutCubic(t: number): number {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
    }

    public static easeInBounce(t: number): number {
        return 1 - Easing.easeOutBounce(1 - t)
    }

    public static easeOutBounce(t: number): number {
        if (t < 1 / 2.75) {
            return 7.5625 * t * t
        } else if (t < 2 / 2.75) {
            return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
        } else if (t < 2.5 / 2.75) {
            return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
        } else {
            return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375
        }
    }

    public static easeInElastic(t: number): number {
        const s = 1.70158
        const p = 0.3
        if (t === 0) return 0
        if (t === 1) return 1
        const s1 = p / 4
        return -(Math.pow(2, 10 * (t -= 1)) * Math.sin(((t - s1) * (2 * Math.PI)) / p))
    }

    public static easeOutElastic(t: number): number {
        const s = 1.70158
        const p = 0.3
        if (t === 0) return 0
        if (t === 1) return 1
        const s1 = p / 4
        return Math.pow(2, -10 * t) * Math.sin(((t - s1) * (2 * Math.PI)) / p) + 1
    }
}
