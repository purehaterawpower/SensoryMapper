'use client';

import { PlaceHolderImages } from "@/lib/placeholder-images";
import { SENSORY_DATA } from "@/lib/constants";
import { Marker, Zone } from "@/lib/types";
import { cn } from "@/lib/utils";
import Image from "next/image";
import React, { forwardRef } from "react";

type MapAreaProps = {
  markers: Marker[];
  zones: Zone[];
  visibleLayers: Record<string, boolean>;
  onItemSelect: (item: Marker | Zone) => void;
  drawingZone: Omit<Zone, 'id' | 'description'> | null;
} & React.HTMLAttributes<HTMLDivElement>;

const floorPlanImage = PlaceHolderImages.find(img => img.id === 'floor-plan');

export const MapArea = forwardRef<HTMLDivElement, MapAreaProps>(({ markers, zones, visibleLayers, onItemSelect, drawingZone, ...props }, ref) => {

  const renderItem = (item: Marker | Zone, isZone: boolean) => {
    if (!visibleLayers[item.type]) return null;
    const { icon: Icon, color, className } = SENSORY_DATA[item.type];
    
    const style: React.CSSProperties = {
      left: `${item.x}%`,
      top: `${item.y}%`,
    };

    if (isZone) {
      const zone = item as Zone;
      style.width = `${zone.width}%`;
      style.height = `${zone.height}%`;
    }

    return (
      <div
        key={item.id}
        style={style}
        className={cn(
          "absolute transform-gpu transition-opacity duration-300",
          !isZone && "-translate-x-1/2 -translate-y-1/2",
          "hover:scale-110 focus:scale-110 cursor-pointer",
          isZone ? "border-2" : "p-1.5 rounded-full shadow-lg",
          className
        )}
        onClick={(e) => { e.stopPropagation(); onItemSelect(item); }}
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onItemSelect(item) }}
      >
        {isZone ? (
          <div className="w-full h-full relative">
            <Icon className="absolute top-1 left-1 w-4 h-4" style={{ color }} />
          </div>
        ) : (
          <Icon className="w-5 h-5 text-white" />
        )}
      </div>
    );
  };
  
  return (
    <main className="flex-1 p-4 bg-muted/40">
      <div 
        ref={ref}
        className="relative w-full h-full shadow-lg rounded-lg overflow-hidden border"
        {...props}
      >
        {floorPlanImage && (
          <Image
            src={floorPlanImage.imageUrl}
            alt={floorPlanImage.description}
            data-ai-hint={floorPlanImage.imageHint}
            fill
            className="object-cover"
            priority
          />
        )}
        {markers.map(marker => renderItem(marker, false))}
        {zones.map(zone => renderItem(zone, true))}

        {drawingZone && (
          <div
            className="absolute border-2 border-dashed border-accent"
            style={{
              left: `${drawingZone.x}%`,
              top: `${drawingZone.y}%`,
              width: `${drawingZone.width}%`,
              height: `${drawingZone.height}%`,
            }}
          />
        )}
      </div>
    </main>
  );
});

MapArea.displayName = "MapArea";
