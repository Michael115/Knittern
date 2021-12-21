import React, { useEffect, useRef } from "react";
import {
  Canvas,
  Color,
  Pattern,
  Point,
  Stitch,
} from "../interfaces/interfaces";
import { ColorPicker } from "./colorPicker";

const floor = (floor: number, nearest: number) => {
  return Math.floor(floor / nearest) * nearest;
};

const freshStitches = (
  width: number,
  height: number,
  rowSize: number,
  colSize: number
) =>
  new Array<Stitch>(width / rowSize)
    .fill({ color: "nodraw" })
    .map(() => new Array<Stitch>(height / colSize).fill({ color: "nodraw" }));

export const PatternCanvas: React.FC<Canvas> = ({ width, height }) => {
  const rowSize = 20;
  const colSize = 20;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseDownRef = useRef(false);
  const currentColor = useRef<string>("nodraw");

  const colors = new Map<string, string>([]);

  const pattern = useRef<Pattern>({
    stitches: freshStitches(width, height, rowSize, colSize),
  });

  const pointToGrid = (pt: Point, rowSize: number, colSize: number): Point => {
    return {
      x: floor(pt.x, rowSize) / rowSize,
      y: floor(pt.y, colSize) / colSize,
    };
  };

  const drawLine = (
    ctx: CanvasRenderingContext2D,
    ptStart: Point,
    ptEnd: Point,
    bold: boolean
  ) => {
    ctx.beginPath();
    ctx.moveTo(ptEnd.x, ptEnd.y);
    ctx.lineTo(ptStart.x, ptStart.y);
    ctx.strokeStyle = `rgb(${0}, ${0}, ${0})`;

    if (bold) {
      ctx.lineWidth = 2.4;
    } else {
      ctx.lineWidth = 1;
    }

    ctx.lineCap = "square";
    ctx.stroke();
    ctx.closePath();
  };

  const drawPattern = (ctx: CanvasRenderingContext2D, pattern: Pattern) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    for (let y = 0; y < pattern.stitches.length; y++) {
      const row = pattern.stitches[y];

      for (let x = 0; x < row.length; x++) {
        const stitch = row[x];

        var pt = { x: x * rowSize, y: y * colSize };

        fillGridRectangle(ctx, pt, stitch.color);
      }
    }

    for (let index = 0; index <= width / colSize; index++) {
      drawLine(
        ctx,
        { x: index * colSize, y: 0 },
        { x: index * colSize, y: height },
        index % 10 == 0
      );
    }

    for (let index = 0; index <= height / rowSize; index++) {
      drawLine(
        ctx,
        { x: 0, y: index * rowSize },
        { x: width, y: index * rowSize },
        index % 10 == 0
      );
    }
  };

  const fillGridRectangle = (
    ctx: CanvasRenderingContext2D,
    pt: Point,
    colorType: string
  ) => {
    if (colorType !== "nodraw") {
      var colorLookup = colors.get(colorType);
      ctx.fillStyle = colorLookup;
      ctx.fillRect(
        floor(pt.x, rowSize),
        floor(pt.y, colSize),
        rowSize,
        colSize
      );
    }
  };

  const adjustPointSpace = (pt: Point): Point => {
    var rect = canvasRef.current!.getBoundingClientRect();
    return { x: pt.x - rect.left, y: pt.y - rect.top };
  };

  // Init Canvas
  useEffect(() => {
    if (canvasRef.current) {
      const context = canvasRef.current.getContext("2d")!;
      //context.scale(scale, scale);

      const ctx = canvasRef.current.getContext("2d");

      for (let index = 0; index <= width / colSize; index++) {
        drawLine(
          ctx,
          { x: index * colSize, y: 0 },
          { x: index * colSize, y: height },
          index % 10 == 0
        );
      }

      for (let index = 0; index <= height / rowSize; index++) {
        drawLine(
          ctx,
          { x: 0, y: index * rowSize },
          { x: width, y: index * rowSize },
          index % 10 == 0
        );
      }

      drawPattern(ctx, pattern.current);
    }
  });

  const mouseDraw = (ctx: CanvasRenderingContext2D, pt: Point) => {
    var adjust = adjustPointSpace(pt);
    var gridPosition = pointToGrid(adjust, rowSize, colSize);
    pattern.current.stitches[gridPosition.y][gridPosition.x] = {
      color: currentColor.current,
    };

    drawPattern(ctx, pattern.current);
  };

  const mouseMove = (e: React.MouseEvent) => {
    if (canvasRef.current && mouseDownRef.current) {
      const ctx = canvasRef.current.getContext("2d")!;
      mouseDraw(ctx, { x: e.clientX, y: e.clientY });
    }
  };

  const mouseDown = (e: React.MouseEvent) => {
    mouseDownRef.current = true;
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d")!;
      mouseDraw(ctx, { x: e.clientX, y: e.clientY });
    }
  };

  const mouseLeave = (e: React.MouseEvent) => {
    mouseDownRef.current = false;
  };

  const colorPickerClick = (color: string, colorName: string) => {
    colors.set(colorName, color);
    currentColor.current = colorName;

    const ctx = canvasRef.current.getContext("2d")!;
    drawPattern(ctx, pattern.current);
  };

  function download() {
    var canvas = document.getElementById("canvas");
    var url = canvasRef.current.toDataURL("image/png");
    var link = document.createElement("a");
    link.download = "filename.png";
    link.href = url;
    link.click();
  }

  return (
    <div className={"flex flex-row gap-x-4"}>
      <div className="flex flex-col gap-y-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => download()}
        >
          Download
        </button>
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => (currentColor.current = "nodraw")}
        >
          Clear
        </button>
      </div>
      <div>
        <canvas
          onMouseDown={mouseDown}
          onMouseMove={mouseMove}
          onMouseUp={mouseLeave}
          onMouseLeave={mouseLeave}
          className={"cursor-crosshair"}
          ref={canvasRef}
          width={width}
          height={height}
        ></canvas>
      </div>
      <div className={"flex flex-col gap-y-2 print:hidden"}>
        {/* <button
          className="bg-red-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => (currentColor.current = "nodraw")}
        >
          Clear
        </button> */}
        {[
          "0",
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9",
          "10",
          "11",
          "12",
          "13",
          "14",
        ].map((i) => (
          <ColorPicker
            key={i}
            width={200}
            height={200}
            onClick={(color) => colorPickerClick(color, i)}
          ></ColorPicker>
        ))}
      </div>
    </div>
  );
};
