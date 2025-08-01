export class Vector2 {
    public x: number
    public y: number

    constructor(x = 0, y = 0) {
        this.x = x
        this.y = y
    }

    public static zero(): Vector2 {
        return new Vector2(0, 0)
    }

    public static one(): Vector2 {
        return new Vector2(1, 1)
    }

    public static up(): Vector2 {
        return new Vector2(0, -1)
    }

    public static down(): Vector2 {
        return new Vector2(0, 1)
    }

    public static left(): Vector2 {
        return new Vector2(-1, 0)
    }

    public static right(): Vector2 {
        return new Vector2(1, 0)
    }

    public clone(): Vector2 {
        return new Vector2(this.x, this.y)
    }

    public set(x: number, y: number): Vector2 {
        this.x = x
        this.y = y
        return this
    }

    public add(other: Vector2): Vector2 {
        return new Vector2(this.x + other.x, this.y + other.y)
    }

    public subtract(other: Vector2): Vector2 {
        return new Vector2(this.x - other.x, this.y - other.y)
    }

    public multiply(scalar: number): Vector2 {
        return new Vector2(this.x * scalar, this.y * scalar)
    }

    public divide(scalar: number): Vector2 {
        if (scalar === 0) throw new Error('Division by zero')
        return new Vector2(this.x / scalar, this.y / scalar)
    }

    public magnitude(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    }

    public normalized(): Vector2 {
        const mag = this.magnitude()
        if (mag === 0) return Vector2.zero()
        return this.divide(mag)
    }

    public distance(other: Vector2): number {
        return this.subtract(other).magnitude()
    }

    public dot(other: Vector2): number {
        return this.x * other.x + this.y * other.y
    }

    public static distance(a: Vector2, b: Vector2): number {
        return new Vector2(a.x, a.y).distance(b)
    }

    public static lerp(a: Vector2, b: Vector2, t: number): Vector2 {
        t = Math.max(0, Math.min(1, t))
        return new Vector2(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t)
    }

    public static fromAngle(angle: number, magnitude = 1): Vector2 {
        return new Vector2(Math.cos(angle) * magnitude, Math.sin(angle) * magnitude)
    }

    public static isVector2(obj: unknown): obj is Vector2 {
        return (
            typeof obj === 'object' &&
            obj !== null &&
            typeof (obj as { x: unknown }).x === 'number' &&
            typeof (obj as { y: unknown }).y === 'number'
        )
    }
}
