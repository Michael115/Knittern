export interface Canvas {
    width: number,
    height: number,
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
    color: string
}

export interface Pattern {
    stitches: Stitch[][]
}

