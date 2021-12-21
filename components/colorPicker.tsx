import React, { useCallback, useEffect, useRef, useState } from "react";
import { ColorPickerParams, Point } from "../interfaces/interfaces";

export const ColorPicker: React.FC<ColorPickerParams> = ({
  width,
  height,
  onClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chosenColorCanvasRef = useRef<HTMLCanvasElement>(null);
  const colorBarCanvasRef = useRef<HTMLCanvasElement>(null);

  const mouseDownRef = useRef(false);
  const mouseColorBarDownRef = useRef(false);

  const colorbarColor = useRef<string>("rgba(255,0,0,1)");
  const chosenColor = useRef<string>("rgba(0,0,0,1)");

  const chosenColorPosition = useRef<Point>({ x: 150, y: 50 });
  const colorbarPosition = useRef<Point>({ x: 50, y: 0 });

  const [open, setOpen] = useState<boolean>(false);

  const close = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (event.target === event.currentTarget) {
        setOpen(false);
      }
    },
    []
  );

  const adjustPointSpace = (canvas: HTMLCanvasElement, pt: Point): Point => {
    var rect = canvas!.getBoundingClientRect();
    return { x: pt.x - rect.left, y: pt.y - rect.top };
  };

  const drawChosenColor = () => {
    if (chosenColorCanvasRef.current) {
      console.log(chosenColor.current);

      const ctx = chosenColorCanvasRef.current.getContext("2d");

      ctx.fillStyle = chosenColor.current;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  };

  const draw = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");

      let gradientColor = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
      gradientColor.addColorStop(0, "rgba(255,255,255,1)");
      gradientColor.addColorStop(1, colorbarColor.current);
      ctx.fillStyle = gradientColor;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      let gradientV = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
      gradientV.addColorStop(0, "rgba(0,0,0,0)");
      gradientV.addColorStop(1, "rgba(0,0,0,1)");
      ctx.fillStyle = gradientV;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      ctx.beginPath();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 1.5;
      ctx.arc(
        chosenColorPosition.current.x,
        chosenColorPosition.current.y,
        10,
        0,
        2 * Math.PI
      );
      ctx.stroke();
    }
  };

  const drawColorBar = () => {
    if (colorBarCanvasRef.current) {
      const ctx = colorBarCanvasRef.current.getContext("2d");

      let gradientColor = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);

      //hsl(0,100%,50%),hsl(60,100%,50%),hsl(120,100%,50%),hsl(180,100%,50%),hsl(240,100%,50%),hsl(300,100%,50%),hsl(360,100%,50%));

      gradientColor.addColorStop(0, "hsl(0,100%,50%)");
      gradientColor.addColorStop(2 / 7, "hsl(60,100%,50%)");
      gradientColor.addColorStop(3 / 7, "hsl(120,100%,50%)");
      gradientColor.addColorStop(4 / 7, "hsl(180,100%,50%)");
      gradientColor.addColorStop(5 / 7, "hsl(240,100%,50%)");
      gradientColor.addColorStop(6 / 7, "hsl(300,100%,50%)");
      gradientColor.addColorStop(1, "hsl(360,100%,50%)");
      ctx.fillStyle = gradientColor;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      ctx.beginPath();
      ctx.lineWidth = 1.5;
      ctx.arc(
        colorbarPosition.current.x,
        ctx.canvas.height / 2,
        10,
        0,
        2 * Math.PI
      );
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#000";
      ctx.stroke();
    }
  };

  const setChosenColor = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");

      const pt = chosenColorPosition.current;
      const pixel = ctx.getImageData(pt.x, pt.y, 1, 1)["data"];
      const rgba = `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, 1)`;

      if (rgba !== "rgba(0, 0, 0, 1)") {
        chosenColor.current = rgba;
      }

      draw();
      drawChosenColor();
      drawColorBar();
    }
  };

  const setColorBar = () => {
    if (colorBarCanvasRef.current) {
      const colorBarCtx = colorBarCanvasRef.current.getContext("2d");

      const pt = colorbarPosition.current;

      const pixel = colorBarCtx.getImageData(pt.x, pt.y, 1, 1)["data"];
      const rgba = `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, 1)`;

      if (rgba !== "rgba(0, 0, 0, 1)") {
        colorbarColor.current = rgba;
      }

      draw();
      drawColorBar();
    }
  };

  const mouseDown = (e: React.MouseEvent) => {
    mouseDownRef.current = true;
    var pt = adjustPointSpace(canvasRef.current, {
      x: e.clientX,
      y: e.clientY,
    });
    chosenColorPosition.current = pt;

    setChosenColor();
  };

  const mouseMove = (e: React.MouseEvent) => {
    if (mouseDownRef.current) {
      var pt = adjustPointSpace(canvasRef.current, {
        x: e.clientX,
        y: e.clientY,
      });
      chosenColorPosition.current = pt;

      setChosenColor();
    }
  };

  const mouseLeaveBar = (e: React.MouseEvent) => {
    mouseColorBarDownRef.current = false;
  };

  const mouseLeave = (e: React.MouseEvent) => {
    mouseDownRef.current = false;
  };

  const mouseDownColorBar = (e: React.MouseEvent) => {
    mouseColorBarDownRef.current = true;

    var pt = adjustPointSpace(colorBarCanvasRef.current, {
      x: e.clientX,
      y: e.clientY,
    });
    colorbarPosition.current = pt;

    setColorBar();
    setChosenColor();
  };

  const mouseMoveColorBar = (e: React.MouseEvent) => {
    if (mouseColorBarDownRef.current) {
      var pt = adjustPointSpace(colorBarCanvasRef.current, {
        x: e.clientX,
        y: e.clientY,
      });
      colorbarPosition.current = pt;

      setColorBar();
      setChosenColor();
    }
  };

  useEffect(() => {
    setColorBar();
    setChosenColor();

    draw();
    drawColorBar();
    drawChosenColor();
  });

  return (
    <div className={"flex flex-col"}>
      <div className="flex flex-col ">
        <button
          onClick={() => setOpen(!open)}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded"
        >
          {!open ? "Edit Colour" : "Close"}
        </button>
        <canvas
          className={`flex cursor-pointer`}
          onClick={() => onClick(chosenColor.current)}
          ref={chosenColorCanvasRef}
          width={width}
          height={80}
        ></canvas>
      </div>
      {open && (
        <div className={"flex flex-col"}>
          <canvas
            onMouseDown={mouseDown}
            onMouseMove={mouseMove}
            onMouseUp={mouseLeave}
            onMouseLeave={mouseLeave}
            className={"flex cursor-crosshair"}
            ref={canvasRef}
            width={width}
            height={height}
          ></canvas>

          <canvas
            onMouseDown={mouseDownColorBar}
            onMouseMove={mouseMoveColorBar}
            onMouseUp={mouseLeaveBar}
            onMouseLeave={mouseLeaveBar}
            className={"flex cursor-crosshair"}
            ref={colorBarCanvasRef}
            width={width}
            height={30}
          ></canvas>
        </div>
      )}
    </div>
  );
};
