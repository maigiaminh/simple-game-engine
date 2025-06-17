import { IScene, IGameObject, ICamera, SceneState, SerializedData } from '../types/general';
import { EventEmitter } from './EventEmitter';

export abstract class Scene extends EventEmitter implements IScene {
    protected gameObjects: Map<string, IGameObject> = new Map();
    protected gameObjectsByTag: Map<string, Set<IGameObject>> = new Map();
    protected gameObjectsByLayer: Map<number, Set<IGameObject>> = new Map();
    
    protected name: string;
    protected state: SceneState = SceneState.NotLoaded;
    protected loadProgress: number = 0;

    protected mainCamera: ICamera | null = null;

    private enabled: boolean = true;
    private visible: boolean = true;

    public setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    public isEnabled(): boolean {
        return this.enabled;
    }

    public setVisible(visible: boolean): void {
        this.visible = visible;
    }

    public isVisible(): boolean {
        return this.visible;
    }

    constructor(name: string) {
        super();
        this.name = name;
    }

    public getName(): string {
        return this.name;
    }

    public getState(): SceneState {
        return this.state;
    }

    public getLoadProgress(): number {
        return this.loadProgress;
    }

    public addGameObject(gameObject: IGameObject): void {
        this.gameObjects.set(gameObject.id, gameObject);
        
        if (!this.gameObjectsByTag.has(gameObject.tag)) {
            this.gameObjectsByTag.set(gameObject.tag, new Set());
        }
        this.gameObjectsByTag.get(gameObject.tag)!.add(gameObject);
        
        if (!this.gameObjectsByLayer.has(gameObject.layer)) {
            this.gameObjectsByLayer.set(gameObject.layer, new Set());
        }
        this.gameObjectsByLayer.get(gameObject.layer)!.add(gameObject);
        
        if (this.state === SceneState.Loaded) {
            gameObject.awake();
            gameObject.start();
        }
        
        this.dispatchEvent('gameObjectAdded', { gameObject });
    }

    public removeGameObject(gameObject: IGameObject): void {
        if (!this.gameObjects.has(gameObject.id)) return;
        
        this.gameObjects.delete(gameObject.id);
        
        const tagSet = this.gameObjectsByTag.get(gameObject.tag);
        if (tagSet) {
            tagSet.delete(gameObject);
            if (tagSet.size === 0) {
                this.gameObjectsByTag.delete(gameObject.tag);
            }
        }
        
        const layerSet = this.gameObjectsByLayer.get(gameObject.layer);
        if (layerSet) {
            layerSet.delete(gameObject);
            if (layerSet.size === 0) {
                this.gameObjectsByLayer.delete(gameObject.layer);
            }
        }
        
        this.dispatchEvent('gameObjectRemoved', { gameObject });
    }

    public findGameObject(id: string): IGameObject | null {
        return this.gameObjects.get(id) || null;
    }

    public findGameObjectByName(name: string): IGameObject | null {
        for (const gameObject of this.gameObjects.values()) {
            if (gameObject.name === name) {
                return gameObject;
            }
        }
        return null;
    }

    public findGameObjectByTag(tag: string): IGameObject | null {
        const tagSet = this.gameObjectsByTag.get(tag);
        return tagSet ? Array.from(tagSet)[0] || null : null;
    }

    public findGameObjectsByTag(tag: string): IGameObject[] {
        const tagSet = this.gameObjectsByTag.get(tag);
        return tagSet ? Array.from(tagSet) : [];
    }

    public getAllGameObjects(): IGameObject[] {
        return Array.from(this.gameObjects.values());
    }

    public getGameObjectCount(): number {
        return this.gameObjects.size;
    }

    public async load(): Promise<void> {
        if (this.state !== SceneState.NotLoaded) return;
        
        this.state = SceneState.Loading;
        this.loadProgress = 0;
        
        try {
            await this.onLoad();
            
            this.gameObjects.forEach(gameObject => {
                gameObject.awake();
            });
            
            this.gameObjects.forEach(gameObject => {
                gameObject.start();
            });
            
            this.state = SceneState.Loaded;
            this.loadProgress = 1;
            this.dispatchEvent('sceneLoaded');
            
        } catch (error) {
            this.state = SceneState.NotLoaded;
            this.dispatchEvent('sceneLoadError', { error });
            throw error;
        }
    }

    public async unload(): Promise<void> {
        if (this.state !== SceneState.Loaded) return;
        
        this.state = SceneState.Unloading;
        
        try {
            this.gameObjects.forEach(gameObject => gameObject.destroy());
            this.gameObjects.clear();
            this.gameObjectsByTag.clear();
            this.gameObjectsByLayer.clear();
            
            await this.onUnload();
            
            this.state = SceneState.NotLoaded;
            this.loadProgress = 0;
            this.dispatchEvent('sceneUnloaded');
            
        } catch (error) {
            this.dispatchEvent('sceneUnloadError', { error });
            throw error;
        }
    }

    protected abstract onLoad(): Promise<void>;
    protected abstract onUnload(): Promise<void>;

    public update(deltaTime: number): void {
        if (this.state !== SceneState.Loaded) return;
        
        const destroyed: string[] = [];
        this.gameObjects.forEach((gameObject, id) => {
            if (gameObject.isDestroyed()) {
                destroyed.push(id);
            }
        });
        
        destroyed.forEach(id => {
            const gameObject = this.gameObjects.get(id);
            if (gameObject) {
                this.removeGameObject(gameObject);
            }
        });
        
        this.gameObjects.forEach(gameObject => {
            if (gameObject.isActive()) {
                gameObject.update(deltaTime);
            }
        });

        this.onUpdate(deltaTime);
    }

    public render(ctx: CanvasRenderingContext2D): void {
        if (this.state !== SceneState.Loaded) return;

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        const sortedObjects = Array.from(this.gameObjects.values())
            .filter(obj => obj.isActive())
            .sort((a, b) => a.layer - b.layer);

        sortedObjects.forEach(gameObject => gameObject.render(ctx));

        this.onRender(ctx);
    }

    protected abstract onUpdate(deltaTime: number): void;
    protected abstract onRender(ctx: CanvasRenderingContext2D): void;

    public getMainCamera(): ICamera | null {
        return this.mainCamera;
    }

    public serialize(): SerializedData {
        const gameObjectData: SerializedData = {};
        this.gameObjects.forEach((obj, id) => {
            gameObjectData[id] = obj.serialize();
        });

        return {
            name: this.name,
            gameObjects: gameObjectData
        };
    }

    public deserialize(data: SerializedData): void {
        if (typeof data.name === 'string') {
            this.name = data.name;
        }

        if (data.gameObjects) {
            Object.entries(data.gameObjects).forEach(([id, objData]) => {
                const gameObject = this.gameObjects.get(id);
                if (gameObject && objData) {
                    gameObject.deserialize(objData);
                }
            });
        }
    }
}