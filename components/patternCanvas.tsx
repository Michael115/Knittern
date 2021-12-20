import { useEffect, useRef } from "react";
import { Canvas, Point } from "../interfaces/interfaces";


const drawLine = (ctx: CanvasRenderingContext2D, ptStart: Point, ptEnd: Point) => {

  ctx.beginPath();
  ctx.moveTo(ptEnd.x, ptEnd.y);
  ctx.lineTo(ptStart.x, ptStart.y);
  ctx.strokeStyle = `rgb(${0}, ${0}, ${0})`;
  ctx.lineWidth = 1;
  ctx.lineCap = "square";
  ctx.stroke();
  ctx.closePath();
}

export const PatternCanvas: React.FC<Canvas> = ({width, height, scale}) => {

    const gridSpacing = width/30;
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseDownRef = useRef(false);

    
    // Init Canvas
    useEffect(() => {
      if (canvasRef.current) {
        const context = canvasRef.current.getContext("2d")!;
        context.scale(scale, scale);

      
        console.log("Draw once")
       const ctx =canvasRef.current.getContext("2d");

       ctx.clearRect(0, 0, ctx.canvas.width / scale, ctx.canvas.height / scale);

       for (let index = 0; index <= (width/gridSpacing); index++) {
        
         drawLine(ctx, {x: index*gridSpacing, y: 0}, {x: index*gridSpacing, y: height});
         drawLine(ctx, {x: 0, y: index*gridSpacing}, {x: width, y: index*gridSpacing});
       }

      }
    }, [scale, height, width]);
    
   
    const mouseDown = (e: React.MouseEvent) => { 
      mouseDownRef.current = true;
      if (canvasRef.current) {
        console.log({ x: e.clientX, y: e.clientY });
      }
    };

    return (
      <div className={"flex flex-col bg-white divide-y relative"}>
        <canvas
          onMouseDown={mouseDown}
          className={"cursor-crosshair z-0"}
          ref={canvasRef}
          width={width * scale}
          height={height * scale}
        ></canvas>
      </div>
    );
  }