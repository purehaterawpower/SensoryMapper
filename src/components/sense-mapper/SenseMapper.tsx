'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { MapArea } from './MapArea';
import { AnnotationEditor } from './AnnotationEditor';
import { Marker, Zone, SensoryType, ActiveTool } from '@/lib/types';
import { SENSORY_TYPES } from '@/lib/constants';
import { getSensorySummary } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { SummaryDialog } from './SummaryDialog';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { ViewState } from 'react-map-gl';

const initialLayerVisibility = SENSORY_TYPES.reduce((acc, layer) => {
  acc[layer] = true;
  return acc;
}, {} as Record<SensoryType, boolean>);

const INITIAL_VIEW_STATE: ViewState = {
  longitude: -100,
  latitude: 40,
  zoom: 1,
  pitch: 0,
  bearing: 0,
  padding: { top: 0, bottom: 0, left: 0, right: 0 }
};

export function SenseMapper() {
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [visibleLayers, setVisibleLayers] = useState<Record<SensoryType, boolean>>(initialLayerVisibility);
  const [activeTool, setActiveTool] = useState<ActiveTool>({ tool: 'select' });
  const [selectedItem, setSelectedItem] = useState<Marker | Zone | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [drawingZone, setDrawingZone] = useState<Omit<Zone, 'id' | 'description'> | null>(null);
  const [mapImage, setMapImage] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{width: number, height: number} | null>(null);
  const [viewState, setViewState] = useState<ViewState>(INITIAL_VIEW_STATE);
  
  const [summary, setSummary] = useState<{title: string, content: string} | null>(null);
  const [isSummaryLoading, setSummaryLoading] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleImageLoad = (url: string) => {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      // Let's assume we want the map to have a "width" of 1000 units in our coordinate system
      const mapWidth = 1000;
      const mapHeight = mapWidth / aspectRatio;
      setImageDimensions({ width: mapWidth, height: mapHeight });
      setViewState({
        ...INITIAL_VIEW_STATE,
        longitude: mapWidth / 2,
        latitude: mapHeight / 2,
        zoom: 1,
      });
      setMapImage(url);
    };
    img.onerror = () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to load image for map." });
    };
  };

  useEffect(() => {
    const floorPlanImage = PlaceHolderImages.find(img => img.id === 'floor-plan');
    if (floorPlanImage) {
      handleImageLoad(floorPlanImage.imageUrl);
    }
  }, []);

  const handleMapUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const imageUrl = e.target.result as string;
        handleImageLoad(imageUrl);
        // Reset markers and zones when a new map is uploaded
        setMarkers([]);
        setZones([]);
        setSelectedItem(null);
        toast({ title: "Map Uploaded", description: "You can now add markers and zones to your new map." });
      }
    };
    reader.onerror = () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to read the map file." });
    }
    reader.readAsDataURL(file);
  };

  const handleLayerVisibilityChange = (layer: SensoryType, visible: boolean) => {
    setVisibleLayers(prev => ({ ...prev, [layer]: visible }));
  };

  const handleItemSelect = (item: Marker | Zone) => {
    if (activeTool.tool === 'select') {
      setSelectedItem(item);
    }
  };

  const handleMouseDown = (e: mapboxgl.MapLayerMouseEvent) => {
    if (activeTool.tool !== 'zone' || !activeTool.type || !mapImage) return;

    setDrawing(true);
    const { lng, lat } = e.lngLat;
    setDrawingZone({ x: lng, y: lat, width: 0, height: 0, type: activeTool.type });
    e.preventDefault();
  };
  
  const handleMouseMove = (e: mapboxgl.MapLayerMouseEvent) => {
    if (!drawing || !drawingZone) return;
    
    const { lng, lat } = e.lngLat;
    const width = Math.abs(lng - drawingZone.x);
    const height = Math.abs(lat - drawingZone.y);
    const newX = Math.min(lng, drawingZone.x);
    const newY = Math.min(lat, drawingZone.y);

    setDrawingZone(prev => prev ? { ...prev, x: newX, y: newY, width, height } : null);
  };
  
  const handleMouseUp = (e: mapboxgl.MapLayerMouseEvent) => {
    if (!drawing || !drawingZone) return;
    setDrawing(false);
    if (drawingZone.width > 1 && drawingZone.height > 1) { // Threshold to prevent tiny zones
      const newZone: Zone = {
        ...drawingZone,
        id: crypto.randomUUID(),
        description: ''
      };
      setZones(prev => [...prev, newZone]);
    }
    setDrawingZone(null);
  };

  const handleMapClick = (e: mapboxgl.MapLayerMouseEvent) => {
    if (activeTool.tool !== 'marker' || !activeTool.type || !mapImage) {
      if (!e.defaultPrevented) setSelectedItem(null);
      return;
    }

    const { lng, lat } = e.lngLat;

    const newMarker: Marker = {
      id: crypto.randomUUID(),
      x: lng,
      y: lat,
      type: activeTool.type,
      description: ''
    };
    setMarkers(prev => [...prev, newMarker]);
  };
  
  const handleSaveAnnotation = (itemId: string, description: string) => {
    setMarkers(markers.map(m => m.id === itemId ? { ...m, description } : m));
    setZones(zones.map(z => z.id === itemId ? { ...z, description } : z));
    setSelectedItem(null);
    toast({ title: "Saved!", description: "Your annotation has been saved." });
  };
  
  const handleDeleteItem = (itemId: string) => {
    setMarkers(markers.filter(m => m.id !== itemId));
    setZones(zones.filter(z => z.id !== itemId));
    setSelectedItem(null);
    toast({ title: "Deleted!", description: "The item has been removed from the map." });
  };

  const handleGenerateSummary = async (description: string) => {
    setSummaryLoading(true);
    const result = await getSensorySummary(description);
    setSummaryLoading(false);

    if (result.error) {
      toast({ variant: "destructive", title: "Error", description: result.error });
    } else if (result.summary) {
      setSummary({ title: 'Generated Sensory Summary', content: result.summary });
    }
  };

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
    }
    switch (event.key.toLowerCase()) {
      case 'v':
        setActiveTool({ tool: 'select' });
        break;
      case 'm':
        setActiveTool(prev => ({ tool: 'marker', type: prev.type || SENSORY_TYPES[0] }));
        break;
      case 'z':
        setActiveTool(prev => ({ tool: 'zone', type: prev.type || SENSORY_TYPES[0] }));
        break;
      case 'escape':
        setSelectedItem(null);
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);


  return (
    <div className="flex h-screen bg-background font-body text-foreground">
      <Sidebar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        visibleLayers={visibleLayers}
        onLayerVisibilityChange={handleLayerVisibilityChange}
        onMapUpload={handleMapUpload}
      />
      <MapArea
        ref={mapRef}
        mapImage={mapImage}
        imageDimensions={imageDimensions}
        markers={markers}
        zones={zones}
        visibleLayers={visibleLayers}
        onItemSelect={handleItemSelect}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMapClick={handleMapClick}
        drawingZone={drawingZone}
        viewState={viewState}
        onViewStateChange={(newViewState) => setViewState(newViewState)}
      />
      <AnnotationEditor
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onSave={handleSaveAnnotation}
        onDelete={handleDeleteItem}
        onGenerateSummary={handleGenerateSummary}
        isSummaryLoading={isSummaryLoading}
      />
      <SummaryDialog
        summary={summary}
        onClose={() => setSummary(null)}
      />
    </div>
  );
}
