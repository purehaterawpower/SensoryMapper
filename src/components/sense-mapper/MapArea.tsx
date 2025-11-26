'use client';

import { SENSORY_DATA, SENSORY_TYPES } from "@/lib/constants";
import { Marker as MarkerType, Zone as ZoneType } from "@/lib/types";
import { cn } from "@/lib/utils";
import React, { forwardRef, useEffect, useState } from "react";
import Map, { Marker, Source, Layer, NavigationControl, FullscreenControl, ViewState } from 'react-map-gl';

type MapAreaProps = {
  mapImage: string | null;
  imageDimensions: { width: number, height: number } | null;
  markers: MarkerType[];
  zones: ZoneType[];
  visibleLayers: Record<string, boolean>;
  onItemSelect: (item: MarkerType | ZoneType) => void;
  drawingZone: Omit<ZoneType, 'id' | 'description'> | null;
  onMapClick: (e: mapboxgl.MapLayerMouseEvent) => void;
  onMouseDown: (e: mapboxgl.MapLayerMouseEvent) => void;
  onMouseMove: (e: mapboxgl.MapLayerMouseEvent) => void;
  onMouseUp: (e: mapboxgl.MapLayerMouseEvent) => void;
  viewState: ViewState;
  onViewStateChange: (viewState: ViewState) => void;
} & React.HTMLAttributes<HTMLDivElement>;

export const MapArea = forwardRef<HTMLDivElement, MapAreaProps>(({
  mapImage,
  imageDimensions,
  markers,
  zones,
  visibleLayers,
  onItemSelect,
  drawingZone,
  onMapClick,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  viewState,
  onViewStateChange,
  ...props
}, ref) => {

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  const renderItem = (item: MarkerType | ZoneType, isZone: boolean) => {
    if (!visibleLayers[item.type]) return null;
    const { icon: Icon, color } = SENSORY_DATA[item.type];

    if (isZone) return null; // Zones are rendered with a fill layer

    return (
      <Marker
        key={item.id}
        longitude={item.x}
        latitude={item.y}
        onClick={(e) => { e.originalEvent.stopPropagation(); onItemSelect(item); }}
        style={{ cursor: 'pointer' }}
      >
        <div className={cn("p-1.5 rounded-full shadow-lg", SENSORY_DATA[item.type].className)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </Marker>
    );
  };
  
  const zoneFeatures: GeoJSON.Feature[] = zones
    .filter(zone => visibleLayers[zone.type])
    .map(zone => ({
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [zone.x, zone.y],
          [zone.x + zone.width, zone.y],
          [zone.x + zone.width, zone.y + zone.height],
          [zone.x, zone.y + zone.height],
          [zone.x, zone.y]
        ]]
      },
      properties: { id: zone.id, type: zone.type }
  }));

  const zoneSource: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: zoneFeatures
  };

  const drawingZoneFeature: GeoJSON.Feature | null = drawingZone ? {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [drawingZone.x, drawingZone.y],
        [drawingZone.x + drawingZone.width, drawingZone.y],
        [drawingZone.x + drawingZone.width, drawingZone.y + drawingZone.height],
        [drawingZone.x, drawingZone.y + drawingZone.height],
        [drawingZone.x, drawingZone.y]
      ]]
    },
    properties: {}
  } : null;

  const imageLayerCoordinates = imageDimensions ? [
    [0, imageDimensions.height],
    [imageDimensions.width, imageDimensions.height],
    [imageDimensions.width, 0],
    [0, 0]
  ] : [];


  return (
    <main className="flex-1 p-4 bg-muted/40">
      <div 
        ref={ref}
        className="relative w-full h-full shadow-lg rounded-lg overflow-hidden border"
        {...props}
      >
        {!mapboxToken ? (
           <div className="w-full h-full bg-muted flex items-center justify-center text-center p-8">
            <p className="text-muted-foreground">
              Mapbox token not found. Please add your Mapbox access token to the <code>.env</code> file as <code>NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code>.
            </p>
          </div>
        ) : (
          <Map
            {...viewState}
            onMove={evt => onViewStateChange(evt.viewState)}
            mapboxAccessToken={mapboxToken}
            style={{width: '100%', height: '100%'}}
            mapStyle="mapbox://styles/mapbox/light-v11"
            onClick={onMapClick}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            preserveDrawingBuffer={true}
            onDblClick={(e) => {
              const clickedZone = zones.find(zone => 
                e.lngLat.lng >= zone.x && e.lngLat.lng <= zone.x + zone.width &&
                e.lngLat.lat >= zone.y && e.lngLat.lat <= zone.y + zone.height
              );
              if (clickedZone) {
                onItemSelect(clickedZone);
              }
            }}
          >
            <FullscreenControl />
            <NavigationControl />
            
            {mapImage && imageDimensions && (
              <Source id="floor-plan-source" type="image" url={mapImage} coordinates={imageLayerCoordinates}>
                <Layer id="floor-plan-layer" type="raster" paint={{ "raster-opacity": 0.85 }} />
              </Source>
            )}

            {markers.map(marker => renderItem(marker, false))}

            <Source id="zones-source" type="geojson" data={zoneSource}>
              {SENSORY_TYPES.map(type => (
                <Layer
                  key={type}
                  id={`${type}-zone-layer`}
                  type="fill"
                  source="zones-source"
                  paint={{
                    'fill-color': SENSORY_DATA[type].color,
                    'fill-opacity': 0.3
                  }}
                  filter={['==', ['get', 'type'], type]}
                />
              ))}
            </Source>
            
            {drawingZoneFeature && (
              <Source id="drawing-zone-source" type="geojson" data={drawingZoneFeature}>
                <Layer id="drawing-zone-layer" type="line" paint={{ 'line-color': '#8A2BE2', 'line-dasharray': [2, 2], 'line-width': 2 }} />
              </Source>
            )}
          </Map>
        )}
      </div>
    </main>
  );
});

MapArea.displayName = "MapArea";
