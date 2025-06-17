class Color {
    public r: number;
    public g: number;
    public b: number;
    public a: number;

    constructor(r: number = 255, g: number = 255, b: number = 255, a: number = 1) {
        this.r = MathUtils.clamp(r, 0, 255);
        this.g = MathUtils.clamp(g, 0, 255);
        this.b = MathUtils.clamp(b, 0, 255);
        this.a = MathUtils.clamp(a, 0, 1);
    }

    public clone(): Color {
        return new Color(this.r, this.g, this.b, this.a);
    }

    public set(r: number, g: number, b: number, a: number = 1): Color {
        this.r = MathUtils.clamp(r, 0, 255);
        this.g = MathUtils.clamp(g, 0, 255);
        this.b = MathUtils.clamp(b, 0, 255);
        this.a = MathUtils.clamp(a, 0, 1);
        return this;
    }

    public toString(): string {
        return `rgba(${Math.round(this.r)}, ${Math.round(this.g)}, ${Math.round(this.b)}, ${this.a})`;
    }

    public toHex(): string {
        const toHex = (value: number) => {
            const hex = Math.round(value).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        return `#${toHex(this.r)}${toHex(this.g)}${toHex(this.b)}`;
    }

    public toHSL(): { h: number, s: number, l: number } {
        const r = this.r / 255;
        const g = this.g / 255;
        const b = this.b / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h: number, s: number;
        const l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
                default: h = 0;
            }
            h /= 6;
        }

        return { h: h * 360, s: s * 100, l: l * 100 };
    }

    public lerp(other: Color, t: number): Color {
        t = MathUtils.clamp01(t);
        return new Color(
            MathUtils.lerp(this.r, other.r, t),
            MathUtils.lerp(this.g, other.g, t),
            MathUtils.lerp(this.b, other.b, t),
            MathUtils.lerp(this.a, other.a, t)
        );
    }

    public multiply(other: Color): Color {
        return new Color(
            (this.r * other.r) / 255,
            (this.g * other.g) / 255,
            (this.b * other.b) / 255,
            this.a * other.a
        );
    }

    public add(other: Color): Color {
        return new Color(
            this.r + other.r,
            this.g + other.g,
            this.b + other.b,
            this.a + other.a
        );
    }

    public equals(other: Color): boolean {
        return this.r === other.r && this.g === other.g && this.b === other.b && this.a === other.a;
    }

    public static fromHex(hex: string): Color {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? new Color(
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ) : new Color();
    }

    public static fromHSL(h: number, s: number, l: number, a: number = 1): Color {
        h = h / 360;
        s = s / 100;
        l = l / 100;

        const hue2rgb = (p: number, q: number, t: number): number => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        let r: number, g: number, b: number;

        if (s === 0) {
            r = g = b = l;
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return new Color(r * 255, g * 255, b * 255, a);
    }

    public static lerp(a: Color, b: Color, t: number): Color {
        return a.lerp(b, t);
    }

    public static readonly WHITE = new Color(255, 255, 255);
    public static readonly BLACK = new Color(0, 0, 0);
    public static readonly RED = new Color(255, 0, 0);
    public static readonly GREEN = new Color(0, 255, 0);
    public static readonly BLUE = new Color(0, 0, 255);
    public static readonly YELLOW = new Color(255, 255, 0);
    public static readonly CYAN = new Color(0, 255, 255);
    public static readonly MAGENTA = new Color(255, 0, 255);
    public static readonly ORANGE = new Color(255, 165, 0);
    public static readonly PURPLE = new Color(128, 0, 128);
    public static readonly PINK = new Color(255, 192, 203);
    public static readonly BROWN = new Color(165, 42, 42);
    public static readonly GRAY = new Color(128, 128, 128);
    public static readonly LIGHT_GRAY = new Color(211, 211, 211);
    public static readonly DARK_GRAY = new Color(64, 64, 64);
    public static readonly TRANSPARENT = new Color(0, 0, 0, 0);
    public static readonly AQUA = new Color(0, 255, 255);
    public static readonly LIME = new Color(0, 255, 0);
    public static readonly NAVY = new Color(0, 0, 128);
    public static readonly TEAL = new Color(0, 128, 128);
    public static readonly OLIVE = new Color(128, 128, 0);
    public static readonly SILVER = new Color(192, 192, 192);
    public static readonly GOLD = new Color(255, 215, 0);
    public static readonly INDIGO = new Color(75, 0, 130);
    public static readonly VIOLET = new Color(238, 130, 238);
    public static readonly MAROON = new Color(128, 0, 0);
    public static readonly CORAL = new Color(255, 127, 80);
    public static readonly SALMON = new Color(250, 128, 114);
    public static readonly SKY_BLUE = new Color(135, 206, 235);
    public static readonly GOLDENROD = new Color(218, 165, 32);
    public static readonly DARK_RED = new Color(139, 0, 0);
    public static readonly DARK_GREEN = new Color(0, 100, 0);
    public static readonly DARK_BLUE = new Color(0, 0, 139);
    public static readonly DARK_ORANGE = new Color(255, 140, 0);
    public static readonly DARK_CYAN = new Color(0, 139, 139);
    public static readonly DARK_MAGENTA = new Color(139, 0, 139);
    public static readonly DARK_YELLOW = new Color(128, 128, 0);
    public static readonly LIGHT_BLUE = new Color(173, 216, 230);
    public static readonly LIGHT_GREEN = new Color(144, 238, 144);
    public static readonly LIGHT_PINK = new Color(255, 182, 193);
    public static readonly LIGHT_YELLOW = new Color(255, 255, 224);
    public static readonly LIGHT_ORANGE = new Color(255, 228, 181);
    public static readonly LIGHT_PURPLE = new Color(221, 160, 221);
    public static readonly LIGHT_BROWN = new Color(210, 180, 140);
}