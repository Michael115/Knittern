import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Canvas,
  ChosenColor,
  Color,
  Pattern,
  Point,
  Stitch,
} from "../interfaces/interfaces";
import { ColorPicker } from "./colorPicker";
import Image from "next/image";

const NODRAW = "n";
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
    .fill({ c: NODRAW })
    .map(() => new Array<Stitch>(height / colSize).fill({ c: NODRAW }));

export const PatternCanvas: React.FC<Canvas> = ({ width, height }) => {
  const rowSize = 18;
  const colSize = 18;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseDownRef = useRef(false);
  const currentColorType = useRef<string>(NODRAW);

  const [force, setForce] = useState<number>(0);

  const [pattern, setPattern] = useState<Pattern>({
    name: null,
    colors: Object.fromEntries(
      new Map<string, ChosenColor>(
        Array.from(Array(13).keys()).map((i) => [
          i.toString(),
          {
            colorRgb: "rgba(0,0,0,1)",
            locked: false,
            colorCoord: { color: { x: 120, y: 50 }, bar: { x: 100, y: 0 } },
          },
        ])
      )
    ),
    stitches: freshStitches(width, height, rowSize, colSize),
  });

  const [saved, setSaved] = useState<Pattern[]>([]);

  useEffect(() => {
    setSaved(getSaved());
  }, []);

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
    index: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(ptEnd.x, ptEnd.y);
    ctx.lineTo(ptStart.x, ptStart.y);
    ctx.strokeStyle = `rgb(${60}, ${60}, ${60})`;

    if (index % 30 == 0) {
      ctx.lineWidth = 2.5;
    } else if (index % 10 == 0) {
      ctx.lineWidth = 2;
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

        fillGridRectangle(ctx, pt, stitch.c);
      }
    }

    for (let index = 0; index <= width / colSize; index++) {
      drawLine(
        ctx,
        { x: index * colSize, y: 0 },
        { x: index * colSize, y: height },
        index
      );
    }

    for (let index = 0; index <= height / rowSize; index++) {
      drawLine(
        ctx,
        { x: 0, y: index * rowSize },
        { x: width, y: index * rowSize },
        index
      );
    }
  };

  const fillGridRectangle = (
    ctx: CanvasRenderingContext2D,
    pt: Point,
    colorType: string
  ) => {
    if (colorType !== NODRAW) {
      var colorLookup = pattern.colors[colorType];

      ctx.fillStyle = colorLookup.colorRgb;
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
          index
        );
      }

      for (let index = 0; index <= height / rowSize; index++) {
        drawLine(
          ctx,
          { x: 0, y: index * rowSize },
          { x: width, y: index * rowSize },
          index
        );
      }

      drawPattern(ctx, pattern);
    }
  });

  const mouseDraw = (ctx: CanvasRenderingContext2D, pt: Point) => {
    var adjust = adjustPointSpace(pt);
    var gridPosition = pointToGrid(adjust, rowSize, colSize);

    pattern.stitches[gridPosition.y][gridPosition.x] = {
      c: currentColorType.current,
    };

    drawPattern(ctx, pattern);
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

  const colorPickerClick = (color: ChosenColor, colorName: string) => {
    pattern.colors[colorName] = color;

    currentColorType.current = colorName;

    const ctx = canvasRef.current.getContext("2d")!;
    drawPattern(ctx, pattern);
  };

  const load = (name: string) => {
    setSaved(getSaved());

    var newPattern = saved.filter((n) => name == n.name)[0];
    setPattern(newPattern);

    const ctx = canvasRef.current.getContext("2d")!;
    drawPattern(ctx, pattern);

    setForce((x) => x + 1);
  };

  const save = () => {
    if (saved.length > 0) {
      const sortedBiggestName = saved[0].name;
      const num = parseInt(sortedBiggestName.slice(8, 12));
      pattern.name = "pattern-" + String(num + 1).padStart(4, "0");
    } else {
      pattern.name = "pattern-" + String(0).padStart(4, "0");
    }

    localStorage.setItem(pattern.name, JSON.stringify(pattern));

    setSaved(getSaved());
  };

  const deletePattern = (name: string) => {
    localStorage.removeItem(name);
    setSaved(getSaved());
  };

  const getSaved = () => {
    if (typeof window !== "undefined") {
      const keys = Object.keys(localStorage);
      const i = keys.length;

      var patterns = Object.keys(localStorage)
        .filter((f) => f.startsWith("pattern"))
        .map((m) => JSON.parse(localStorage.getItem(m)) as Pattern);

      return patterns.sort((a, b) =>
        a.name > b.name ? -1 : b.name > a.name ? 1 : 0
      );
    }
    return [];
  };

  const download = () => {
    var url = canvasRef.current.toDataURL("image/png");
    var link = document.createElement("a");
    link.download = `pattern-${new Date().toISOString()}.png`;
    link.href = url;
    link.click();
  };

  return (
    <div className={"flex flex-row gap-x-4"}>
      <div className="flex flex-col gap-y-4">
        <div className="flex flex-col items-center justify-center text-center">
          <div
            style={{ fontFamily: "Rokkitt" }}
            className="flex px-4 bg-blue items-center justify-center text-gray-text text-4xl"
          >
            Knittern
          </div>
          by Michael Gillon
          <a
            className="pt-6"
            href="https://github.com/Michael115/Knittern"
            target="_blank"
            rel="noreferrer"
          >
            View on Github
          </a>
        </div>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={download}
        >
          Download
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={save}
        >
          Save
        </button>

        <div className="flex flex-col items-center gap-y-2">
          {saved.map((x) => (
            <div className="flex flex-row" key={x.name}>
              <button
                onClick={() => load(x.name)}
                className={
                  "flex bg-gray-300 hover:bg-gray-500 font-bold rounded p-2"
                }
              >
                {x.name}
              </button>
              <button
                onClick={() => deletePattern(x.name)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold px-1 rounded"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
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
        <button
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => (currentColorType.current = NODRAW)}
        >
          Eraser
        </button>
        {Object.keys(pattern.colors).map((color, i) => (
          <ColorPicker
            forceloaded={force}
            initialColorPosition={pattern.colors[i.toString()].colorCoord}
            initialColorRgb={pattern.colors[i.toString()].colorRgb}
            key={i}
            width={200}
            height={200}
            onClick={(color, colorCoord) =>
              colorPickerClick(
                { colorRgb: color, locked: false, colorCoord },
                i.toString()
              )
            }
          ></ColorPicker>
        ))}
      </div>
    </div>
  );
};
