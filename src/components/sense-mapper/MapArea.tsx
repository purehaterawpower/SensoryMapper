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
} & React.HTMLAttributes<HTMLDivElement>;

export const MapArea = forwardRef<HTMLDivElement, MapAreaProps>(({
  mapImage,
  imageDimensions,
  markers,
  zones,
  visibleLayers,
  onItemSelect,
  drawingZone,
  ...props
}, ref) => {

  const renderItem = (item: Marker | Zone, isZone: boolean) => {
    if (!visibleLayers[item.type]) return null;
    const { icon: Icon } = SENSORY_DATA[item.type];

    const itemStyle: React.CSSProperties = isZone
      ? {
        position: 'absolute',
        left: item.x,
        top: item.y,
        width: (item as Zone).width,
        height: (item as Zone).height,
        backgroundColor: SENSORY_DATA[item.type].color,
        opacity: 0.3,
        cursor: 'pointer',
        border: '1px solid ' + SENSORY_DATA[item.type].color,
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
        onClick={() => onItemSelect(item)}
      >
        {!isZone && (
          <div className={cn("p-1.5 rounded-full shadow-lg", SENSORY_DATA[item.type].className)}>
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
        className="relative shadow-lg rounded-lg overflow-hidden border"
        style={mapStyle}
        {...props}
      >
        {mapImage ? (
          <>
            <img src={mapImage} alt="Floor Plan" className="block w-full h-full object-contain" />
            {zones.map(zone => renderItem(zone, true))}
            {markers.map(marker => renderItem(marker, false))}
            {drawingZone && (
              <div style={{
                position: 'absolute',
                left: drawingZone.x,
                top: drawingZone.y,
                width: drawingZone.width,
                height: drawingZone.height,
                border: '2px dashed #8A2BE2',
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
