'use client';

import { Shape, Point } from "@/lib/types";
import React from 'react';

type EditHandlesProps = {
  shape: Shape;
};

export const EditHandles = ({ shape }: EditHandlesProps) => {
  let handles: Point[] = [];
  let center: Point | null = null;
  const handleSize = 8;
  const halfHandle = handleSize / 2;

  if (shape.shape === 'rectangle') {
    const { x, y, width, height } = shape;
    handles = [
      { x, y },
      { x: x + width, y },
      { x: x + width, y: y + height },
      { x, y: y + height },
    ];
    center = { x: x + width / 2, y: y + height / 2 };
  } else if (shape.shape === 'circle') {
    const { cx, cy, radius } = shape;
    handles = [
      { x: cx + radius, y: cy } // Just one handle for the radius
    ];
    center = { x: cx, y: cy };
  } else if (shape.shape === 'polygon') {
    handles = shape.points;
    const sum = shape.points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
    center = { x: sum.x / shape.points.length, y: sum.y / shape.points.length };
  }

  return (
    <g>
      {handles.map((handle, index) => (
        <rect
          key={index}
          x={handle.x - halfHandle}
          y={handle.y - halfHandle}
          width={handleSize}
          height={handleSize}
          fill="white"
          stroke="hsl(var(--primary))"
          strokeWidth="1"
          data-handle-id={index}
          style={{ cursor: 'nwse-resize' }}
          onMouseDown={(e) => e.stopPropagation()} // Prevent item drag
        />
      ))}
      {center && (
         <circle
          cx={center.x}
          cy={center.y}
          r={handleSize / 2}
          fill="hsl(var(--primary))"
          stroke="white"
          strokeWidth="1"
          data-item-id={shape.id}
          data-item-type="shape-center"
          style={{ cursor: 'move' }}
          onMouseDown={(e) => e.stopPropagation()}
        />
      )}
    </g>
  );
};
