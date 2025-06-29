import { Component } from '../core/Component'
import { IGameObject, ComponentConstructor } from '../types/interface'
import { Vector2 } from '../utils/Vector2'
import { Transform } from './Transform'

export class RigidBody extends Component {
    public velocity: Vector2 = Vector2.zero()
    public acceleration: Vector2 = Vector2.zero()
    public mass = 1
    public drag = 0.98
    public useGravity = true
    public isKinematic = false
    public isGrounded = false

    private force: Vector2 = Vector2.zero()
    private static readonly GRAVITY: Vector2 = new Vector2(0, 900)

    constructor(gameObject: IGameObject, mass = 5) {
        super(gameObject)
        this.mass = mass
    }

    public addForce(force: Vector2): void {
        if (this.isKinematic) return
        this.force = this.force.add(force)
    }

    public setVelocity(velocity: Vector2): void {
        this.velocity = new Vector2(velocity.x, velocity.y)
    }

    public getVelocity(): Vector2 {
        return new Vector2(this.velocity.x, this.velocity.y)
    }

    public update(deltaTime: number): void {
        if (!this.enabled || this.isKinematic) return

        const dt = deltaTime * 0.001

        if (this.useGravity) {
            this.addForce(
                new Vector2(RigidBody.GRAVITY.x * this.mass, RigidBody.GRAVITY.y * this.mass)
            )
        }

        this.acceleration = new Vector2(this.force.x / this.mass, this.force.y / this.mass)

        this.velocity = this.velocity.add(this.acceleration.multiply(dt))

        this.velocity = this.velocity.multiply(Math.pow(this.drag, dt))

        if (this.isGrounded && this.velocity.y > 0) this.velocity.y = 0

        const transform = this.gameObject.getComponent(Transform as ComponentConstructor<Transform>)
        if (transform) {
            const deltaPos = this.velocity.multiply(dt)
            if (this.isGrounded && deltaPos.y > 0) deltaPos.y = 0
            transform.translate(deltaPos)
        }

        this.force = Vector2.zero()
    }

    public render(ctx: CanvasRenderingContext2D): void {
        //
    }

    public serialize(): SerializedData {
        return {
            ...super.serialize(),
            velocity: this.velocity,
            mass: this.mass,
            drag: this.drag,
            useGravity: this.useGravity,
            isKinematic: this.isKinematic,
        }
    }

    public deserialize(data: SerializedData): void {
        super.deserialize(data)
        if (Vector2.isVector2(data.velocity)) {
            this.velocity = new Vector2(data.velocity.x, data.velocity.y)
        } else {
            this.velocity = Vector2.zero()
        }

        this.mass = typeof data.mass === 'number' ? data.mass : 1
        this.drag = typeof data.drag === 'number' ? data.drag : 0.98
        this.useGravity = data.useGravity !== false
        this.isKinematic = !!data.isKinematic
    }
}
