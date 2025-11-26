'use client';

import { SENSORY_DATA } from "@/lib/constants";
import { Item, Marker, Shape, Point } from "@/lib/types";
import { cn } from "@/lib/utils";
import React, { forwardRef } from "react";
import { EditHandles } from './EditHandles';
import { ZONE_COLORS } from "@/lib/zone-colors";

type MapAreaProps = {
  mapImage: string | null;
  imageDimensions: { width: number, height: number } | null;
  items: Item[];
  visibleLayers: Record<string, boolean>;
  onItemSelect: (item: Item | null) => void;
  drawingShape: any;
  selectedItem: Item | null;
  editingItemId: string | null;
  onItemDrag: (id: string, newPos: Point) => void;
  onHandleDrag: (handleIndex: number, newPos: Point) => void;
} & React.HTMLAttributes<HTMLDivElement>;

export const MapArea = forwardRef<HTMLDivElement, MapAreaProps>(({
  mapImage,
  imageDimensions,
  items,
  visibleLayers,
  onItemSelect,
  drawingShape,
  selectedItem,
  editingItemId,
  onItemDrag,
  onHandleDrag,
  ...props
}, ref) => {
  
  const renderMarker = (marker: Marker) => {
    if (!visibleLayers[marker.type]) return null;
    const { icon: Icon } = SENSORY_DATA[marker.type];
    const isSelected = selectedItem?.id === marker.id;

    const itemStyle: React.CSSProperties = {
        position: 'absolute',
        left: marker.x,
        top: marker.y,
        transform: 'translate(-50%, -50%)',
        cursor: 'pointer',
      };

    return (
      <div
        key={marker.id}
        style={itemStyle}
        onClick={(e) => { 
          e.stopPropagation();
          onItemSelect(marker);
        }}
        onMouseDown={(e) => { e.stopPropagation(); }}
        data-item-id={marker.id}
        data-item-type="marker"
      >
        <div className={cn(
            "p-1.5 rounded-full shadow-lg transition-all", 
            !marker.color && SENSORY_DATA[marker.type].className,
            isSelected && 'ring-2 ring-offset-2 ring-primary ring-offset-background'
            )}
            style={{ backgroundColor: marker.color }}
          >
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    );
  };
  
  const renderShape = (shape: Shape) => {
    if (!visibleLayers[shape.type]) return null;

    const isSelected = selectedItem?.id === shape.id;
    const isEditing = editingItemId === shape.id;
    const color = shape.color || ZONE_COLORS[0].color;
    const fill = color === 'url(#extreme-pattern)' ? color : color;
    
    return (
        <g 
          key={shape.id}
          onClick={(e) => { e.stopPropagation(); onItemSelect(shape); }}
          onMouseDown={(e) => { e.stopPropagation(); }}
          data-item-id={shape.id}
          data-item-type="shape"
          style={{ cursor: 'pointer' }}
        >
            {shape.shape === 'rectangle' && (
                <rect
                    x={shape.x}
                    y={shape.y}
                    width={shape.width}
                    height={shape.height}
                    fill={fill}
                    opacity={isSelected ? 0.6 : 0.4}
                    stroke={isSelected ? 'hsl(var(--primary))' : color.startsWith('url') ? 'black' : color}
                    strokeWidth={2}
                />
            )}
            {shape.shape === 'circle' && (
                <circle
                    cx={shape.cx}
                    cy={shape.cy}
                    r={shape.radius}
                    fill={fill}
                    opacity={isSelected ? 0.6 : 0.4}
                    stroke={isSelected ? 'hsl(var(--primary))' : color.startsWith('url') ? 'black' : color}
                    strokeWidth={2}
                />
            )}
            {shape.shape === 'polygon' && (
                <polygon
                    points={shape.points.map(p => `${p.x},${p.y}`).join(' ')}
                    fill={fill}
                    opacity={isSelected ? 0.6 : 0.4}
                    stroke={isSelected ? 'hsl(var(--primary))' : color.startsWith('url') ? 'black' : color}
                    strokeWidth={2}
                />
            )}
            {isEditing && <EditHandles shape={shape} onItemDrag={onItemDrag} onHandleDrag={onHandleDrag} />}
        </g>
    );
  }

  const renderDrawingShape = () => {
    if (!drawingShape) return null;
    const style: React.CSSProperties = {
      stroke: 'hsl(var(--primary))',
      strokeWidth: 2,
      strokeDasharray: '5,5',
      fill: 'hsla(var(--primary), 0.1)',
      pointerEvents: 'none'
    };
    if (drawingShape.shape === 'rectangle') {
      return <rect x={drawingShape.x} y={drawingShape.y} width={drawingShape.width} height={drawingShape.height} style={style} />;
    }
    if (drawingShape.shape === 'circle') {
      return <circle cx={drawingShape.cx} cy={drawingShape.cy} r={drawingShape.radius} style={style} />;
    }
    if (drawingShape.shape === 'polygon' && drawingShape.points.length > 0) {
      return (
        <>
          <polyline points={drawingShape.points.map((p: Point) => `${p.x},${p.y}`).join(' ')} style={{...style, fill: 'none'}} />
          {drawingShape.points.map((p: Point, i: number) => (
            <circle key={i} cx={p.x} cy={p.y} r={3} fill="hsl(var(--primary))" style={{pointerEvents: 'none'}} />
          ))}
        </>
      );
    }
    return null;
  }

  const mapStyle: React.CSSProperties = imageDimensions ? {
    width: imageDimensions.width,
    height: imageDimensions.height,
  } : {};

  return (
    <main className="flex-1 p-4 bg-muted/40 overflow-auto flex items-center justify-center">
      <div 
        ref={ref}
        className="relative shadow-lg rounded-lg overflow-hidden border cursor-crosshair"
        style={mapStyle}
        {...props}
        onClick={() => onItemSelect(null)}
      >
        {mapImage ? (
          <>
            <img src={mapImage} alt="Floor Plan" className="block w-full h-full object-contain pointer-events-none select-none" />
            <div className="absolute inset-0">
                <svg width="100%" height="100%">
                    <defs>
                        <pattern id="extreme-pattern" patternUnits="userSpaceOnUse" width="8" height="8">
                            <rect width="8" height="8" fill="#DC2626"/>
                            <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" stroke="black" strokeWidth="1" />
                        </pattern>
                    </defs>
                  {items.filter(item => item.shape !== 'marker').map(item => renderShape(item as Shape))}
                  {renderDrawingShape()}
                </svg>
            </div>
            {items.filter(item => item.shape === 'marker').map(item => renderMarker(item as Marker))}
          </>
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center text-center p-8">
            <p className="text-muted-foreground">
              Upload a floor plan to get started.
            </p>
          </div>
        )}
      </div>
    </main>
  );
});

MapArea.displayName = "MapArea";
