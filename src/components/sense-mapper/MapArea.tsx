'use client';

import { ALL_SENSORY_DATA, PRACTICAL_AMENITY_TYPES } from "@/lib/constants";
import { Item, Marker, Shape, Point, ActiveTool } from "@/lib/types";
import { cn } from "@/lib/utils";
import React, { forwardRef, useRef } from "react";
import { EditHandles } from './EditHandles';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Button } from "../ui/button";
import { Upload } from "lucide-react";
import { Input } from "../ui/input";
import Image from "next/image";


type MapAreaProps = {
  mapImage: string | null;
  imageDimensions: { width: number, height: number } | null;
  items: Item[];
  visibleLayers: Record<string, boolean>;
  drawingShape: any;
  highlightedItem: Item | null;
  editingItemId: string | null;
  cursorPos: Point;
  showPolygonTooltip: boolean;
  onMapUpload: (file: File) => void;
  transformStyle: React.CSSProperties;
  isPanning: boolean;
  activeTool: ActiveTool;
  readOnly?: boolean;
  zoomLevel: number;
} & React.HTMLAttributes<HTMLDivElement>;

export const MapArea = forwardRef<HTMLDivElement, MapAreaProps>(({
  mapImage,
  imageDimensions,
  items,
  visibleLayers,
  drawingShape,
  highlightedItem,
  editingItemId,
  cursorPos,
  showPolygonTooltip,
  onMapUpload,
  transformStyle,
  isPanning,
  activeTool,
  readOnly = false,
  zoomLevel,
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

  const getCursor = () => {
    if (isPanning) return 'grabbing';
    if (readOnly) return 'default';
    if (activeTool.tool === 'select') return 'grab';
    if (activeTool.tool === 'marker' || activeTool.tool === 'shape') return 'crosshair';
    return 'default';
  }

  const renderMarker = (marker: Marker) => {
    if (!visibleLayers[marker.type]) return null;
    const { icon: Icon } = ALL_SENSORY_DATA[marker.type];
    const isHighlighted = highlightedItem?.id === marker.id;
    const isFacility = PRACTICAL_AMENITY_TYPES.some(t => t === marker.type);

    const scaleFactor = isFacility ? 0.8 + ((marker.size ?? 50) / 100) * 1.2 : 1;
    const iconSize = 20 * scaleFactor;
    const padding = 6 * scaleFactor;

    const itemStyle: React.CSSProperties = {
        position: 'absolute',
        left: marker.x,
        top: marker.y,
        transform: 'translate(-50%, -50%)',
        cursor: isPanning ? 'grabbing' : (activeTool.tool === 'select' ? 'pointer' : 'crosshair'),
      };
      
    const containerStyle: React.CSSProperties = {
        backgroundColor: marker.color || ALL_SENSORY_DATA[marker.type].color,
        padding: `${padding}px`
    }

    return (
      <div
        key={marker.id}
        style={itemStyle}
        data-item-id={marker.id}
        data-item-type="marker"
        className="pointer-events-auto"
      >
        <div className={cn(
            "rounded-full shadow-lg transition-all flex items-center justify-center", 
            isHighlighted && 'ring-2 ring-offset-2 ring-primary ring-offset-background'
            )}
            style={containerStyle}
          >
          <Icon className="text-white" style={{width: iconSize, height: iconSize}} />
        </div>
      </div>
    );
  };
  
  const renderShape = (shape: Shape) => {
    if (!visibleLayers[shape.type]) return null;

    const isHighlighted = highlightedItem?.id === shape.id;
    const isEditing = editingItemId === shape.id;
    const color = shape.color || ALL_SENSORY_DATA[shape.type].color;
    const fill = color;
    
    const commonProps: React.SVGProps<any> = {
        'data-item-id': shape.id,
        'data-item-type': 'shape',
        fill,
        stroke: color,
        strokeWidth: isHighlighted || isEditing ? 3 / zoomLevel : 2 / zoomLevel,
        style: {
            cursor: isPanning ? 'grabbing' : (activeTool.tool === 'select' ? 'pointer' : 'crosshair'),
        },
    };

    return (
        <g key={shape.id} data-item-id={shape.id} data-item-type="shape" className="pointer-events-auto">
              {shape.shape === 'rectangle' && (
                  <rect
                      x={shape.x}
                      y={shape.y}
                      width={shape.width}
                      height={shape.height}
                      {...commonProps}
                      fillOpacity={isHighlighted || isEditing ? 0.5 : 0.3}
                  />
              )}
              {shape.shape === 'circle' && (
                  <circle
                      cx={shape.cx}
                      cy={shape.cy}
                      r={shape.radius}
                      {...commonProps}
                      fillOpacity={isHighlighted || isEditing ? 0.5 : 0.3}
                  />
              )}
              {shape.shape === 'polygon' && (
                  <polygon
                      points={shape.points.map(p => `${p.x},${p.y}`).join(' ')}
                      {...commonProps}
                      fillOpacity={isHighlighted || isEditing ? 0.5 : 0.3}
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
      strokeWidth: 2 / zoomLevel,
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
      const handleSize = 8 / zoomLevel;
      return (
        <>
           {drawingShape.points.length > 3 && (
             <line
                x1={drawingShape.points[drawingShape.points.length - 1].x}
                y1={drawingShape.points[drawingShape.points.length - 1].y}
                x2={drawingShape.points[0].x}
                y2={drawingShape.points[0].y}
                style={{ ...style, fill: 'none' }}
              />
          )}
          <polyline points={currentPoints} style={{...style, fill: 'none', strokeDasharray: 'none'}} />
          {drawingShape.points.length > 0 && (
            <line
                x1={drawingShape.points[drawingShape.points.length - 1].x}
                y1={drawingShape.points[drawingShape.points.length - 1].y}
                x2={cursorPos.x}
                y2={cursorPos.y}
                style={{ ...style, fill: 'none' }}
            />
          )}
          {drawingShape.points.map((p: Point, i: number) => (
             <rect
              key={i}
              x={p.x - handleSize/2}
              y={p.y - handleSize/2}
              width={handleSize}
              height={handleSize}
              fill={i === 0 ? "hsl(var(--primary))" : "white"}
              stroke="hsl(var(--primary))"
              strokeWidth={1 / zoomLevel}
              style={{pointerEvents: 'none'}}
            />
          ))}
        </>
      );
    }
    return null;
  }

  const mapWrapperStyle: React.CSSProperties = imageDimensions ? {
    width: imageDimensions.width,
    height: imageDimensions.height,
  } : { width: '100%', height: '100%'};

  return (
    <div 
      ref={ref}
      className={cn(
        "relative flex-1 bg-muted/40 overflow-hidden flex flex-col",
      )}
      style={{ cursor: getCursor() }}
      {...props}
    >
      <TooltipProvider>
      <div 
        className="relative shadow-lg rounded-lg border bg-muted w-full h-full"
      >
        {mapImage && imageDimensions ? (
          <div className="absolute top-0 left-0 w-full h-full transform-container" style={transformStyle}>
            <div 
              className={cn(
                'absolute top-0 left-0',
              )}
              style={{ width: imageDimensions.width, height: imageDimensions.height, transformOrigin: 'top left' }}
            >
              <Image src={mapImage} alt="Floor Plan" width={imageDimensions.width} height={imageDimensions.height} priority className="block w-full h-full object-contain pointer-events-none select-none" />
              <div className="absolute inset-0 pointer-events-none">
                  <Tooltip open={showPolygonTooltip}>
                    <TooltipTrigger asChild>
                      <div style={{ position: 'absolute', left: cursorPos.x, top: cursorPos.y, width: 1, height: 1 }} />
                    </TooltipTrigger>
                    <TooltipContent side="top" align="center">
                      <p>Click first point to close this shape.</p>
                    </TooltipContent>
                  </Tooltip>
                  <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
                    {items.filter(item => item.shape !== 'marker').map(item => renderShape(item as Shape))}
                    {renderDrawingShape()}
                  </svg>
              </div>
              {items.filter(item => item.shape === 'marker').map(item => renderMarker(item as Marker))}
            </div>
          </div>
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
    </div>
  );
});

MapArea.displayName = "MapArea";
