import { GameCore } from './core/GameCore'
import { Scene } from './core/Scene'

class SimpleScene extends Scene {
    protected async onLoad(): Promise<void> {
        console.log('SimpleScene loaded')
    }

    protected async onUnload(): Promise<void> {
        console.log('SimpleScene unloaded')
    }

    protected onUpdate(deltaTime: number): void {}

    protected onRender(ctx: CanvasRenderingContext2D): void {
        ctx.save()
        ctx.font = '32px Arial'
        ctx.fillStyle = '#fff'
        ctx.textAlign = 'center'
        ctx.fillText('Welcome to Simple Game Engine!', 500, 200)
        ctx.restore()
    }

    constructor() {
        super('MainScene')
    }
}

(async () => {
    await GameCore.start({
        width: 1000,
        height: 800,
        targetFPS: 60,
        scenes: [new SimpleScene()],
        preloadAssets: {
            images: [],
            audio: [],
        },
    })
})()
