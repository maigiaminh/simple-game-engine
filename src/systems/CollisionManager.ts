import { EventEmitter } from "../core/EventEmitter";
import { CollisionInfo, ICollider, ICollisionManager, RaycastHit, Rectangle } from "../types/general";
import { Vector2 } from "../utils/Vector2";

export class CollisionManager extends EventEmitter implements ICollisionManager {
    private colliders: Set<ICollider> = new Set();

    public addCollider(collider: ICollider): void {
        this.colliders.add(collider);
    }

    public removeCollider(collider: ICollider): void {
        this.colliders.delete(collider);
    }

    public checkCollisions(): void {
        const colliderArray = Array.from(this.colliders);
        
        for (let i = 0; i < colliderArray.length; i++) {
            for (let j = i + 1; j < colliderArray.length; j++) {
                const colliderA = colliderArray[i];
                const colliderB = colliderArray[j];
                
                if (!this.canCollide(colliderA, colliderB)) continue;
                
                if (this.checkAABBCollision(colliderA.getBounds(), colliderB.getBounds())) {
                    const collisionInfo = this.createCollisionInfo(colliderA, colliderB);
                    colliderA.onCollision(colliderB, collisionInfo);
                    colliderB.onCollision(colliderA, collisionInfo);
                }
            }
        }
    }

    private canCollide(colliderA: ICollider, colliderB: ICollider): boolean {
        const layersA = colliderA.getCollisionLayers();
        const layersB = colliderB.getCollisionLayers();
        
        return layersA.some(layerA => layersB.includes(layerA));
    }

    private checkAABBCollision(boundsA: Rectangle, boundsB: Rectangle): boolean {
        return boundsA.x < boundsB.x + boundsB.width &&
               boundsA.x + boundsA.width > boundsB.x &&
               boundsA.y < boundsB.y + boundsB.height &&
               boundsA.y + boundsA.height > boundsB.y;
    }

    private createCollisionInfo(colliderA: ICollider, colliderB: ICollider): CollisionInfo {
        const boundsA = colliderA.getBounds();
        const boundsB = colliderB.getBounds();
        
        return {
            point: { 
                x: (boundsA.x + boundsA.width / 2 + boundsB.x + boundsB.width / 2) / 2,
                y: (boundsA.y + boundsA.height / 2 + boundsB.y + boundsB.height / 2) / 2
            },
            normal: new Vector2(0, -1), 
            penetration: 0,
            colliderA,
            colliderB,
            relativeVelocity: { x: 0, y: 0 }
        };
    }

    public queryAABB(bounds: Rectangle): ICollider[] {
        return Array.from(this.colliders).filter(collider => 
            this.checkAABBCollision(bounds, collider.getBounds())
        );
    }

    public queryPoint(point: Vector2): ICollider[] {
        return this.queryAABB({ x: point.x, y: point.y, width: 1, height: 1 });
    }

    public raycast(origin: Vector2, direction: Vector2, maxDistance: number = Infinity): RaycastHit | null {
        let closestHit: RaycastHit | null = null;
        let closestDistance = Infinity;
        
        for (const collider of this.colliders) {
            const bounds = collider.getBounds();
            const hit = this.raycastAABB(origin, direction, bounds, maxDistance);
            
            if (hit && hit.distance < closestDistance) {
                closestDistance = hit.distance;
                closestHit = {
                    collider,
                    point: hit.point,
                    normal: hit.normal,
                    distance: hit.distance,
                    gameObject: collider.getGameObject()
                };
            }
        }
        
        return closestHit;
    }

    private raycastAABB(origin: Vector2, direction: Vector2, bounds: Rectangle, maxDistance: number): { point: Vector2, normal: Vector2, distance: number } | null {
        const invDir = { x: 1 / direction.x, y: 1 / direction.y };
        
        const t1 = (bounds.x - origin.x) * invDir.x;
        const t2 = (bounds.x + bounds.width - origin.x) * invDir.x;
        const t3 = (bounds.y - origin.y) * invDir.y;
        const t4 = (bounds.y + bounds.height - origin.y) * invDir.y;
        
        const tmin = Math.max(Math.min(t1, t2), Math.min(t3, t4));
        const tmax = Math.min(Math.max(t1, t2), Math.max(t3, t4));
        
        if (tmax < 0 || tmin > tmax || tmin > maxDistance) {
            return null;
        }
        
        const distance = tmin > 0 ? tmin : tmax;
        const point = new Vector2(
            origin.x + direction.x * distance,
            origin.y + direction.y * distance
        );
        
        return {
            point,
            normal: new Vector2(0, -1), 
            distance
        };
    }

    public clear(): void {
        this.colliders.clear();
    }

    public getColliderCount(): number {
        return this.colliders.size;
    }

    public getActiveCollisionCount(): number {
        return 0; 
    }
}