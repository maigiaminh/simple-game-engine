import { IGameEngine, IGameObject, GameAnimation, ComponentConstructor } from "../types/interface";
import { Renderer } from "./Renderer";
import { Transform } from "./Transform";

export class AnimatedRenderer extends Renderer {
    private animations: Map<string, GameAnimation> = new Map();
    private currentAnimation: GameAnimation | null = null;
    private currentFrame: number = 0;
    private animationTime: number = 0;
    
    constructor(gameObject: IGameObject) {
        super(gameObject);
    }
    
    public addAnimation(name: string, imageNames: string[], gameEngine: IGameEngine, frameTime: number = 100, loop: boolean = true): void {
        const resourceManager = gameEngine.getResourceManager();
        const frames: HTMLImageElement[] = [];
        
        for (const imageName of imageNames) {
            const image = resourceManager.getResource<HTMLImageElement>(imageName);
            if (image) {
                frames.push(image);
            }
        }
        
        this.animations.set(name, {
            name,
            frames,
            frameTime,
            loop,
            currentFrame: 0
        });
    }
    
    public playAnimation(name: string): void {
        const animation = this.animations.get(name);
        if (animation && animation !== this.currentAnimation) {
            this.currentAnimation = animation;
            this.currentFrame = 0;
            this.animationTime = 0;
        }
    }
    
    public update(deltaTime: number): void {
        super.update(deltaTime);
        
        if (!this.currentAnimation) return;
        
        this.animationTime += deltaTime;
        
        if (this.animationTime >= this.currentAnimation.frameTime) {
            this.currentFrame++;
            this.animationTime = 0;
            
            if (this.currentFrame >= this.currentAnimation.frames.length) {
                if (this.currentAnimation.loop) {
                    this.currentFrame = 0;
                } else {
                    this.currentFrame = this.currentAnimation.frames.length - 1;
                }
            }
        }
    }
    
    public render(ctx: CanvasRenderingContext2D): void {
        if (!this.isVisible()) return;

        const transform = this.gameObject.getComponent(Transform as ComponentConstructor<Transform>);
        if (!transform) return;

        ctx.save();
        
        const worldPos = transform.getWorldPosition();
        const worldRot = transform.getWorldRotation();
        const worldScale = transform.getWorldScale();
        
        ctx.translate(worldPos.x, worldPos.y);
        ctx.rotate(worldRot);
        ctx.scale(worldScale.x, worldScale.y);

        if (this.currentAnimation && this.currentAnimation.frames.length > 0) {
            const currentImage = this.currentAnimation.frames[this.currentFrame];
            ctx.drawImage(currentImage, -currentImage.width / 2, -currentImage.height / 2);
        } else if (this.image) {
            ctx.drawImage(this.image, -this.image.width / 2, -this.image.height / 2);
        }

        ctx.restore();
    }
}
