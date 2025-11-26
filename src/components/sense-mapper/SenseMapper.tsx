'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { MapArea } from './MapArea';
import { AnnotationEditor } from './AnnotationEditor';
import { Item, Shape, Point, ActiveTool, ItemType, Marker, MapData } from '@/lib/types';
import { ALL_SENSORY_TYPES, ALL_SENSORY_DATA } from '@/lib/constants';
import { getSensorySummary } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { SummaryDialog } from './SummaryDialog';
import { PrintableReport } from './PrintableReport';
import { ShareDialog } from './ShareDialog';
import { Button } from '../ui/button';
import { Plus, Minus } from 'lucide-react';

const initialLayerVisibility = ALL_SENSORY_TYPES.reduce((acc, layer) => {
  acc[layer] = true;
  return acc;
}, {} as Record<ItemType, boolean>);

type SenseMapperProps = {
    initialData?: MapData;
    readOnly?: boolean;
}

export function SenseMapper({ initialData, readOnly = false }: SenseMapperProps) {
  const [items, setItems] = useState<Item[]>(initialData?.items || []);
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
  const [didDrag, setDidDrag] = useState(false);

  // Viewport state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState<Point>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point | null>(null);

  const [mapImage, setMapImage] = useState<string | null>(initialData?.mapImage || null);
  const [imageDimensions, setImageDimensions] = useState<{width: number, height: number} | null>(initialData?.imageDimensions || null);
  
  const [summary, setSummary] = useState<{title: string, content: string} | null>(null);
  const [isSummaryLoading, setSummaryLoading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
        handleImageLoad(initialData.mapImage, false);
        setItems(initialData.items);
    }
  }, [initialData]);

  const handleImageLoad = (url: string, resetState = true) => {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height });
      setMapImage(url);
      if (resetState) {
        setItems([]);
        setSelectedItem(null);
        setEditingItemId(null);
        setZoomLevel(1);
        setPanOffset({ x: 0, y: 0 });
      }
    };
    img.onerror = () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to load image for map." });
    };
  };

  const handleMapUpload = async (file: File) => {
    if (readOnly) return;
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
    if (readOnly) {
        setSelectedItem(item);
        return;
    }
    if (editingItemId && item?.id !== editingItemId) {
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
    
    const view = mapRef.current.querySelector<HTMLDivElement>('.transform-container');
    if (!view) return { x: 0, y: 0 };
    const style = window.getComputedStyle(view);
    const matrix = new DOMMatrix(style.transform);
    const scale = matrix.a;
    
    const mapImageEl = view.querySelector('img');
    if (!mapImageEl || !imageDimensions) return {x: 0, y: 0};

    const imgRect = mapImageEl.getBoundingClientRect();
    const x = (e.clientX - imgRect.left) / scale;
    const y = (e.clientY - imgRect.top) / scale;
    
    return { x, y };
};
  
  const handleItemDrag = (id: string, newPos: Point) => {
    if (readOnly) return;
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
    if (!editingItemId || readOnly) return;
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
    if (readOnly) return;
    if (drawingShape && drawingShape.shape === 'polygon' && drawingShape.points.length > 2 && activeTool.type) {
        const shapeType = activeTool.type;
        const newShape: Shape = {
            ...drawingShape,
            id: crypto.randomUUID(),
            type: shapeType,
            description: '',
            imageUrl: '',
            color: ALL_SENSORY_DATA[shapeType].color,
            intensity: shapeType === 'quietRoom' ? undefined : 50,
        };
        setItems(prev => [...prev, newShape]);
        setSelectedItem(newShape);
        setEditingItemId(newShape.id);
    }
    setIsDrawing(false);
    setDrawingShape(null);
    setStartCoords(null);
    setShowPolygonTooltip(false);
    setActiveTool({ tool: 'select' });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!mapImage || readOnly) return;
    
    // Prevent browser context menu
    e.preventDefault();
    setDidDrag(false);
  
    const coords = getMapCoordinates(e);
    const target = e.target as SVGElement;
    
    // Priority 1: Handle drawing tools
    if (activeTool.tool === 'marker' || (activeTool.tool === 'shape' && activeTool.shape === 'polygon')) {
      setIsDrawing(true);
      setStartCoords(coords);

      if (activeTool.tool === 'shape' && activeTool.shape === 'polygon') {
          if (!drawingShape) {
              setDrawingShape({ shape: 'polygon', points: [coords] });
          } else {
              const firstPoint = drawingShape.points[0];
              const dist = Math.hypot(coords.x - firstPoint.x, coords.y - firstPoint.y);
              if (drawingShape.points.length > 2 && dist < 10 / zoomLevel) {
                  finishDrawingPolygon();
              } else {
                  setDrawingShape((prev: any) => ({ ...prev, points: [...prev.points, coords] }));
              }
          }
      }
      return; 
    }
    
    // Priority 2: Handle editing handles
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
    
    // Priority 3: Handle item dragging
    if (itemId) {
      const item = items.find(i => i.id === itemId);
      if (!item) return;

      let dragStartPos: Point = { x: 0, y: 0 };
      if (item.shape === 'marker') dragStartPos = { x: item.x, y: item.y };
      else if (item.shape === 'rectangle') dragStartPos = { x: item.x + item.width / 2, y: item.y + item.height / 2 };
      else if (item.shape === 'circle') dragStartPos = { x: item.cx, y: item.cy };
      else if (item.shape === 'polygon') {
        const sum = item.points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
        dragStartPos = { x: sum.x / item.points.length, y: sum.y / item.points.length };
      }
      
      setDraggingItem({ id: itemId, type: 'item', offset: { x: coords.x - dragStartPos.x, y: coords.y - dragStartPos.y }});
      e.stopPropagation();
      return;
    }
    
    // Priority 4: Pan the map
    setIsPanning(true);
    setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    const coords = getMapCoordinates(e);
    setCursorPos(coords);

    if (isPanning && panStart && mapRef.current) {
        setDidDrag(true);
        const newX = e.clientX - panStart.x;
        const newY = e.clientY - panStart.y;
        setPanOffset({ x: newX, y: newY });
        return;
    }

    if (draggingItem) {
      setDidDrag(true);
      if (draggingItem.type === 'item') {
        const newCenterPos = { x: coords.x - draggingItem.offset.x, y: coords.y - draggingItem.offset.y };
        handleItemDrag(draggingItem.id, newCenterPos);
      } else if (draggingItem.type === 'handle' && draggingItem.handleIndex !== undefined) {
        handleHandleDrag(draggingItem.handleIndex, coords);
      }
      return;
    }
    
    if (isDrawing && activeTool.tool === 'shape' && activeTool.shape === 'polygon' && drawingShape?.points?.length > 0) {
      const firstPoint = drawingShape.points[0];
      const dist = Math.hypot(coords.x - firstPoint.x, coords.y - firstPoint.y);
      setShowPolygonTooltip(dist < 10 / zoomLevel);
    } else {
      setShowPolygonTooltip(false);
    }
  };
  
  const handleMouseUp = (e: React.MouseEvent) => {
    // Priority 1: Place marker on simple click (no drag)
    if (isDrawing && activeTool.tool === 'marker' && activeTool.type && !didDrag) {
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
      setEditingItemId(null);
      setActiveTool({tool: 'select'});
    }

    // Priority 2: Select an item if we are not dragging or drawing
    if (!didDrag && !isDrawing) {
      const target = e.target as HTMLElement;
      const itemId = target.closest('[data-item-id]')?.getAttribute('data-item-id');
      
      if (itemId && activeTool.tool === 'select') {
        const item = items.find(i => i.id === itemId);
        if (item) handleItemSelect(item);
      } else if (!itemId) {
        handleItemSelect(null);
      }
    }


    if (isDrawing && activeTool.shape !== 'polygon') {
      setIsDrawing(false);
      setDrawingShape(null);
      setStartCoords(null);
    }
    
    if (isPanning) {
        setIsPanning(false);
        setPanStart(null);
    }

    if (draggingItem) {
      setDraggingItem(null);
    }

    // Reset didDrag after processing mouse up
    setTimeout(() => setDidDrag(false), 0);
  };

  const handleMapClick = (e: React.MouseEvent) => {
    if (readOnly || didDrag || isDrawing) {
        return;
    }
  
    if (editingItemId) {
      setSelectedItem(null);
      setEditingItemId(null);
      return;
    }
  };
  
  const handleSaveAnnotation = (itemId: string, data: { description: string, imageUrl?: string | null, color?: string, intensity?: number }) => {
    if (readOnly) return;
    setItems(items.map(i => i.id === itemId ? { ...i, ...data } : i));
    setSelectedItem(null);
    setEditingItemId(null);
    toast({ title: "Saved!", description: "Your annotation has been saved." });
  };
  
  const handleDeleteItem = (itemId: string) => {
    if (readOnly) return;
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
    if (readOnly) return;
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
    if (readOnly) return;
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
    }
    
    const type = activeTool.type || ALL_SENSORY_TYPES[0];

    switch (event.key.toLowerCase()) {
      case 'v':
        setActiveTool({ tool: 'select' });
        break;
      case 'm':
        setActiveTool({ tool: 'marker', type });
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
        setActiveTool({tool: 'select'});
        break;
    }
  }, [editingItemId, selectedItem, isDrawing, activeTool, readOnly, isPanning]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
  useEffect(() => {
    if (readOnly) return;
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if(draggingItem || isDrawing || panStart) {
        const mapRect = mapRef.current?.getBoundingClientRect();
        if (mapRect) {
            const syntheticEvent = {
                clientX: e.clientX,
                clientY: e.clientY,
                stopPropagation: () => {},
                preventDefault: () => {}
            } as unknown as React.MouseEvent;
            handleMouseMove(syntheticEvent);
        }
      }
    }
    const handleGlobalMouseUp = (e: MouseEvent) => {
      if(draggingItem || isPanning || isDrawing) {
        const syntheticEvent = {
            target: e.target
        } as unknown as React.MouseEvent;
        handleMouseUp(syntheticEvent);
      }
    }
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [draggingItem, isDrawing, panStart, handleMouseMove, handleMouseUp, readOnly, isPanning]);

  const handleDoubleClick = () => {
    if (readOnly) return;
    if (activeTool.tool === 'shape' && activeTool.shape === 'polygon' && isDrawing) {
      finishDrawingPolygon();
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!mapRef.current) return;
    e.preventDefault();
    const rect = mapRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const scaleAmount = 1 - e.deltaY * 0.001;
    const newZoom = Math.min(Math.max(0.1, zoomLevel * scaleAmount), 10);
    
    const worldX = (mouseX - panOffset.x) / zoomLevel;
    const worldY = (mouseY - panOffset.y) / zoomLevel;

    const newPanX = mouseX - worldX * newZoom;
    const newPanY = mouseY - worldY * newZoom;

    setZoomLevel(newZoom);
    setPanOffset({ x: newPanX, y: newPanY });
  };
  
  const handleZoom = (direction: 'in' | 'out') => {
    const scaleAmount = direction === 'in' ? 1.2 : 1 / 1.2;
    const newZoom = Math.min(Math.max(0.1, zoomLevel * scaleAmount), 10);
    
    if (mapRef.current) {
        const rect = mapRef.current.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const worldX = (centerX - panOffset.x) / zoomLevel;
        const worldY = (centerY - panOffset.y) / zoomLevel;

        const newPanX = centerX - worldX * newZoom;
        const newPanY = centerY - worldY * newZoom;
        
        setZoomLevel(newZoom);
        setPanOffset({ x: newPanX, y: newPanY });
    } else {
        setZoomLevel(newZoom);
    }
  }

  const handleExportPDF = async () => {
    if (!mapImage) {
      toast({ variant: "destructive", title: "No Map", description: "Please upload a map before exporting." });
      return;
    }

    setIsPrinting(true);
    setSelectedItem(null);
    setEditingItemId(null);
    
    await new Promise(resolve => setTimeout(resolve, 100));

    window.print();
  };

  const handleShare = async () => {
    if (!mapImage || !imageDimensions) {
        toast({ variant: 'destructive', title: 'Cannot Share', description: 'Please upload a map before sharing.' });
        return;
    }
    setIsSharing(true);
    try {
        const mapData: MapData = {
            mapImage,
            imageDimensions,
            items
        };
        const response = await fetch('/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mapData),
        });

        if (!response.ok) {
            throw new Error('Failed to save map to the server.');
        }

        const { id } = await response.json();
        const url = `${window.location.origin}/map/${id}`;
        setShareUrl(url);

        toast({ title: 'Link Ready!', description: 'Your map has been saved and is ready to share.' });
    } catch (error: any) {
        console.error("Sharing failed:", error);
        toast({ variant: 'destructive', title: 'Sharing Failed', description: error.message || 'Could not create a shareable link.' });
    } finally {
        setIsSharing(false);
    }
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

  const transformStyle: React.CSSProperties = {
    transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
    transformOrigin: 'top left',
  };

  return (
    <>
    <div id="app-container" className="flex h-screen w-full bg-background font-body text-foreground">
      <Sidebar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        visibleLayers={visibleLayers}
        onLayerVisibilityChange={handleLayerVisibilityChange}
        onExportPDF={handleExportPDF}
        isExporting={isPrinting}
        onShare={handleShare}
        isSharing={isSharing}
        readOnly={readOnly}
      />
      <MapArea
          ref={mapRef}
          mapImage={mapImage}
          imageDimensions={imageDimensions}
          items={items}
          visibleLayers={visibleLayers}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={handleMapClick}
          onDoubleClick={handleDoubleClick}
          onWheel={handleWheel}
          onMapUpload={handleMapUpload}
          drawingShape={drawingShape}
          selectedItem={selectedItem}
          editingItemId={editingItemId}
          cursorPos={cursorPos}
          showPolygonTooltip={showPolygonTooltip}
          transformStyle={transformStyle}
          isPanning={isPanning}
          readOnly={readOnly}
          activeTool={activeTool}
      />
      {mapImage && (
          <div className='absolute bottom-4 right-4 flex flex-col gap-2'>
              <Button onClick={() => handleZoom('in')} size='icon' variant='outline' className='rounded-full h-9 w-9 bg-background/80 backdrop-blur-sm'>
                  <Plus className='h-4 w-4'/>
              </Button>
                <Button onClick={() => handleZoom('out')} size='icon' variant='outline' className='rounded-full h-9 w-9 bg-background/80 backdrop-blur-sm'>
                  <Minus className='h-4 w-4'/>
              </Button>
          </div>
      )}
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
        readOnly={readOnly}
      />
      <SummaryDialog
        summary={summary}
        onClose={() => setSummary(null)}
      />
      <ShareDialog
        shareUrl={shareUrl}
        onClose={() => setShareUrl(null)}
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
