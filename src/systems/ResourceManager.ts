import { EventEmitter } from '../core/EventEmitter'
import { ResourceType, LoadState, GAME_EVENTS } from '../types/enums'
import { LoadProgress, ResourceInfo } from '../types/interface'

export class ResourceManager<T = unknown> extends EventEmitter {
    private resources: Map<string, ResourceInfo<unknown>> = new Map()
    private loadingPromises: Map<string, Promise<unknown>> = new Map()

    public async loadResource(name: string, url: string, type: ResourceType): Promise<unknown> {
        const existing = this.resources.get(name)
        if (existing) {
            if (existing.state === LoadState.LOADED) {
                return existing.data
            } else if (existing.state === LoadState.LOADING) {
                return this.loadingPromises.get(name)
            } else if (existing.state === LoadState.ERROR) {
                throw existing.error
            }
        }

        const resourceInfo: ResourceInfo = {
            name,
            url,
            type,
            state: LoadState.LOADING,
            data: null,
        }

        this.resources.set(name, resourceInfo)

        const loadPromise = this.loadResourceByType(resourceInfo)
        this.loadingPromises.set(name, loadPromise)

        try {
            const data = await loadPromise

            resourceInfo.data = data
            resourceInfo.state = LoadState.LOADED

            this.dispatchEvent(GAME_EVENTS.RESOURCE_LOADED, { resource: resourceInfo })
            return data
        } catch (error) {
            resourceInfo.state = LoadState.ERROR
            resourceInfo.error = error as Error
            this.dispatchEvent(GAME_EVENTS.RESOURCE_LOAD_ERROR, { resource: resourceInfo, error })
            throw error
        } finally {
            this.loadingPromises.delete(name)
        }
    }

    private async loadResourceByType(resourceInfo: ResourceInfo<T>): Promise<unknown> {
        const { url, type } = resourceInfo

        switch (type) {
            case ResourceType.IMAGE:
                return this.loadImage(url)
            case ResourceType.AUDIO:
                return this.loadAndCheck(url, (r) => r.arrayBuffer())
            case ResourceType.TEXT:
                return this.loadAndCheck(url, (r) => r.text())
            case ResourceType.JSON:
                return this.loadAndCheck(url, (r) => r.json())
            default:
                throw new Error(`Unsupported resource type: ${type}`)
        }
    }

    private async loadAndCheck<R>(url: string, parser: (r: Response) => Promise<R>): Promise<R> {
        const response = await fetch(url)
        if (!response.ok)
            throw new Error(`Failed to load: ${response.status} ${response.statusText}`)
        return parser(response)
    }

    private async loadImage(url: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image()
            img.crossOrigin = 'anonymous'

            img.onload = () => resolve(img)
            img.onerror = () => reject(new Error(`Failed to load image: ${url}`))

            img.src = url
        })
    }

    public getResource<T = unknown>(name: string): T | null {
        const resource = this.resources.get(name)
        if (resource && resource.state === LoadState.LOADED) {
            return resource.data as T
        }
        return null
    }

    public hasResource(name: string): boolean {
        const resource = this.resources.get(name)
        return resource !== undefined && resource.state === LoadState.LOADED
    }

    public unloadResource(name: string): void {
        this.resources.delete(name)
    }

    public unloadAll(): void {
        this.resources.clear()
        this.loadingPromises.clear()
    }

    public getLoadProgress(): LoadProgress {
        const resources = Array.from(this.resources.values())
        const totalResources = resources.length
        const loadedResources = resources.filter((r) => r.state === LoadState.LOADED).length
        const failedResources = resources.filter((r) => r.state === LoadState.ERROR).length

        const currentResource = resources.find((r) => r.state === LoadState.LOADING)?.name || ''
        const percentage = totalResources > 0 ? (loadedResources / totalResources) * 100 : 100

        return {
            totalResources,
            loadedResources,
            failedResources,
            currentResource,
            percentage,
        }
    }
}
