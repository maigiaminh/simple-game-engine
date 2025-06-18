import { EventEmitter } from "../core/EventEmitter";
import { ResourceType, LoadState } from "../types/enums";
import { IResourceManager, LoadProgress, ResourceInfo } from "../types/interface";

export class ResourceManager<T = unknown> extends EventEmitter implements IResourceManager {
    private resources: Map<string, ResourceInfo<unknown>> = new Map();
    private loadingPromises: Map<string, Promise<unknown>> = new Map();

    public async loadResource(name: string, url: string, type: ResourceType): Promise<unknown> {
        const existing = this.resources.get(name);
        if (existing) {
            if (existing.state === LoadState.Loaded) {
                return existing.data;
            } else if (existing.state === LoadState.Loading) {
                return this.loadingPromises.get(name);
            } else if (existing.state === LoadState.Error) {
                throw existing.error;
            }
        }

        const resourceInfo: ResourceInfo = {
            name,
            url,
            type,
            state: LoadState.Loading,
            data: null
        };

        this.resources.set(name, resourceInfo);

        const loadPromise = this.loadResourceByType(resourceInfo);
        this.loadingPromises.set(name, loadPromise);

        try {
            const data = await loadPromise;
            
            resourceInfo.data = data;
            resourceInfo.state = LoadState.Loaded;
            
            this.dispatchEvent('resourceLoaded', { resource: resourceInfo });
            return data;
            
        } catch (error) {
            resourceInfo.state = LoadState.Error;
            resourceInfo.error = error as Error;
            this.dispatchEvent('resourceError', { resource: resourceInfo, error });
            throw error;
            
        } finally {
            this.loadingPromises.delete(name);
        }
    }

    private async loadResourceByType(resourceInfo: ResourceInfo<T>): Promise<unknown> {
        const { url, type } = resourceInfo;

        switch (type) {
            case ResourceType.Image:
                return this.loadImage(url);
                
            case ResourceType.Audio:
                return this.loadAudioBuffer(url);
                
            case ResourceType.Text:
                return this.loadText(url);
                
            case ResourceType.JSON:
                return this.loadJSON(url);
                
            default:
                throw new Error(`Unsupported resource type: ${type}`);
        }
    }

    private async loadImage(url: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
            
            img.src = url;
        });
    }

    private async loadAudioBuffer(url: string): Promise<ArrayBuffer> {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load audio: ${response.status} ${response.statusText}`);
        }
        return await response.arrayBuffer();
    }

    private async loadText(url: string): Promise<string> {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load text: ${response.status} ${response.statusText}`);
        }
        return await response.text();
    }

    private async loadJSON(url: string): Promise<unknown> {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load JSON: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    }

    public getResource<T = unknown>(name: string): T | null {
        const resource = this.resources.get(name);
        if (resource && resource.state === LoadState.Loaded) {
            return resource.data as T;
        }
        return null;
    }

    public hasResource(name: string): boolean {
        const resource = this.resources.get(name);
        return resource !== undefined && resource.state === LoadState.Loaded;
    }

    public unloadResource(name: string): void {
        this.resources.delete(name);
    }

    public unloadAll(): void {
        this.resources.clear();
        this.loadingPromises.clear();
    }

    public getLoadProgress(): LoadProgress {
        const resources = Array.from(this.resources.values());
        const totalResources = resources.length;
        const loadedResources = resources.filter(r => r.state === LoadState.Loaded).length;
        const failedResources = resources.filter(r => r.state === LoadState.Error).length;
        
        const currentResource = resources.find(r => r.state === LoadState.Loading)?.name || '';
        const percentage = totalResources > 0 ? (loadedResources / totalResources) * 100 : 100;

        return {
            totalResources,
            loadedResources,
            failedResources,
            bytesLoaded: 0,
            totalBytes: 0,
            currentResource,
            percentage
        };
    }
}