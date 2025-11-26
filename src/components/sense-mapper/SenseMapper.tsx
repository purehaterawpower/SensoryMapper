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

const initialLayerVisibility = SENSORY_TYPES.reduce((acc, layer) => {
  acc[layer] = true;
  return acc;
}, {} as Record<SensoryType, boolean>);

export function SenseMapper() {
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [visibleLayers, setVisibleLayers] = useState<Record<SensoryType, boolean>>(initialLayerVisibility);
  const [activeTool, setActiveTool] = useState<ActiveTool>({ tool: 'select' });
  const [selectedItem, setSelectedItem] = useState<Marker | Zone | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [drawingZone, setDrawingZone] = useState<Omit<Zone, 'id' | 'description'> | null>(null);
  
  const [summary, setSummary] = useState<{title: string, content: string} | null>(null);
  const [isSummaryLoading, setSummaryLoading] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleLayerVisibilityChange = (layer: SensoryType, visible: boolean) => {
    setVisibleLayers(prev => ({ ...prev, [layer]: visible }));
  };

  const handleItemSelect = (item: Marker | Zone) => {
    if (activeTool.tool === 'select') {
      setSelectedItem(item);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool.tool !== 'zone' || !activeTool.type) return;
    if (!mapRef.current) return;

    setDrawing(true);
    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setDrawingZone({ x, y, width: 0, height: 0, type: activeTool.type });
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!drawing || !drawingZone || !mapRef.current) return;

    const rect = mapRef.current.getBoundingClientRect();
    const currentX = ((e.clientX - rect.left) / rect.width) * 100;
    const currentY = ((e.clientY - rect.top) / rect.height) * 100;
    
    const width = Math.abs(currentX - drawingZone.x);
    const height = Math.abs(currentY - drawingZone.y);
    const newX = Math.min(currentX, drawingZone.x);
    const newY = Math.min(currentY, drawingZone.y);

    setDrawingZone(prev => prev ? { ...prev, x: newX, y: newY, width, height } : null);
  };
  
  const handleMouseUp = () => {
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

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool.tool !== 'marker' || !activeTool.type) {
      if (!e.defaultPrevented) setSelectedItem(null);
      return;
    }
    if (!mapRef.current) return;

    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newMarker: Marker = {
      id: crypto.randomUUID(),
      x,
      y,
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
      />
      <MapArea
        ref={mapRef}
        markers={markers}
        zones={zones}
        visibleLayers={visibleLayers}
        onItemSelect={handleItemSelect}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleMapClick}
        drawingZone={drawingZone}
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
