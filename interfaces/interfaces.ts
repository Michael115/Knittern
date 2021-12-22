export interface Canvas {
    width: number,
    height: number,
}

export interface ColorPickerPosition {
    bar: Point,
    color: Point
}

export interface ChosenColor {
    colorRgb: string,
    locked: boolean,
    colorCoord: ColorPickerPosition 
}

export interface ColorPickerParams {
    width: number,
    height: number,
    initialColorPosition: ColorPickerPosition,
    initialColorRgb: string,
    forceloaded: number,
    onClick: (color: string, colorCoord: ColorPickerPosition) => void,
}

export interface Point {
    x: number,
    y: number
}

export interface Color {
    r: number,
    g: number,
    b: number
}

export interface Stitch  {
    c: string
}

export interface Pattern {
    name: string,
    colors: { [key: string]: ChosenColor; },
    stitches: Stitch[][]
}

