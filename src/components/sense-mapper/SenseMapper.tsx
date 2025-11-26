'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { MapArea } from './MapArea';
import { AnnotationEditor } from './AnnotationEditor';
import { Item, Marker, Shape, Point, ActiveTool, SensoryType, DrawingShape } from '@/lib/types';
import { SENSORY_TYPES } from '@/lib/constants';
import { getSensorySummary } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { SummaryDialog } from './SummaryDialog';

const initialLayerVisibility = SENSORY_TYPES.reduce((acc, layer) => {
  acc[layer] = true;
  return acc;
}, {} as Record<SensoryType, boolean>);

export function SenseMapper() {
  const [items, setItems] = useState<Item[]>([]);
  const [visibleLayers, setVisibleLayers] = useState<Record<SensoryType, boolean>>(initialLayerVisibility);
  const [activeTool, setActiveTool] = useState<ActiveTool>({ tool: 'select' });
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingShape, setDrawingShape] = useState<any>(null);
  const [startCoords, setStartCoords] = useState<Point | null>(null);
  
  // Editing state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [draggingItem, setDraggingItem] = useState<{ id: string; type: 'item' | 'handle', handleIndex?: number; offset: Point } | null>(null);

  const [mapImage, setMapImage] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{width: number, height: number} | null>(null);
  
  const [summary, setSummary] = useState<{title: string, content: string} | null>(null);
  const [isSummaryLoading, setSummaryLoading] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleImageLoad = (url: string) => {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height });
      setMapImage(url);
      setItems([]);
      setSelectedItem(null);
      setEditingItemId(null);
    };
    img.onerror = () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to load image for map." });
    };
  };

  const handleMapUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        handleImageLoad(e.target.result as string);
        toast({ title: "Map Uploaded", description: "You can now add markers and shapes to your new map." });
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

  const handleItemSelect = (item: Item | null) => {
    if (editingItemId && item?.id !== editingItemId) {
        setEditingItemId(null);
    }
    setSelectedItem(item);
  };
  
  const getMapCoordinates = (e: React.MouseEvent | MouseEvent): Point => {
    if (!mapRef.current) return { x: 0, y: 0 };
    const rect = mapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return { x, y };
  };
  
  const handleItemDrag = (id: string, newPos: Point) => {
    setItems(prevItems => prevItems.map(item => {
      if (item.id !== id) return item;

      if (item.shape === 'marker') {
        return { ...item, x: newPos.x, y: newPos.y };
      }
      if (item.shape === 'rectangle') {
        return { ...item, x: newPos.x, y: newPos.y };
      }
      if (item.shape === 'circle') {
        return { ...item, cx: newPos.x, cy: newPos.y };
      }
      if (item.shape === 'polygon') {
        const dx = newPos.x - item.points[0].x;
        const dy = newPos.y - item.points[0].y;
        return { ...item, points: item.points.map(p => ({ x: p.x + dx, y: p.y + dy })) };
      }
      return item;
    }));
  };
  
  const handleHandleDrag = (handleIndex: number, newPos: Point) => {
    if (!editingItemId) return;
    setItems(prevItems => prevItems.map(item => {
      if (item.id !== editingItemId) return item;
      
      let updatedShape = {...item};

      if (updatedShape.shape === 'rectangle') {
        const { x, y, width, height } = updatedShape;
        const corners = [{x,y}, {x:x+width, y}, {x:x+width, y:y+height}, {x, y:y+height}];
        corners[handleIndex] = newPos;
        const newX = Math.min(corners[0].x, corners[1].x, corners[2].x, corners[3].x);
        const newY = Math.min(corners[0].y, corners[1].y, corners[2].y, corners[3].y);
        const newMaxX = Math.max(corners[0].x, corners[1].x, corners[2].x, corners[3].x);
        const newMaxY = Math.max(corners[0].y, corners[1].y, corners[2].y, corners[3].y);
        updatedShape.x = newX;
        updatedShape.y = newY;
        updatedShape.width = newMaxX - newX;
        updatedShape.height = newMaxY - newY;
      } else if (updatedShape.shape === 'circle') {
        const dx = newPos.x - updatedShape.cx;
        const dy = newPos.y - updatedShape.cy;
        updatedShape.radius = Math.sqrt(dx*dx + dy*dy);
      } else if (updatedShape.shape === 'polygon') {
        updatedShape.points[handleIndex] = newPos;
      }

      return updatedShape;
    }));
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!mapImage) return;

    const coords = getMapCoordinates(e);
    const target = e.target as SVGElement;
    
    // Check if clicking on an edit handle
    const handleId = target.dataset.handleId;
    if (handleId && editingItemId) {
      const handleIndex = parseInt(handleId, 10);
      const item = items.find(i => i.id === editingItemId);
      if (item) {
        setDraggingItem({ id: editingItemId, type: 'handle', handleIndex, offset: {x: 0, y: 0} });
        e.stopPropagation();
        return;
      }
    }
    
    // Check if clicking on an item
    const itemId = target.closest('[data-item-id]')?.getAttribute('data-item-id');
    if (itemId) {
      const item = items.find(i => i.id === itemId);
      if (item) {
        if (activeTool.tool === 'select') {
          if (editingItemId === itemId) { // Already editing, start dragging the whole shape
             setDraggingItem({ id: itemId, type: 'item', offset: { x: coords.x - (item as any).x || (item as any).cx, y: coords.y - (item as any).y || (item as any).cy }});
          } else if (item.shape === 'marker') { // Marker dragging
            setDraggingItem({ id: itemId, type: 'item', offset: { x: coords.x - (item as Marker).x, y: coords.y - (item as Marker).y }});
          }
        }
      }
      // Stop propagation to prevent map click handler from deselecting
      e.stopPropagation();
      return;
    }
    
    // If not clicking an item, and in a drawing tool mode
    if ((activeTool.tool === 'marker' || activeTool.tool === 'shape') && activeTool.type) {
      setIsDrawing(true);
      setStartCoords(coords);
      
      if (activeTool.tool === 'shape' && activeTool.shape === 'polygon') {
        if (!drawingShape) {
          setDrawingShape({ shape: 'polygon', points: [coords] });
        } else {
          // Finish polygon on click near first point or double click
          const firstPoint = drawingShape.points[0];
          const dist = Math.hypot(coords.x - firstPoint.x, coords.y - firstPoint.y);
          if (dist < 10 && drawingShape.points.length > 2) {
             handleMouseUp();
          } else {
            setDrawingShape((prev: any) => ({ ...prev, points: [...prev.points, coords] }));
          }
        }
      }
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    const coords = getMapCoordinates(e);

    if (draggingItem) {
      if (draggingItem.type === 'item') {
        const newPos = { x: coords.x - draggingItem.offset.x, y: coords.y - draggingItem.offset.y };
        handleItemDrag(draggingItem.id, newPos);
        const draggedItem = items.find(i => i.id === draggingItem.id);
        if (draggedItem) {
          let updatedItem;
          if (draggedItem.shape === 'marker') updatedItem = {...draggedItem, x: newPos.x, y: newPos.y};
          if (draggedItem.shape === 'rectangle') updatedItem = {...draggedItem, x: newPos.x, y: newPos.y};
          if (draggedItem.shape === 'circle') updatedItem = {...draggedItem, cx: newPos.x, cy: newPos.y};
          if (draggedItem.shape === 'polygon') {
            const dx = newPos.x - (draggedItem as any).points[0].x;
            const dy = newPos.y - (draggedItem as any).points[0].y;
            updatedItem = {...draggedItem, points: (draggedItem as any).points.map((p:Point) => ({x: p.x + dx, y: p.y+dy}))}
          }
          if (selectedItem?.id === draggingItem.id) {
            setSelectedItem(updatedItem as Item);
          }
        }
      } else if (draggingItem.type === 'handle' && draggingItem.handleIndex !== undefined) {
        handleHandleDrag(draggingItem.handleIndex, coords);
      }
      return;
    }

    if (!isDrawing || !startCoords || activeTool.tool !== 'shape') return;
    
    if (activeTool.shape === 'rectangle') {
      const width = Math.abs(coords.x - startCoords.x);
      const height = Math.abs(coords.y - startCoords.y);
      const newX = Math.min(coords.x, startCoords.x);
      const newY = Math.min(coords.y, startCoords.y);
      setDrawingShape({ shape: 'rectangle', x: newX, y: newY, width, height });
    } else if (activeTool.shape === 'circle') {
      const radius = Math.hypot(coords.x - startCoords.x, coords.y - startCoords.y);
      setDrawingShape({ shape: 'circle', cx: startCoords.x, cy: startCoords.y, radius });
    } else if (activeTool.shape === 'polygon') {
        // Handled in mouse down and up
    }
  };
  
  const handleMouseUp = () => {
    if (draggingItem) {
      setDraggingItem(null);
      return;
    }

    if (!isDrawing || !activeTool.type) return;

    if (activeTool.tool === 'shape' && drawingShape) {
      if (
        (drawingShape.shape === 'rectangle' && (drawingShape.width < 5 || drawingShape.height < 5)) ||
        (drawingShape.shape === 'circle' && drawingShape.radius < 5)
      ) {
         // Ignore tiny shapes
      } else {
        const newShape: Shape = {
          ...drawingShape,
          id: crypto.randomUUID(),
          type: activeTool.type,
          description: ''
        };
        setItems(prev => [...prev, newShape]);
      }
    }
    
    if (activeTool.shape !== 'polygon') {
      setIsDrawing(false);
      setDrawingShape(null);
      setStartCoords(null);
    } else if (drawingShape?.points.length > 2) {
      setIsDrawing(false);
      setDrawingShape(null);
      setStartCoords(null);
    }
  };

  const handleMapClick = (e: React.MouseEvent) => {
    if (activeTool.tool === 'marker' && activeTool.type && mapImage) {
        const { x, y } = getMapCoordinates(e);
        const newMarker: Marker = {
          id: crypto.randomUUID(),
          shape: 'marker',
          x,
          y,
          type: activeTool.type,
          description: ''
        };
        setItems(prev => [...prev, newMarker]);
    } else {
       if (editingItemId) {
           setEditingItemId(null);
           setSelectedItem(null);
       }
    }
  };
  
  const handleSaveAnnotation = (itemId: string, data: { description: string, color?: string }) => {
    setItems(items.map(i => i.id === itemId ? { ...i, ...data } : i));
    setSelectedItem(null);
    setEditingItemId(null);
    toast({ title: "Saved!", description: "Your annotation has been saved." });
  };
  
  const handleDeleteItem = (itemId: string) => {
    setItems(items.filter(m => m.id !== itemId));
    setSelectedItem(null);
    setEditingItemId(null);
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

  const handleToggleEditMode = (itemId: string) => {
      setEditingItemId(prev => (prev === itemId ? null : itemId));
  }

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
        setActiveTool(prev => ({ tool: 'shape', shape: 'rectangle', type: prev.type || SENSORY_TYPES[0] }));
        break;
      case 'escape':
        setSelectedItem(null);
        setIsDrawing(false);
        setDrawingShape(null);
        setStartCoords(null);
        setDraggingItem(null);
        setEditingItemId(null);
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleDoubleClick = () => {
    if (activeTool.tool === 'shape' && activeTool.shape === 'polygon' && isDrawing) {
      handleMouseUp();
    }
  };

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
        items={items}
        visibleLayers={visibleLayers}
        onItemSelect={handleItemSelect}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleMapClick}
        onDoubleClick={handleDoubleClick}
        drawingShape={drawingShape}
        selectedItem={selectedItem}
        editingItemId={editingItemId}
        onItemDrag={handleItemDrag}
        onHandleDrag={handleHandleDrag}
      />
      <AnnotationEditor
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onSave={handleSaveAnnotation}
        onDelete={handleDeleteItem}
        onGenerateSummary={handleGenerateSummary}
        isSummaryLoading={isSummaryLoading}
        onToggleEditMode={handleToggleEditMode}
      />
      <SummaryDialog
        summary={summary}
        onClose={() => setSummary(null)}
      />
    </div>
  );
}
