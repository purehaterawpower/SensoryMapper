'use client';

import { SENSORY_DATA } from "@/lib/constants";
import { Marker, Zone } from "@/lib/types";
import { cn } from "@/lib/utils";
import React, { forwardRef } from "react";

type MapAreaProps = {
  mapImage: string | null;
  imageDimensions: { width: number, height: number } | null;
  markers: Marker[];
  zones: Zone[];
  visibleLayers: Record<string, boolean>;
  onItemSelect: (item: Marker | Zone) => void;
  drawingZone: Omit<Zone, 'id' | 'description'> | null;
  selectedItemId?: string | null;
} & React.HTMLAttributes<HTMLDivElement>;

export const MapArea = forwardRef<HTMLDivElement, MapAreaProps>(({
  mapImage,
  imageDimensions,
  markers,
  zones,
  visibleLayers,
  onItemSelect,
  drawingZone,
  selectedItemId,
  ...props
}, ref) => {

  const renderItem = (item: Marker | Zone, isZone: boolean) => {
    if (!visibleLayers[item.type]) return null;
    const { icon: Icon } = SENSORY_DATA[item.type];
    const isSelected = selectedItemId === item.id;

    const itemStyle: React.CSSProperties = isZone
      ? {
        position: 'absolute',
        left: item.x,
        top: item.y,
        width: (item as Zone).width,
        height: (item as Zone).height,
        backgroundColor: SENSORY_DATA[item.type].color,
        opacity: isSelected ? 0.6 : 0.4,
        cursor: 'pointer',
        border: `2px solid ${isSelected ? 'hsl(var(--primary))' : SENSORY_DATA[item.type].color}`,
        boxSizing: 'border-box',
      }
      : {
        position: 'absolute',
        left: item.x,
        top: item.y,
        transform: 'translate(-50%, -50%)',
        cursor: 'pointer',
      };

    return (
      <div
        key={item.id}
        style={itemStyle}
        onClick={(e) => { 
          e.stopPropagation(); // Prevent map click from firing
          onItemSelect(item);
        }}
        data-marker-id={!isZone ? item.id : undefined}
      >
        {!isZone && (
          <div className={cn(
            "p-1.5 rounded-full shadow-lg transition-all", 
            SENSORY_DATA[item.type].className,
            isSelected && 'ring-2 ring-offset-2 ring-primary ring-offset-background'
            )}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}
      </div>
    );
  };

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
      >
        {mapImage ? (
          <>
            <img src={mapImage} alt="Floor Plan" className="block w-full h-full object-contain pointer-events-none" />
            {zones.map(zone => renderItem(zone, true))}
            {markers.map(marker => renderItem(marker, false))}
            {drawingZone && (
              <div style={{
                position: 'absolute',
                left: drawingZone.x,
                top: drawingZone.y,
                width: drawingZone.width,
                height: drawingZone.height,
                border: '2px dashed hsl(var(--primary))',
                backgroundColor: 'hsla(var(--primary), 0.1)',
                pointerEvents: 'none',
              }}/>
            )}
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
