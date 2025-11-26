'use client';

import { ALL_SENSORY_DATA } from "@/lib/constants";
import { Item, Marker, Shape, Point } from "@/lib/types";
import { cn } from "@/lib/utils";
import React, { forwardRef, useState, useEffect, useRef } from "react";
import { EditHandles } from './EditHandles';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Button } from "../ui/button";
import { Upload } from "lucide-react";
import { Input } from "../ui/input";


type MapAreaProps = {
  mapImage: string | null;
  imageDimensions: { width: number, height: number } | null;
  items: Item[];
  visibleLayers: Record<string, boolean>;
  drawingShape: any;
  selectedItem: Item | null;
  editingItemId: string | null;
  cursorPos: Point;
  showPolygonTooltip: boolean;
  onMapUpload: (file: File) => void;
  readOnly?: boolean;
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'onItemSelect'>;

export const MapArea = forwardRef<HTMLDivElement, MapAreaProps>(({
  mapImage,
  imageDimensions,
  items,
  visibleLayers,
  drawingShape,
  selectedItem,
  editingItemId,
  cursorPos,
  showPolygonTooltip,
  onMapUpload,
  readOnly = false,
  ...props
}, ref) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onMapUpload(file);
    }
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const renderMarker = (marker: Marker) => {
    if (!visibleLayers[marker.type]) return null;
    const { icon: Icon } = ALL_SENSORY_DATA[marker.type];
    const isSelected = selectedItem?.id === marker.id;

    const itemStyle: React.CSSProperties = {
        position: 'absolute',
        left: marker.x,
        top: marker.y,
        transform: 'translate(-50%, -50%)',
        cursor: readOnly ? 'default' : 'pointer',
      };

    return (
      <div
        key={marker.id}
        style={itemStyle}
        data-item-id={marker.id}
        data-item-type="marker"
      >
        <div className={cn(
            "p-1.5 rounded-full shadow-lg transition-all", 
            isSelected && 'ring-2 ring-offset-2 ring-primary ring-offset-background'
            )}
            style={{ backgroundColor: marker.color || ALL_SENSORY_DATA[marker.type].color }}
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
    const color = shape.color || ALL_SENSORY_DATA[shape.type].color;
    const fill = color;
    
    return (
        <g 
          key={shape.id}
          data-item-id={shape.id}
          data-item-type="shape"
          style={{ cursor: readOnly ? 'default' : 'pointer' }}
        >
            {shape.shape === 'rectangle' && (
                <rect
                    x={shape.x}
                    y={shape.y}
                    width={shape.width}
                    height={shape.height}
                    fill={fill}
                    fillOpacity={isSelected || isEditing ? 0.6 : 0.4}
                    stroke={isSelected || isEditing ? 'hsl(var(--primary))' : color}
                    strokeWidth={2}
                />
            )}
            {shape.shape === 'circle' && (
                <circle
                    cx={shape.cx}
                    cy={shape.cy}
                    r={shape.radius}
                    fill={fill}
                    fillOpacity={isSelected || isEditing ? 0.6 : 0.4}
                    stroke={isSelected || isEditing ? 'hsl(var(--primary))' : color}
                    strokeWidth={2}
                />
            )}
            {shape.shape === 'polygon' && (
                <polygon
                    points={shape.points.map(p => `${p.x},${p.y}`).join(' ')}
                    fill={fill}
                    fillOpacity={isSelected || isEditing ? 0.6 : 0.4}
                    stroke={isSelected || isEditing ? 'hsl(var(--primary))' : color}
                    strokeWidth={2}
                />
            )}
            {isEditing && <EditHandles shape={shape} />}
        </g>
    );
  }

  const renderDrawingShape = () => {
    if (!drawingShape) return null;
    const style = {
      stroke: 'hsl(var(--primary))',
      strokeWidth: 2,
      strokeDasharray: '5,5',
      fill: 'hsl(var(--primary))',
      fillOpacity: 0.2,
      pointerEvents: 'none' as const
    };
    if (drawingShape.shape === 'rectangle') {
      return <rect x={drawingShape.x} y={drawingShape.y} width={drawingShape.width} height={drawingShape.height} style={style} />;
    }
    if (drawingShape.shape === 'circle') {
      return <circle cx={drawingShape.cx} cy={drawingShape.cy} r={drawingShape.radius} style={style} />;
    }
    if (drawingShape.shape === 'polygon' && drawingShape.points.length > 0) {
      const currentPoints = drawingShape.points.map((p: Point) => `${p.x},${p.y}`).join(' ');
      return (
        <>
           {drawingShape.points.length > 2 && (
             <line
                x1={drawingShape.points[drawingShape.points.length - 1].x}
                y1={drawingShape.points[drawingShape.points.length - 1].y}
                x2={drawingShape.points[0].x}
                y2={drawingShape.points[0].y}
                style={{ ...style, fill: 'none' }}
              />
          )}
          <polyline points={currentPoints} style={{...style, fill: 'none', strokeDasharray: 'none'}} />
          <line
            x1={drawingShape.points[drawingShape.points.length - 1].x}
            y1={drawingShape.points[drawingShape.points.length - 1].y}
            x2={cursorPos.x}
            y2={cursorPos.y}
            style={{ ...style, fill: 'none'}}
          />
          {drawingShape.points.map((p: Point, i: number) => (
             <rect
              key={i}
              x={p.x - 4}
              y={p.y - 4}
              width={8}
              height={8}
              fill={i === 0 ? "hsl(var(--primary))" : "white"}
              stroke="hsl(var(--primary))"
              strokeWidth="1"
              style={{pointerEvents: 'none'}}
            />
          ))}
        </>
      );
    }
    return null;
  }

  const mapStyle: React.CSSProperties = imageDimensions ? {
    width: imageDimensions.width,
    height: imageDimensions.height,
  } : { width: '100%', height: '100%'};

  return (
    <main className="flex-1 p-4 bg-muted/40 overflow-auto flex items-center justify-center">
      <TooltipProvider>
      <div 
        ref={ref}
        className={cn(
          "relative shadow-lg rounded-lg overflow-hidden border",
           mapImage && !readOnly && 'cursor-crosshair',
           readOnly && 'cursor-default',
        )}
        style={mapStyle}
        {...props}
      >
        {mapImage ? (
          <>
            <img src={mapImage} alt="Floor Plan" className="block w-full h-full object-contain pointer-events-none select-none" />
            <div className="absolute inset-0">
                <Tooltip open={showPolygonTooltip}>
                  <TooltipTrigger asChild>
                     <div style={{ position: 'absolute', left: cursorPos.x, top: cursorPos.y, width: 1, height: 1 }} />
                  </TooltipTrigger>
                  <TooltipContent side="top" align="center">
                    <p>Click first point to close this shape.</p>
                  </TooltipContent>
                </Tooltip>
                <svg width="100%" height="100%">
                  {items.filter(item => item.shape !== 'marker').map(item => renderShape(item as Shape))}
                  {renderDrawingShape()}
                </svg>
            </div>
            {items.filter(item => item.shape === 'marker').map(item => renderMarker(item as Marker))}
          </>
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center text-center p-8">
             <div className="flex flex-col items-center gap-4">
              <p className="text-muted-foreground max-w-xs">
                To get started, upload a floor plan image (PNG, JPG). This will be the canvas for your sensory map.
              </p>
              <Input
                type="file"
                id="map-upload-main"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
              />
              <Button onClick={() => fileInputRef.current?.click()} size="lg" disabled={readOnly}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Floor Plan
              </Button>
            </div>
          </div>
        )}
      </div>
      </TooltipProvider>
    </main>
  );
});

MapArea.displayName = "MapArea";