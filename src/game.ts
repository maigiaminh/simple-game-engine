import { Renderer } from "./components/Renderer";
import { RigidBody } from "./components/RigidBody";
import { GameEngine } from "./core/GameEngine";
import { GameObject } from "./core/GameObject";
import { Scene } from "./core/Scene";


class SimpleScene extends Scene {
    protected async onLoad(): Promise<void> {
        console.log('SimpleScene loaded');
    }

    protected async onUnload(): Promise<void> {
        console.log('SimpleScene unloaded');
    }

    protected onUpdate(deltaTime: number): void {
    }

    protected onRender(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.font = '20px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText('Use Arrow Keys to Move the Player', 20, 30);
        ctx.restore();
    }

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
            width: 1920,
            height: 1080,
            targetFPS: 60,
        });

        const scene = new SimpleScene();
        const player = new GameObject({ name: 'Player', position: { x: 400, y: 300 } });
        const renderer = new Renderer(player);
        renderer.setColor({ r: 0, g: 150, b: 255, a: 1 });
        player.addComponent(renderer);

        const rigidBody = new RigidBody(player, 1);
        rigidBody.useGravity = false;
        player.addComponent(rigidBody);

        scene.addGameObject(player);

        engine.addScene('main', scene);
        await engine.setScene('main');
        engine.start();

        const input = engine.getInputManager();
        engine.addEventListener('engineUpdate', () => {
            const speed = 200;
            let vx = 0, vy = 0;
            if (input.isKeyPressed('ArrowLeft')) vx -= speed;
            if (input.isKeyPressed('ArrowRight')) vx += speed;
            if (input.isKeyPressed('ArrowUp')) vy -= speed;
            if (input.isKeyPressed('ArrowDown')) vy += speed;
            rigidBody.setVelocity({ x: vx, y: vy });
        });
    }
}

(async () => {
    await Game.create();
})();
