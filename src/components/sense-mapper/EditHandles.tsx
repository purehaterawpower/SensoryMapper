'use client';

import { Shape, Point } from "@/lib/types";
import React from 'react';

type EditHandlesProps = {
  shape: Shape;
};

const getCursorForHandle = (handle: Point, center: Point): string => {
    const angle = Math.atan2(handle.y - center.y, handle.x - center.x) * 180 / Math.PI;

    if (angle > -22.5 && angle <= 22.5) return 'ew-resize'; // Right
    if (angle > 22.5 && angle <= 67.5) return 'nwse-resize'; // Bottom-right (reversed for svg coords)
    if (angle > 67.5 && angle <= 112.5) return 'ns-resize'; // Bottom
    if (angle > 112.5 && angle <= 157.5) return 'nesw-resize'; // Bottom-left (reversed)
    if (angle > 157.5 || angle <= -157.5) return 'ew-resize'; // Left
    if (angle > -157.5 && angle <= -112.5) return 'nwse-resize'; // Top-left (reversed)
    if (angle > -112.5 && angle <= -67.5) return 'ns-resize'; // Top
    if (angle > -67.5 && angle <= -22.5) return 'nesw-resize'; // Top-right (reversed)

    return 'default';
};


export const EditHandles = ({ shape }: EditHandlesProps) => {
  let handles: Point[] = [];
  let center: Point | null = null;
  const handleSize = 8;
  const halfHandle = handleSize / 2;

  if (shape.shape === 'rectangle') {
    const { x, y, width, height } = shape;
    handles = [
      { x, y }, // top-left
      { x: x + width, y }, // top-right
      { x: x + width, y: y + height }, // bottom-right
      { x, y: y + height }, // bottom-left
    ];
    center = { x: x + width / 2, y: y + height / 2 };
  } else if (shape.shape === 'circle') {
    const { cx, cy, radius } = shape;
    handles = [
      { x: cx + radius, y: cy },
      { x: cx, y: cy + radius },
      { x: cx - radius, y: cy },
      { x: cx, y: cy - radius },
    ];
    center = { x: cx, y: cy };
  } else if (shape.shape === 'polygon') {
    handles = shape.points;
    const sum = shape.points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
    center = { x: sum.x / shape.points.length, y: sum.y / shape.points.length };
  }

  return (
    <g>
      {center && handles.map((handle, index) => (
        <rect
          key={index}
          x={handle.x - halfHandle}
          y={handle.y - halfHandle}
          width={handleSize}
          height={handleSize}
          fill="white"
          stroke={shape.color || "hsl(var(--primary))"}
          strokeWidth="1"
          data-handle-id={index}
          style={{ cursor: getCursorForHandle(handle, center as Point) }}
        />
      ))}
      {center && (
         <circle
          cx={center.x}
          cy={center.y}
          r={handleSize / 2}
          fill={shape.color || "hsl(var(--primary))"}
          stroke="white"
          strokeWidth="1"
          data-item-id={shape.id}
          data-item-type="shape-center"
          style={{ cursor: 'move' }}
        />
      )}
    </g>
  );
};
