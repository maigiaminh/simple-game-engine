type Rectangle = {
    x: number
    y: number
    width: number
    height: number
}

type Circle = {
    x: number
    y: number
    radius: number
}

type Size = {
    width: number
    height: number
}

type Point = {
    x: number
    y: number
}

// Color types
type RGBColor = {
    r: number
    g: number
    b: number
}

export type RGBAColor = RGBColor & {
    a: number
}

export type HSLColor = {
    h: number
    s: number
    l: number
}

export type ColorValue = string | RGBColor | RGBAColor | HSLColor

export type SerializedData = {
    [key: string]: unknown
}
