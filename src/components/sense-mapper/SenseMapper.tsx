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
  const [highlightedItem, setHighlightedItem] = useState<Item | null>(null);
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingShape, setDrawingShape] = useState<any>(null);
  const [startCoords, setStartCoords] = useState<Point | null>(null);
  const [cursorPos, setCursorPos] = useState<Point>({ x: 0, y: 0 });
  const [showPolygonTooltip, setShowPolygonTooltip] = useState(false);

  // Editing state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [draggingItem, setDraggingItem] = useState<{ id: string; type: 'item' | 'handle', handleIndex?: number; startPos: Point, startPoints?: Point[] } | null>(null);
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
        setHighlightedItem(null);
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
  
  const getMapCoordinates = useCallback((e: React.MouseEvent | MouseEvent): Point => {
    if (!mapRef.current) return { x: 0, y: 0 };
    const mapRect = mapRef.current.getBoundingClientRect();
    const x = (e.clientX - mapRect.left - panOffset.x) / zoomLevel;
    const y = (e.clientY - mapRect.top - panOffset.y) / zoomLevel;
    return { x, y };
  }, [panOffset.x, panOffset.y, zoomLevel]);
  
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
            imageUrl: null,
            color: ALL_SENSORY_DATA[shapeType].color,
            intensity: shapeType === 'quietRoom' ? undefined : 50,
        };
        setItems(prev => [...prev, newShape]);
        setSelectedItem(newShape);
        setHighlightedItem(newShape);
        setEditingItemId(null);
    }
    setIsDrawing(false);
    setDrawingShape(null);
    setStartCoords(null);
    setShowPolygonTooltip(false);
    setActiveTool({ tool: 'select' });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!mapImage || readOnly || e.button === 2 || e.button === 1) return;
    setDidDrag(false);
    const coords = getMapCoordinates(e);
    const target = e.target as SVGElement;
    
    if (editingItemId) {
      const handleId = target.dataset.handleId;
      if (handleId) {
        e.preventDefault();
        const handleIndex = parseInt(handleId, 10);
        setDraggingItem({ id: editingItemId, type: 'handle', handleIndex, startPos: coords });
        return;
      }
      if (target.dataset.itemType === 'shape-center' && target.dataset.itemId === editingItemId) {
        e.preventDefault();
        const item = items.find(i => i.id === editingItemId) as Shape;
        setDraggingItem({ id: editingItemId, type: 'item', startPos: coords, startPoints: item.shape === 'polygon' ? item.points : undefined });
        return;
      }
    }

    if (activeTool.tool === 'marker' || activeTool.tool === 'shape') {
        e.preventDefault();
        
        if (activeTool.tool === 'shape' && activeTool.shape === 'polygon') {
            if (!isDrawing) {
                setIsDrawing(true);
                setDrawingShape({ shape: 'polygon', points: [coords] });
            } else if (drawingShape) {
                const firstPoint = drawingShape.points[0];
                const dist = Math.hypot(coords.x - firstPoint.x, coords.y - firstPoint.y);
                const clickRadius = 10 / zoomLevel;
                if (drawingShape.points.length > 2 && dist < clickRadius) {
                    finishDrawingPolygon();
                } else {
                    setDrawingShape((prev: any) => ({ ...prev, points: [...prev.points, coords] }));
                }
            }
        } else {
            setIsDrawing(true);
            setStartCoords(coords);
        }
        return;
    }
    
    const itemId = target.closest('[data-item-id]')?.getAttribute('data-item-id');
    if (itemId && activeTool.tool === 'select') {
      e.preventDefault();
      const item = items.find(i => i.id === itemId)!;
      setDraggingItem({ id: itemId, type: 'item', startPos: coords, startPoints: item.shape === 'polygon' ? (item as PolygonShape).points : undefined });
      return;
    }
        
    if (activeTool.tool === 'select' && !itemId) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
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
        const dx = coords.x - draggingItem.startPos.x;
        const dy = coords.y - draggingItem.startPos.y;

        setItems(prevItems => prevItems.map(item => {
            if (item.id !== draggingItem.id) return item;
            
            let updatedItem = { ...item };
            
            if (draggingItem.type === 'item') {
                if (updatedItem.shape === 'marker') {
                    const originalItem = items.find(i => i.id === draggingItem.id) as Marker;
                    updatedItem.x = originalItem.x + dx;
                    updatedItem.y = originalItem.y + dy;
                } else if (updatedItem.shape === 'rectangle') {
                    const originalItem = items.find(i => i.id === draggingItem.id) as RectangleShape;
                    updatedItem.x = originalItem.x + dx;
                    updatedItem.y = originalItem.y + dy;
                } else if (updatedItem.shape === 'circle') {
                    const originalItem = items.find(i => i.id === draggingItem.id) as CircleShape;
                    updatedItem.cx = originalItem.cx + dx;
                    updatedItem.cy = originalItem.cy + dy;
                } else if (updatedItem.shape === 'polygon' && draggingItem.startPoints) {
                    updatedItem.points = draggingItem.startPoints.map(p => ({
                        x: p.x + dx,
                        y: p.y + dy
                    }));
                }
            } else if (draggingItem.type === 'handle' && draggingItem.handleIndex !== undefined) {
                 if (updatedItem.shape === 'rectangle') {
                    const originalItem = items.find(i => i.id === draggingItem.id) as RectangleShape;
                    const corners = [
                        {x: originalItem.x, y: originalItem.y}, 
                        {x: originalItem.x + originalItem.width, y: originalItem.y}, 
                        {x: originalItem.x + originalItem.width, y: originalItem.y + originalItem.height}, 
                        {x: originalItem.x, y: originalItem.y + originalItem.height}
                    ];
                    const oppositeCorner = corners[(draggingItem.handleIndex + 2) % 4];
                    updatedItem.x = Math.min(coords.x, oppositeCorner.x);
                    updatedItem.y = Math.min(coords.y, oppositeCorner.y);
                    updatedItem.width = Math.abs(coords.x - oppositeCorner.x);
                    updatedItem.height = Math.abs(coords.y - oppositeCorner.y);
                } else if (updatedItem.shape === 'circle') {
                    const originalItem = items.find(i => i.id === draggingItem.id) as CircleShape;
                    const newDx = coords.x - originalItem.cx;
                    const newDy = coords.y - originalItem.cy;
                    updatedItem.radius = Math.sqrt(newDx*newDx + newDy*newDy);
                } else if (updatedItem.shape === 'polygon') {
                    const newPoints = [...updatedItem.points];
                    newPoints[draggingItem.handleIndex] = coords;
                    updatedItem.points = newPoints;
                }
            }
            return updatedItem;
        }));
        return;
    }
    
    if (isDrawing && startCoords) {
        setDidDrag(true);
        if (activeTool.tool === 'shape' && activeTool.shape !== 'polygon' && activeTool.type) {
            let shapeData: any = {};
            if (activeTool.shape === 'rectangle') {
                shapeData = {
                    shape: 'rectangle',
                    x: Math.min(startCoords.x, coords.x),
                    y: Math.min(startCoords.y, coords.y),
                    width: Math.abs(startCoords.x - coords.x),
                    height: Math.abs(startCoords.y - coords.y),
                };
            } else if (activeTool.shape === 'circle') {
                const dx = coords.x - startCoords.x;
                const dy = coords.y - startCoords.y;
                shapeData = {
                    shape: 'circle',
                    cx: startCoords.x,
                    cy: startCoords.y,
                    radius: Math.sqrt(dx * dx + dy * dy),
                };
            }
            setDrawingShape(shapeData);
        }
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
    if (draggingItem) {
        const finalCoords = getMapCoordinates(e);
        const dx = finalCoords.x - draggingItem.startPos.x;
        const dy = finalCoords.y - draggingItem.startPos.y;

        setItems(prevItems => prevItems.map(item => {
            if (item.id !== draggingItem.id) return item;

            const updatedItem = { ...item };
            if (draggingItem.type === 'item') {
                if (updatedItem.shape === 'marker') {
                    updatedItem.x += dx;
                    updatedItem.y += dy;
                } else if (updatedItem.shape === 'rectangle') {
                    updatedItem.x += dx;
                    updatedItem.y += dy;
                } else if (updatedItem.shape === 'circle') {
                    updatedItem.cx += dx;
                    updatedItem.cy += dy;
                } else if (updatedItem.shape === 'polygon' && draggingItem.startPoints) {
                    updatedItem.points = draggingItem.startPoints.map(p => ({
                        x: p.x + dx,
                        y: p.y + dy,
                    }));
                }
            } else {
              // Handle resize commit - logic is mostly in mousemove for realtime feedback
            }
            return updatedItem;
        }));
    }

    const coords = getMapCoordinates(e);

    if (isDrawing && activeTool.tool === 'marker' && activeTool.type && !didDrag) {
      const newMarker: Marker = {
        id: crypto.randomUUID(),
        type: activeTool.type,
        shape: 'marker',
        x: coords.x, y: coords.y, description: '', imageUrl: null,
      };
      setItems(prev => [...prev, newMarker]);
      setSelectedItem(newMarker);
      setHighlightedItem(newMarker);
      setActiveTool({ tool: 'select' });
    }
    
    if (isDrawing && activeTool.shape !== 'polygon' && didDrag && activeTool.type) {
        const shapeType = activeTool.type;
        const newShape: Shape = {
            ...drawingShape,
            id: crypto.randomUUID(),
            type: shapeType,
            description: '',
            imageUrl: null,
            color: ALL_SENSORY_DATA[shapeType].color,
            intensity: shapeType === 'quietRoom' ? undefined : 50,
        };
        setItems(prev => [...prev, newShape]);
        setSelectedItem(newShape);
        setHighlightedItem(newShape);
        setActiveTool({ tool: 'select' });
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
    
    if (!didDrag && activeTool.tool === 'select') {
        const target = e.target as HTMLElement;
        const itemId = target.closest('[data-item-id]')?.getAttribute('data-item-id');
        
        if (itemId) {
          const item = items.find(i => i.id === itemId);
          if (item) {
            setHighlightedItem(item);
          }
        } else {
          setHighlightedItem(null);
          setSelectedItem(null);
          setEditingItemId(null);
        }
      }
    
    setTimeout(() => setDidDrag(false), 0);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (readOnly) return;
    if (activeTool.tool === 'shape' && activeTool.shape === 'polygon' && isDrawing) {
      finishDrawingPolygon();
      return;
    }
    const target = e.target as HTMLElement;
    const itemId = target.closest('[data-item-id]')?.getAttribute('data-item-id');
    if (itemId) {
        const item = items.find(i => i.id === itemId);
        if (item) {
            setSelectedItem(item);
        }
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (readOnly) return;
    e.preventDefault();
    const target = e.target as HTMLElement;
    const itemId = target.closest('[data-item-id]')?.getAttribute('data-item-id');
    
    if (itemId) {
      const item = items.find(i => i.id === itemId);
      if (item) {
        setSelectedItem(item);
        setHighlightedItem(item);
      }
    }
  };
  
  const handleSaveAnnotation = (itemId: string, data: { description: string, imageUrl?: string | null, color?: string, intensity?: number }) => {
    if (readOnly) return;
    const updatedItems = items.map(i => i.id === itemId ? { ...i, ...data } : i);
    setItems(updatedItems);
    setSelectedItem(null);
    setEditingItemId(null);
    const updatedItem = updatedItems.find(i => i.id === itemId);
    if (updatedItem) setHighlightedItem(updatedItem);
    toast({ title: "Saved!", description: "Your annotation has been saved." });
  };
  
  const handleDeleteItem = (itemId: string) => {
    if (readOnly) return;
    setItems(items.filter(m => m.id !== itemId));
    setSelectedItem(null);
    setHighlightedItem(null);
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
    setEditingItemId(prevId => {
      const newId = prevId === itemId ? null : itemId;
      if (newId) {
        const itemToEdit = items.find(i => i.id === newId);
        if (itemToEdit) {
            setSelectedItem(itemToEdit);
            setHighlightedItem(itemToEdit);
        }
      }
      return newId;
    });
};

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
        } else if (selectedItem) {
            setSelectedItem(null);
        }
        setDraggingItem(null);
        setActiveTool({tool: 'select'});
        break;
    }
  }, [editingItemId, selectedItem, isDrawing, activeTool, readOnly]);

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
            target: e.target,
            button: e.button,
            clientX: e.clientX,
            clientY: e.clientY
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
  }, [draggingItem, isDrawing, panStart, readOnly, isPanning]);

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
    setHighlightedItem(null);
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
        const response = await fetch('/save/route', {
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
          onDoubleClick={handleDoubleClick}
          onWheel={handleWheel}
          onContextMenu={handleContextMenu}
          onMapUpload={handleMapUpload}
          drawingShape={drawingShape}
          highlightedItem={highlightedItem}
          editingItemId={editingItemId}
          cursorPos={cursorPos}
          showPolygonTooltip={showPolygonTooltip}
          transformStyle={transformStyle}
          isPanning={isPanning}
          readOnly={readOnly}
          activeTool={activeTool}
          zoomLevel={zoomLevel}
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
            setSelectedItem(null);
            setEditingItemId(null);
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

    