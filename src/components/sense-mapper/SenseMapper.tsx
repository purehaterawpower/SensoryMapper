'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { MapArea } from './MapArea';
import { AnnotationEditor } from './AnnotationEditor';
import { Item, Marker, Shape, Point, ActiveTool, SensoryType } from '@/lib/types';
import { SENSORY_TYPES } from '@/lib/constants';
import { getSensorySummary } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { SummaryDialog } from './SummaryDialog';
import { ZONE_COLORS } from '@/lib/zone-colors';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source for pdf.js
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}


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
        }
        reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                if (e.target?.result) {
                    const typedArray = new Uint8Array(e.target.result as ArrayBuffer);
                    const pdf = await pdfjsLib.getDocument(typedArray).promise;
                    const page = await pdf.getPage(1);
                    
                    const viewport = page.getViewport({ scale: 2 });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    
                    if (context) {
                        const renderContext = {
                            canvasContext: context,
                            viewport: viewport,
                        };
                        await page.render(renderContext).promise;
                        const dataUrl = canvas.toDataURL('image/png');
                        handleImageLoad(dataUrl);
                        toast({ title: "PDF Map Uploaded", description: "You can now add markers and shapes to your new map." });
                    }
                }
            };
            reader.readAsArrayBuffer(file);
        } catch (error) {
            console.error("Error processing PDF:", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to process the PDF file." });
        }
    }
  };

  const handleLayerVisibilityChange = (layer: SensoryType, visible: boolean) => {
    setVisibleLayers(prev => ({ ...prev, [layer]: visible }));
  };

  const handleItemSelect = (item: Item | null) => {
    if (editingItemId && item?.id !== editingItemId && !item) {
        // When in edit mode, don't allow deselecting
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
  
  const handleItemDrag = (id: string, newPos: Point, originalItem: Item) => {
    setItems(prevItems => prevItems.map(item => {
      if (item.id !== id) return item;

      let dx = 0;
      let dy = 0;
      if (originalItem.shape === 'marker') {
        dx = newPos.x - originalItem.x;
        dy = newPos.y - originalItem.y;
      } else if (originalItem.shape === 'rectangle') {
        dx = newPos.x - (originalItem.x + originalItem.width / 2);
        dy = newPos.y - (originalItem.y + originalItem.height / 2);
      } else if (originalItem.shape === 'circle') {
        dx = newPos.x - originalItem.cx;
        dy = newPos.y - originalItem.cy;
      } else if (originalItem.shape === 'polygon') {
        // Use centroid for dragging polygon
        const sum = originalItem.points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
        const centroid = { x: sum.x / originalItem.points.length, y: sum.y / originalItem.points.length };
        dx = newPos.x - centroid.x;
        dy = newPos.y - centroid.y;
      }

      if (item.shape === 'marker') {
        return { ...item, x: item.x + dx, y: item.y + dy };
      }
      if (item.shape === 'rectangle') {
        return { ...item, x: item.x + dx, y: item.y + dy };
      }
      if (item.shape === 'circle') {
        return { ...item, cx: item.cx + dx, cy: item.cy + dy };
      }
      if (item.shape === 'polygon') {
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

      return updatedShape;
    }));
  }

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
    if (itemId) {
      const item = items.find(i => i.id === itemId);
      if (item) {
        if (activeTool.tool === 'select' || item.shape !== 'marker') {
          let dragStartPos = { x: 0, y: 0 };
          
          if (item.shape === 'marker') dragStartPos = {x: item.x, y: item.y};
          else if (item.shape === 'rectangle') dragStartPos = {x: item.x + item.width/2, y: item.y + item.height/2};
          else if (item.shape === 'circle') dragStartPos = {x: item.cx, y: item.cy};
          else if (item.shape === 'polygon') {
             const sum = item.points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
             dragStartPos = { x: sum.x / item.points.length, y: sum.y / item.points.length };
          }
          
          setDraggingItem({ id: itemId, type: 'item', offset: { x: coords.x - dragStartPos.x, y: coords.y - dragStartPos.y }});
        }
      }
      e.stopPropagation();
      return;
    }
    
    if ((activeTool.tool === 'marker' || activeTool.tool === 'shape') && activeTool.type) {
      if (editingItemId) return; // Don't start drawing if an item is being edited.
      setIsDrawing(true);
      setStartCoords(coords);
      
      if (activeTool.tool === 'shape' && activeTool.shape === 'polygon') {
        if (!drawingShape) {
          setDrawingShape({ shape: 'polygon', points: [coords] });
        } else {
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
        const originalItem = items.find(i => i.id === draggingItem.id);
        if (!originalItem) return;
        const newCenterPos = { x: coords.x - draggingItem.offset.x, y: coords.y - draggingItem.offset.y };
        handleItemDrag(draggingItem.id, newCenterPos, originalItem);
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
      } else if (activeTool.shape !== 'polygon' || (drawingShape?.points && drawingShape.points.length > 2)) {
        const newShape: Shape = {
          ...drawingShape,
          id: crypto.randomUUID(),
          type: activeTool.type,
          description: '',
          color: ZONE_COLORS[0].color,
        };
        setItems(prev => [...prev, newShape]);
        setSelectedItem(newShape);
        setEditingItemId(newShape.id);
      }
    }
    
    if (activeTool.shape !== 'polygon' || (drawingShape?.points && drawingShape.points.length > 2)) {
      setIsDrawing(false);
      setDrawingShape(null);
      setStartCoords(null);
    }
  };

  const handleMapClick = (e: React.MouseEvent) => {
    // If we are in edit mode, a click on the background should NOT deselect the item.
    if (editingItemId) {
        if (!e.defaultPrevented) {
            setSelectedItem(null);
            setEditingItemId(null);
         }
        return;
    }

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
        setSelectedItem(newMarker);
    } else {
       if (!e.defaultPrevented) {
          setSelectedItem(null);
          setEditingItemId(null);
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
    setEditingItemId(prev => {
        const newId = prev === itemId ? null : itemId;
        if(newId) {
            // If we are entering edit mode, make sure the item is selected
            const itemToEdit = items.find(i => i.id === newId);
            if(itemToEdit) setSelectedItem(itemToEdit);
        } else {
            // If we are exiting edit mode, deselect the item
            setSelectedItem(null);
        }
        return newId;
    });
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
      case 'r':
        setActiveTool(prev => ({ tool: 'shape', shape: 'rectangle', type: prev.type || SENSORY_TYPES[0] }));
        break;
      case 'c':
        setActiveTool(prev => ({ tool: 'shape', shape: 'circle', type: prev.type || SENSORY_TYPES[0] }));
        break;
      case 'p':
        setActiveTool(prev => ({ tool: 'shape', shape: 'polygon', type: prev.type || SENSORY_TYPES[0] }));
        break;
      case 'escape':
        if (isDrawing) {
            setIsDrawing(false);
            setDrawingShape(null);
            setStartCoords(null);
        } else if (editingItemId) {
            setEditingItemId(null);
            setSelectedItem(null);
        } else if (selectedItem) {
            setSelectedItem(null);
        }
        setDraggingItem(null);
        break;
    }
  }, [editingItemId, selectedItem, isDrawing]);

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
                // We need to stop propagation to avoid other listeners from firing.
                // Since this is a synthetic event we'll create a simple mock for it.
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
      if(isDrawing) {
          handleMouseUp();
      }
    }
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [draggingItem, isDrawing, handleMouseMove, handleMouseUp]);

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
        onClose={() => { 
            if (editingItemId) return;
            setSelectedItem(null); 
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
  );
}
