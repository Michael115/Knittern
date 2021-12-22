import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ColorPickerParams,
  ColorPickerPosition,
  Point,
} from "../interfaces/interfaces";

export const ColorPicker: React.FC<ColorPickerParams> = ({
  width,
  height,
  initialColorPosition,
  initialColorRgb,
  forceloaded,
  onClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chosenColorCanvasRef = useRef<HTMLCanvasElement>(null);
  const colorBarCanvasRef = useRef<HTMLCanvasElement>(null);

  const mouseDownRef = useRef(false);
  const mouseColorBarDownRef = useRef(false);

  const [chosenColor, setChosenColor] = useState<string>(initialColorRgb);
  const [colorPosition, setColorPosition] =
    useState<ColorPickerPosition>(initialColorPosition);

  const [colorByPicker, setColorByPicker] = useState<boolean>(false);

  const [force, setForce] = useState<number>(0);

  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!colorByPicker || force != forceloaded) {
      setChosenColor(initialColorRgb);
      setColorPosition(initialColorPosition);
      setForce(forceloaded);
    }

    drawAll();
  });

  const close = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (event.target === event.currentTarget) {
        setOpen(false);
      }
    },
    []
  );

  const divRef = useRef(null);

  const adjustPointSpace = (canvas: HTMLCanvasElement, pt: Point): Point => {
    var rect = canvas!.getBoundingClientRect();
    return { x: pt.x - rect.left, y: pt.y - rect.top };
  };

  const drawChosenColor = () => {
    if (chosenColorCanvasRef.current) {
      const ctx = chosenColorCanvasRef.current.getContext("2d");

      ctx.fillStyle = getCirclePositionColor();
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  };

  const draw = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");

      let gradientColor = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
      gradientColor.addColorStop(0, "rgba(255,255,255,1)");
      gradientColor.addColorStop(1, getColorBar());
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
      ctx.arc(colorPosition.color.x, colorPosition.color.y, 10, 0, 2 * Math.PI);
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
      ctx.arc(colorPosition.bar.x, ctx.canvas.height / 2, 10, 0, 2 * Math.PI);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "#000";
      ctx.stroke();
    }
  };

  const drawAll = () => {
    drawColorBar();
    draw();
    drawChosenColor();
  };

  const getChosenColor = () => {
    if (chosenColorCanvasRef.current) {
      const ctx = chosenColorCanvasRef.current.getContext("2d");

      const pt = { x: ctx.canvas.width / 2, y: ctx.canvas.height / 2 };
      const pixel = ctx.getImageData(pt.x, pt.y, 1, 1)["data"];
      const rgba = `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, 1)`;

      setChosenColor(rgba);
      return rgba;
    }
  };

  const getCirclePositionColor = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");

      const pt = colorPosition.color;
      const pixel = ctx.getImageData(pt.x, pt.y, 1, 1)["data"];
      const rgba = `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, 1)`;

      return rgba;
    }

    return chosenColor;
  };

  const getColorBar = () => {
    if (colorBarCanvasRef.current) {
      console.log("Set color bar", colorPosition);
      const colorBarCtx = colorBarCanvasRef.current.getContext("2d");

      const pt = colorPosition.bar;

      const pixel = colorBarCtx.getImageData(pt.x, pt.y, 1, 1)["data"];
      const rgba = `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, 1)`;

      return rgba;
    }
  };

  const mouseDown = (e: React.MouseEvent) => {
    mouseDownRef.current = true;
    var pt = adjustPointSpace(canvasRef.current, {
      x: e.clientX,
      y: e.clientY,
    });
    colorPosition.color = pt;

    setColorByPicker(true);
    drawAll();
  };

  const mouseMove = (e: React.MouseEvent) => {
    if (mouseDownRef.current) {
      var pt = adjustPointSpace(canvasRef.current, {
        x: e.clientX,
        y: e.clientY,
      });
      colorPosition.color = pt;

      drawAll();
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
    setColorByPicker(true);

    var pt = adjustPointSpace(colorBarCanvasRef.current, {
      x: e.clientX,
      y: e.clientY,
    });
    colorPosition.bar = pt;

    drawAll();
  };

  const mouseMoveColorBar = (e: React.MouseEvent) => {
    if (mouseColorBarDownRef.current) {
      var pt = adjustPointSpace(colorBarCanvasRef.current, {
        x: e.clientX,
        y: e.clientY,
      });
      colorPosition.bar = pt;

      drawAll();
    }
  };

  const handleClickOutside = (event: any) => {
    if (divRef.current && !divRef.current.contains(event.target)) {
      document.removeEventListener("mousedown", handleClickOutside);
      onClick(getChosenColor(), colorPosition);
      setOpen(false);
    }
  };

  const openPicker = (e: React.MouseEvent) => {
    setOpen(!open);

    setColorByPicker(true);

    if (!open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
      onClick(getChosenColor(), colorPosition);
      setOpen(false);
    }
  };

  return (
    <div ref={divRef} className={"flex flex-col"}>
      <div className="flex flex-row ">
        <canvas
          className={`flex cursor-pointer`}
          onClick={() => onClick(getChosenColor(), colorPosition)}
          ref={chosenColorCanvasRef}
          width={width}
          height={55}
        ></canvas>
        <button
          onClick={openPicker}
          className="bg-gray-500 hover:bg-gray-700 text-white text-sm font-bold py-1 px-2 rounded  w-14"
        >
          {!open ? "Edit" : "Close"}
        </button>
      </div>
      {open && (
        <div className={" flex-col"}>
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

          <canvas
            onMouseDown={mouseDownColorBar}
            onMouseMove={mouseMoveColorBar}
            onMouseUp={mouseLeaveBar}
            onMouseLeave={mouseLeaveBar}
            className={"cursor-crosshair"}
            ref={colorBarCanvasRef}
            width={width}
            height={30}
          ></canvas>
        </div>
      )}
    </div>
  );
};
