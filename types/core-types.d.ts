// Basic geometric types
type Vector2D = {
    x: number;
    y: number;
};

type Rectangle = {
    x: number;
    y: number;
    width: number;
    height: number;
};

type Circle = {
    x: number;
    y: number;
    radius: number;
};

type Size = {
    width: number;
    height: number;
};

type Point = {
    x: number;
    y: number;
};

// Color types
type RGBColor = {
    r: number;
    g: number;
    b: number;
};

type RGBAColor = RGBColor & {
    a: number;
};

type HSLColor = {
    h: number;
    s: number;
    l: number;
};

type ColorValue = string | RGBColor | RGBAColor | HSLColor;

type SerializedData = {
    [key: string]: any;
};