export class MathUtils {
    public static readonly PI = Math.PI
    public static readonly TWO_PI = Math.PI * 2
    public static readonly HALF_PI = Math.PI * 0.5
    public static readonly DEG_TO_RAD = Math.PI / 180
    public static readonly RAD_TO_DEG = 180 / Math.PI

    public static clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value))
    }

    public static clamp01(value: number): number {
        return this.clamp(value, 0, 1)
    }

    public static lerp(a: number, b: number, t: number): number {
        return a + (b - a) * this.clamp01(t)
    }

    public static lerpUnclamped(a: number, b: number, t: number): number {
        return a + (b - a) * t
    }

    public static inverseLerp(a: number, b: number, value: number): number {
        if (a !== b) {
            return this.clamp01((value - a) / (b - a))
        }
        return 0
    }

    public static smoothStep(a: number, b: number, t: number): number {
        t = this.clamp01(t)
        t = t * t * (3 - 2 * t)
        return this.lerp(a, b, t)
    }

    public static pingPong(t: number, length: number): number {
        t = t % (length * 2)
        return length - Math.abs(t - length)
    }

    public static repeat(t: number, length: number): number {
        return t - Math.floor(t / length) * length
    }

    public static sign(value: number): number {
        return value >= 0 ? 1 : -1
    }

    public static distance(x1: number, y1: number, x2: number, y2: number): number {
        const dx = x2 - x1
        const dy = y2 - y1
        return Math.sqrt(dx * dx + dy * dy)
    }

    public static sqrDistance(x1: number, y1: number, x2: number, y2: number): number {
        const dx = x2 - x1
        const dy = y2 - y1
        return dx * dx + dy * dy
    }

    public static random(): number
    public static random(max: number): number
    public static random(min: number, max: number): number
    public static random(min?: number, max?: number): number {
        if (min === undefined && max === undefined) {
            return Math.random()
        } else if (max === undefined) {
            return Math.random() * min!
        } else {
            return Math.random() * (max - min!) + min!
        }
    }

    public static randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }

    public static randomSign(): number {
        return Math.random() < 0.5 ? -1 : 1
    }

    public static randomBool(): boolean {
        return Math.random() < 0.5
    }

    public static randomChoice<T>(array: T[]): T {
        return array[this.randomInt(0, array.length - 1)]
    }

    public static shuffle<T>(array: T[]): T[] {
        const result = [...array]
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[result[i], result[j]] = [result[j], result[i]]
        }
        return result
    }

    public static degToRad(degrees: number): number {
        return degrees * this.DEG_TO_RAD
    }

    public static radToDeg(radians: number): number {
        return radians * this.RAD_TO_DEG
    }

    public static isPowerOfTwo(value: number): boolean {
        return (value & (value - 1)) === 0 && value !== 0
    }

    public static nextPowerOfTwo(value: number): number {
        return Math.pow(2, Math.ceil(Math.log2(value)))
    }

    public static map(
        value: number,
        start1: number,
        stop1: number,
        start2: number,
        stop2: number
    ): number {
        return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1))
    }

    public static approximately(a: number, b: number, epsilon = 0.0001): boolean {
        return Math.abs(a - b) < epsilon
    }
}
