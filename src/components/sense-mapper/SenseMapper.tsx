'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { MapArea } from './MapArea';
import { AnnotationEditor } from './AnnotationEditor';
import { Item, Shape, Point, ActiveTool, ItemType, Marker } from '@/lib/types';
import { ALL_SENSORY_TYPES, ALL_SENSORY_DATA } from '@/lib/constants';
import { getSensorySummary } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { SummaryDialog } from './SummaryDialog';
import { PrintableReport } from './PrintableReport';
import { interpolateColor } from '@/lib/color-utils';

const initialLayerVisibility = ALL_SENSORY_TYPES.reduce((acc, layer) => {
  acc[layer] = true;
  return acc;
}, {} as Record<ItemType, boolean>);

export function SenseMapper() {
  const [items, setItems] = useState<Item[]>([]);
  const [visibleLayers, setVisibleLayers] = useState<Record<ItemType, boolean>>(initialLayerVisibility);
  const [activeTool, setActiveTool] = useState<ActiveTool>({ tool: 'select' });
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingShape, setDrawingShape] = useState<any>(null);
  const [startCoords, setStartCoords] = useState<Point | null>(null);
  const [cursorPos, setCursorPos] = useState<Point>({ x: 0, y: 0 });
  const [showPolygonTooltip, setShowPolygonTooltip] = useState(false);

  // Editing state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [draggingItem, setDraggingItem] = useState<{ id: string; type: 'item' | 'handle', handleIndex?: number; offset: Point } | null>(null);

  const [mapImage, setMapImage] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{width: number, height: number} | null>(null);
  
  const [summary, setSummary] = useState<{title: string, content: string} | null>(null);
  const [isSummaryLoading, setSummaryLoading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

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

  const handleMapUpload = async (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          handleImageLoad(e.target.result as string);
          toast({ title: "Map Uploaded", description: "You can now add markers and shapes to your new map." });
        }
      };
      reader.onerror = () => {
        toast({ variant: "destructive", title: "Error", description: "Failed to read the map file." });
      };
      reader.readAsDataURL(file);
    } else {
      toast({ variant: "destructive", title: "Invalid File", description: "Please upload an image file (PNG, JPG)." });
    }
  };

  const handleLayerVisibilityChange = (layer: ItemType, visible: boolean) => {
    setVisibleLayers(prev => ({ ...prev, [layer]: visible }));
  };

  const handleItemSelect = (item: Item | null) => {
    if (editingItemId && item?.id !== editingItemId) {
        // When in edit mode, don't allow selecting another item, but allow deselecting
        if (!item) {
          setSelectedItem(null);
          setEditingItemId(null);
        }
        return; 
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
      
      const originalItem = prevItems.find(i => i.id === id);
      if (!originalItem) return item;

      let dx = 0;
      let dy = 0;

      if (originalItem.shape === 'marker') {
        dx = newPos.x - originalItem.x;
        dy = newPos.y - originalItem.y;
      } else if (originalItem.shape === 'rectangle') {
        const currentCenterX = originalItem.x + originalItem.width / 2;
        const currentCenterY = originalItem.y + originalItem.height / 2;
        dx = newPos.x - currentCenterX;
        dy = newPos.y - currentCenterY;
      } else if (originalItem.shape === 'circle') {
        dx = newPos.x - originalItem.cx;
        dy = newPos.y - originalItem.cy;
      } else if (originalItem.shape === 'polygon') {
        const sum = originalItem.points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
        const centroid = { x: sum.x / originalItem.points.length, y: sum.y / originalItem.points.length };
        dx = newPos.x - centroid.x;
        dy = newPos.y - centroid.y;
      }

      let updatedItem: Item;

      if (item.shape === 'marker') {
        updatedItem = { ...item, x: item.x + dx, y: item.y + dy };
      } else if (item.shape === 'rectangle') {
        updatedItem = { ...item, x: item.x + dx, y: item.y + dy };
      } else if (item.shape === 'circle') {
        updatedItem = { ...item, cx: item.cx + dx, cy: item.cy + dy };
      } else if (item.shape === 'polygon') {
        updatedItem = { ...item, points: item.points.map(p => ({ x: p.x + dx, y: p.y + dy })) };
      } else {
        updatedItem = item;
      }
      setSelectedItem(updatedItem);
      return updatedItem;
    }));
  };
  
  const handleHandleDrag = (handleIndex: number, newPos: Point) => {
    if (!editingItemId) return;
    setItems(prevItems => prevItems.map(item => {
      if (item.id !== editingItemId) return item;
      
      let updatedShape = {...item} as Shape;

      if (updatedShape.shape === 'rectangle') {
        const { x, y, width, height } = updatedShape;
        const corners = [{x,y}, {x:x+width, y}, {x:x+width, y:y+height}, {x, y:y+height}];
        
        const oppositeCorner = corners[(handleIndex + 2) % 4];
        const newX = Math.min(newPos.x, oppositeCorner.x);
        const newY = Math.min(newPos.y, oppositeCorner.y);
        const newMaxX = Math.max(newPos.x, oppositeCorner.x);
        const newMaxY = Math.max(newPos.y, oppositeCorner.y);

        updatedShape.x = newX;
        updatedShape.y = newY;
        updatedShape.width = newMaxX - newX;
        updatedShape.height = newMaxY - newY;
      } else if (updatedShape.shape === 'circle') {
        const dx = newPos.x - updatedShape.cx;
        const dy = newPos.y - updatedShape.cy;
        updatedShape.radius = Math.sqrt(dx*dx + dy*dy);
      } else if (updatedShape.shape === 'polygon') {
        const newPoints = [...updatedShape.points];
        newPoints[handleIndex] = newPos;
        updatedShape.points = newPoints;
      }

      setSelectedItem(updatedShape);
      return updatedShape;
    }));
  }

  const finishDrawingPolygon = () => {
    if (drawingShape && drawingShape.shape === 'polygon' && drawingShape.points.length > 2 && activeTool.type) {
        const shapeType = activeTool.type;
        const defaultIntensity = 50;
        const newShape: Shape = {
            ...drawingShape,
            id: crypto.randomUUID(),
            type: shapeType,
            description: '',
            imageUrl: '',
            color: shapeType === 'quietArea' ? ALL_SENSORY_DATA.quietArea.color : interpolateColor(defaultIntensity),
            intensity: shapeType === 'quietArea' ? undefined : defaultIntensity,
        };
        setItems(prev => [...prev, newShape]);
        setSelectedItem(newShape);
        setEditingItemId(newShape.id);
    }
    setIsDrawing(false);
    setDrawingShape(null);
    setStartCoords(null);
    setShowPolygonTooltip(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!mapImage) return;

    const coords = getMapCoordinates(e);
    const target = e.target as SVGElement;
    
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
    
    const itemId = target.closest('[data-item-id]')?.getAttribute('data-item-id');
    const itemType = target.closest('[data-item-type]')?.getAttribute('data-item-type');

    if (itemId && itemType) {
      const item = items.find(i => i.id === itemId);
      if (!item) return;

      if (itemType === 'marker') {
        setDraggingItem({ id: itemId, type: 'item', offset: { x: coords.x - (item as Marker).x, y: coords.y - (item as Marker).y }});
        e.stopPropagation();
        return;
      }

      if (itemType === 'shape-center') {
        let dragStartPos: Point = { x: 0, y: 0 };
        const shape = item as Shape;
        
        if (shape.shape === 'rectangle') dragStartPos = {x: shape.x + shape.width/2, y: shape.y + shape.height/2};
        else if (shape.shape === 'circle') dragStartPos = {x: shape.cx, y: shape.cy};
        else if (shape.shape === 'polygon') {
            const sum = shape.points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
            dragStartPos = { x: sum.x / shape.points.length, y: sum.y / shape.points.length };
        }
        
        setDraggingItem({ id: itemId, type: 'item', offset: { x: coords.x - dragStartPos.x, y: coords.y - dragStartPos.y }});
        e.stopPropagation();
        return;
      }
      e.stopPropagation();
      return;
    }
    
    if (activeTool.tool === 'shape' && activeTool.type) {
      if (editingItemId) return; // Don't start drawing if an item is being edited.
      
      if (activeTool.shape === 'polygon') {
        setIsDrawing(true); // Keep drawing mode for polygons
        if (!drawingShape) {
          setDrawingShape({ shape: 'polygon', points: [coords] });
        } else {
          // Check if user is closing the polygon
          const firstPoint = drawingShape.points[0];
          const dist = Math.hypot(coords.x - firstPoint.x, coords.y - firstPoint.y);
          if (drawingShape.points.length > 2 && dist < 10) {
            finishDrawingPolygon();
          } else {
            setDrawingShape((prev: any) => ({ ...prev, points: [...prev.points, coords] }));
          }
        }
      } else {
        setIsDrawing(true);
        setStartCoords(coords);
      }
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    const coords = getMapCoordinates(e);
    setCursorPos(coords);

    if (draggingItem) {
      if (draggingItem.type === 'item') {
        const newCenterPos = { x: coords.x - draggingItem.offset.x, y: coords.y - draggingItem.offset.y };
        handleItemDrag(draggingItem.id, newCenterPos);
      } else if (draggingItem.type === 'handle' && draggingItem.handleIndex !== undefined) {
        handleHandleDrag(draggingItem.handleIndex, coords);
      }
      return;
    }
    
    if (isDrawing && activeTool.tool === 'shape' && activeTool.shape === 'polygon' && drawingShape?.points?.length > 2) {
      const firstPoint = drawingShape.points[0];
      const dist = Math.hypot(coords.x - firstPoint.x, coords.y - firstPoint.y);
      setShowPolygonTooltip(dist < 10);
    } else {
      setShowPolygonTooltip(false);
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

    if (!isDrawing || !activeTool.type || activeTool.shape === 'polygon') return;


    if (activeTool.tool === 'shape' && drawingShape) {
      if (
        (drawingShape.shape === 'rectangle' && (drawingShape.width < 5 || drawingShape.height < 5)) ||
        (drawingShape.shape === 'circle' && drawingShape.radius < 5)
      ) {
         // Ignore tiny shapes
      } else {
        const shapeType = activeTool.type;
        const defaultIntensity = 50;
        const newShape: Shape = {
          ...drawingShape,
          id: crypto.randomUUID(),
          type: shapeType,
          description: '',
          imageUrl: '',
          color: shapeType === 'quietArea' ? ALL_SENSORY_DATA.quietArea.color : interpolateColor(defaultIntensity),
          intensity: shapeType === 'quietArea' ? undefined : defaultIntensity,
        };
        setItems(prev => [...prev, newShape]);
        setSelectedItem(newShape);
        setEditingItemId(newShape.id);
      }
    }
    
    setIsDrawing(false);
    setDrawingShape(null);
    setStartCoords(null);
  };

  const handleMapClick = (e: React.MouseEvent) => {
    if (editingItemId) {
        if (!e.defaultPrevented && !(e.target as HTMLElement).closest('[data-item-id]')) {
            setSelectedItem(null);
            setEditingItemId(null);
         }
        return;
    }
    
    if (activeTool.shape === 'polygon' && isDrawing) {
        return; // Let mousedown handle adding points
    }

    if (activeTool.tool === 'marker' && activeTool.type && mapImage) {
        const { x, y } = getMapCoordinates(e);
        const newMarker: Marker = {
          id: crypto.randomUUID(),
          type: activeTool.type,
          shape: 'marker',
          x,
          y,
          description: '',
          imageUrl: '',
        };
        setItems(prev => [...prev, newMarker]);
        setSelectedItem(newMarker);
        setEditingItemId(newMarker.id);
        setActiveTool({tool: 'select'});
    } else {
       if (!e.defaultPrevented) {
          setSelectedItem(null);
          setEditingItemId(null);
       }
    }
  };
  
  const handleSaveAnnotation = (itemId: string, data: { description: string, imageUrl?: string | null, color?: string, intensity?: number }) => {
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
    setEditingItemId(prev => {
        const newId = prev === itemId ? null : itemId;
        if(newId) {
            const itemToEdit = items.find(i => i.id === newId);
            if(itemToEdit) setSelectedItem(itemToEdit);
        }
        return newId;
    });
  }

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
    }
    const tool = activeTool.tool === 'select' ? 'shape' : activeTool.tool;
    const type = activeTool.type || ALL_SENSORY_TYPES[0];

    switch (event.key.toLowerCase()) {
      case 'v':
        setActiveTool({ tool: 'select' });
        break;
      case 'm':
        setActiveTool({ tool: 'marker', type });
        break;
      case 'r':
        setActiveTool({ tool: 'shape', shape: 'rectangle', type });
        break;
      case 'c':
        setActiveTool({ tool: 'shape', shape: 'circle', type });
        break;
      case 'p':
        setActiveTool({ tool: 'shape', shape: 'polygon', type });
        break;
      case 'escape':
        if (isDrawing) {
            setIsDrawing(false);
            setDrawingShape(null);
            setStartCoords(null);
            setShowPolygonTooltip(false);
        } else if (editingItemId) {
            setEditingItemId(null);
            setSelectedItem(null);
        } else if (selectedItem) {
            setSelectedItem(null);
        }
        setDraggingItem(null);
        break;
    }
  }, [editingItemId, selectedItem, isDrawing, activeTool]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if(draggingItem || isDrawing) {
        const mapRect = mapRef.current?.getBoundingClientRect();
        if (mapRect) {
            const syntheticEvent = {
                clientX: e.clientX,
                clientY: e.clientY,
                stopPropagation: () => {},
                preventDefault: () => {}
            } as React.MouseEvent;
            handleMouseMove(syntheticEvent);
        }
      }
    }
    const handleGlobalMouseUp = () => {
      if(draggingItem) {
          setDraggingItem(null);
      }
      if(isDrawing && activeTool.shape !== 'polygon') {
          handleMouseUp();
      }
    }
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [draggingItem, isDrawing, handleMouseMove, handleMouseUp, activeTool.shape]);

  const handleDoubleClick = () => {
    if (activeTool.tool === 'shape' && activeTool.shape === 'polygon' && isDrawing) {
      finishDrawingPolygon();
    }
  };

  const handleExportPDF = async () => {
    if (!mapImage) {
      toast({ variant: "destructive", title: "No Map", description: "Please upload a map before exporting." });
      return;
    }

    setIsPrinting(true);
    setSelectedItem(null);
    setEditingItemId(null);

    // Wait for state to update and UI to re-render
    await new Promise(resolve => setTimeout(resolve, 100));

    window.print();

    // The `afterprint` event will set isPrinting to false
  };

  useEffect(() => {
    const handleAfterPrint = () => {
      setIsPrinting(false);
    };

    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  return (
    <>
    <div id="app-container" className="flex h-screen bg-background font-body text-foreground">
      <Sidebar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        visibleLayers={visibleLayers}
        onLayerVisibilityChange={handleLayerVisibilityChange}
        onExportPDF={handleExportPDF}
        isExporting={isPrinting}
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
        onMapUpload={handleMapUpload}
        drawingShape={drawingShape}
        selectedItem={selectedItem}
        editingItemId={editingItemId}
        cursorPos={cursorPos}
        showPolygonTooltip={showPolygonTooltip}
      />
      <AnnotationEditor
        item={selectedItem}
        onClose={() => { 
            if (!editingItemId) {
              setSelectedItem(null); 
            }
        }}
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
    {isPrinting && (
        <div id="printable-report">
            <PrintableReport
              mapImage={mapImage}
              imageDimensions={imageDimensions}
              items={items.filter(item => visibleLayers[item.type])}
            />
        </div>
    )}
    </>
  );
}
