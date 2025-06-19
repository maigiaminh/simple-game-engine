import { GameEngine } from "./core/GameEngine";
import { Scene } from "./core/Scene";
import { ResourceType, UIAnchor } from "./types/enums";

class SimpleScene extends Scene {
    protected async onLoad(): Promise<void> {
        console.log('SimpleScene loaded');
    }

    protected async onUnload(): Promise<void> {
        console.log('SimpleScene unloaded');
    }

    protected onUpdate(deltaTime: number): void {
    }

    protected onRender(ctx: CanvasRenderingContext2D): void { }

    constructor() {
        super('MainScene');
    }
}

class Game {
    constructor() {
        throw new Error("Use Game.create() instead of new Game()");
    }

    static async create() {
        let canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'game-canvas';
            document.body.appendChild(canvas);
        }

        const engine = new GameEngine({
            canvasId: 'game-canvas',
            width: 1000,
            height: 800,
            targetFPS: 60,
        });

        // await this.preloadAssets(engine);

        return engine;
    }

    static async preloadAssets(engine: GameEngine): Promise<void> {
        const resourceManager = engine.getResourceManager();
        
        const imagesToLoad = [
            { name: 'test', url: 'assets/images/test.png' },
        ];
        
        for (const imageData of imagesToLoad) {
            await resourceManager.loadResource(imageData.name, imageData.url, ResourceType.Image);
        }

        const audioToLoad = [
            { name: 'test', url: 'assets/audio/test.mp3' },
        ];

        for (const audioData of audioToLoad) {
            await resourceManager.loadResource(audioData.name, audioData.url, ResourceType.Audio);
        }
        
        console.log('Assets preloaded');
    }
}

(async () => {
    await Game.create();
})();
