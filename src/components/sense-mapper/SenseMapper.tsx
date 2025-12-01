'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { MapArea } from './MapArea';
import { AnnotationEditor } from './AnnotationEditor';
import { Item, Shape, Point, ActiveTool, ItemType, Marker, MapData, RectangleShape, CircleShape, PolygonShape, PrintOrientation } from '@/lib/types';
import { ALL_SENSORY_TYPES, ALL_SENSORY_DATA, PRACTICAL_AMENITY_TYPES } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { PrintableReport } from './PrintableReport';
import { ShareDialog } from './ShareDialog';
import { Button } from '../ui/button';
import { Plus, Minus } from 'lucide-react';
import { saveMap } from '@/app/actions';

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
  const [draggingItem, setDraggingItem] = useState<{ id: string; type: 'item' | 'handle', handleIndex?: number; startPos: Point, itemStartPos: Point | Point[] } | null>(null);
  const [didDrag, setDidDrag] = useState(false);

  // Viewport state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState<Point>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point | null>(null);

  const [mapImage, setMapImage] = useState<string | null>(initialData?.mapImage || null);
  const [imageDimensions, setImageDimensions] = useState<{width: number, height: number} | null>(initialData?.imageDimensions || null);
  
  const [isPrinting, setIsPrinting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [printOrientation, setPrintOrientation] = useState<PrintOrientation>('portrait');
  const [exportIconScale, setExportIconScale] = useState(100);

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
  
  const getMapCoordinates = (e: React.MouseEvent | MouseEvent): Point => {
    if (!mapRef.current) return { x: 0, y: 0 };
    const mapRect = mapRef.current.getBoundingClientRect();
    const x = (e.clientX - mapRect.left - panOffset.x) / zoomLevel;
    const y = (e.clientY - mapRect.top - panOffset.y) / zoomLevel;
    return { x, y };
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
    if (e.button === 2 || e.button === 1) return; // Ignore right and middle mouse button
    
    // In readOnly mode, all mouse down does is pan
    if (readOnly) {
        setIsPanning(true);
        setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
        return;
    }

    if (!mapImage) return;

    setDidDrag(false);
    const coords = getMapCoordinates(e);
    const target = e.target as SVGElement;
    
    // Logic for interacting with edit handles
    if (editingItemId) {
      const handleId = target.dataset.handleId;
      if (handleId) {
        e.preventDefault();
        const handleIndex = parseInt(handleId, 10);
        const item = items.find(i => i.id === editingItemId) as Shape;
        setDraggingItem({ id: editingItemId, type: 'handle', handleIndex, startPos: coords, itemStartPos: (item as PolygonShape).points || {x: 0, y: 0} });
        return;
      }
      // Dragging the center of a shape
      if (target.dataset.itemType === 'shape-center' && target.dataset.itemId === editingItemId) {
        e.preventDefault();
        const item = items.find(i => i.id === editingItemId) as Shape;
        let itemStartPos: Point | Point[] = { x: 0, y: 0 };
        if (item.shape === 'rectangle') itemStartPos = { x: item.x, y: item.y };
        else if (item.shape === 'circle') itemStartPos = { x: item.cx, y: item.cy };
        else if (item.shape === 'polygon') itemStartPos = item.points;

        setDraggingItem({ id: editingItemId, type: 'item', startPos: coords, itemStartPos });
        return;
      }
    }

    // Logic for drawing tools
    if (activeTool.tool === 'marker' || activeTool.tool === 'shape') {
        e.preventDefault();
        
        if (activeTool.tool === 'shape' && activeTool.shape === 'polygon') {
            if (!isDrawing) { // First click for a new polygon
                setIsDrawing(true);
                setDrawingShape({ shape: 'polygon', points: [coords] });
            } else if (drawingShape) { // Subsequent clicks for the same polygon
                const firstPoint = drawingShape.points[0];
                const dist = Math.hypot(coords.x - firstPoint.x, coords.y - firstPoint.y);
                const clickRadius = 10 / zoomLevel;
                if (drawingShape.points.length > 3 && dist < clickRadius) {
                    finishDrawingPolygon();
                } else {
                    setDrawingShape((prev: any) => ({ ...prev, points: [...prev.points, coords] }));
                }
            }
        } else { // For markers, rectangles, and circles
            setIsDrawing(true);
            setStartCoords(coords);
        }
        return;
    }
    
    // Logic for the select tool
    const itemId = target.closest('[data-item-id]')?.getAttribute('data-item-id');
    if (itemId && activeTool.tool === 'select') {
      e.preventDefault();
      const item = items.find(i => i.id === itemId)!;
      let itemStartPos: Point | Point[] = {x:0, y:0};
      if(item.shape === 'marker') itemStartPos = { x: item.x, y: item.y };
      else if (item.shape === 'rectangle') itemStartPos = { x: item.x, y: item.y };
      else if (item.shape === 'circle') itemStartPos = { x: item.cx, y: item.cy };
      else if (item.shape === 'polygon') itemStartPos = (item as PolygonShape).points;
      
      setDraggingItem({ id: itemId, type: 'item', startPos: coords, itemStartPos });
      return;
    }
        
    // If not interacting with an item, start panning
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

    if (readOnly) return;

    if (draggingItem) {
        setDidDrag(true);
        const dx = coords.x - draggingItem.startPos.x;
        const dy = coords.y - draggingItem.startPos.y;

        if (draggingItem.type === 'handle' && draggingItem.handleIndex !== undefined) {
          handleHandleDrag(draggingItem.handleIndex, coords);
        } else if (draggingItem.type === 'item') {
            setItems(prevItems => prevItems.map(item => {
                if (item.id !== draggingItem.id) return item;
                
                let updatedItem = { ...item };
                
                if (updatedItem.shape === 'marker' && 'x' in draggingItem.itemStartPos) {
                    updatedItem.x = draggingItem.itemStartPos.x + dx;
                    updatedItem.y = draggingItem.itemStartPos.y + dy;
                } else if (updatedItem.shape === 'rectangle' && 'x' in draggingItem.itemStartPos) {
                    updatedItem.x = draggingItem.itemStartPos.x + dx;
                    updatedItem.y = draggingItem.itemStartPos.y + dy;
                } else if (updatedItem.shape === 'circle' && 'x' in draggingItem.itemStartPos) {
                    updatedItem.cx = draggingItem.itemStartPos.x + dx;
                    updatedItem.cy = draggingItem.itemStartPos.y + dy;
                } else if (updatedItem.shape === 'polygon' && Array.isArray(draggingItem.itemStartPos)) {
                    updatedItem.points = draggingItem.itemStartPos.map(p => ({
                        x: p.x + dx,
                        y: p.y + dy
                    }));
                }
                return updatedItem;
            }));
        }
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
      setShowPolygonTooltip(dist < 10 / zoomLevel && drawingShape.points.length > 2);
    } else {
      setShowPolygonTooltip(false);
    }
  };
  
  const handleMouseUp = (e: React.MouseEvent) => {
    // Shared read-only logic
    if (readOnly) {
        setIsPanning(false);
        setPanStart(null);
        if (!didDrag) {
            const target = e.target as HTMLElement;
            const itemId = target.closest('[data-item-id]')?.getAttribute('data-item-id');
            if (itemId) {
                const item = items.find(i => i.id === itemId);
                if (item) {
                    setSelectedItem(item);
                    setHighlightedItem(item);
                }
            } else {
                setSelectedItem(null);
                setHighlightedItem(null);
            }
        }
        setDidDrag(false);
        return;
    }

    // Editable mode logic from here
    if (draggingItem) {
        if (didDrag) {
            const finalCoords = getMapCoordinates(e);
            if (draggingItem.type === 'handle' && draggingItem.handleIndex !== undefined) {
                handleHandleDrag(draggingItem.handleIndex, finalCoords);
            }
        }
    }

    const coords = getMapCoordinates(e);

    // Create marker on simple click (no drag)
    if (isDrawing && activeTool.tool === 'marker' && activeTool.type && !didDrag) {
      const isFacility = PRACTICAL_AMENITY_TYPES.some(t => t === activeTool.type);
      const newMarker: Marker = {
        id: crypto.randomUUID(),
        type: activeTool.type,
        shape: 'marker',
        x: coords.x, y: coords.y, description: '', imageUrl: null,
        size: isFacility ? 50 : undefined,
      };
      setItems(prev => [...prev, newMarker]);
      setSelectedItem(newMarker);
      setHighlightedItem(newMarker);
      setActiveTool({ tool: 'select' });
    }
    
    // Create shape on drag
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

    // Reset drawing state for non-polygon tools
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
    
    // Handle item selection on click (no drag)
    if (!didDrag && activeTool.tool === 'select') {
        const target = e.target as HTMLElement;
        const itemId = target.closest('[data-item-id]')?.getAttribute('data-item-id');
        
        if (itemId) {
          const item = items.find(i => i.id === itemId);
          if (item) {
            setHighlightedItem(item);
          }
        } else {
          // Clicked on empty space
          setHighlightedItem(null);
          setSelectedItem(null);
          setEditingItemId(null);
        }
      }
    
    // Reset didDrag state after a short delay
    setTimeout(() => setDidDrag(false), 0);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    // In read-only mode, double click should open the annotation editor
    if (readOnly) {
      const target = e.target as HTMLElement;
      const itemId = target.closest('[data-item-id]')?.getAttribute('data-item-id');
      if (itemId) {
          const item = items.find(i => i.id === itemId);
          if (item) {
              setSelectedItem(item);
              setHighlightedItem(item);
          }
      }
      return;
    }

    // In edit mode, double click finishes a polygon
    if (activeTool.tool === 'shape' && activeTool.shape === 'polygon' && isDrawing) {
      finishDrawingPolygon();
      return;
    }

    // In edit mode, double click on an item opens the editor
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
  
  const handleSaveAnnotation = (itemId: string, data: Partial<Item>) => {
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

  const handleToggleEditMode = (itemId: string) => {
    if (readOnly) return;
    setEditingItemId(prevId => {
      const newId = prevId === itemId ? null : itemId;
      if (newId) {
        const itemToEdit = items.find(i => i.id === newId);
        if (itemToEdit) {
            setSelectedItem(itemToEdit); // Ensure the item is selected when toggling edit mode on
            setHighlightedItem(itemToEdit);
        }
      } else {
        setSelectedItem(null); // Deselect when toggling off
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
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if(draggingItem || isDrawing || (isPanning && panStart)) {
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
  }, [draggingItem, isDrawing, panStart, readOnly, isPanning, handleMouseMove, handleMouseUp]);

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

    setSelectedItem(null);
    setHighlightedItem(null);
    setEditingItemId(null);
    setIsPrinting(true);
  };
  
  useEffect(() => {
    if (isPrinting) {
      const print = () => {
        window.print();
      };
      
      const handleAfterPrint = () => {
        setIsPrinting(false);
      };

      // A small timeout to allow the printable content to render
      const timer = setTimeout(print, 100);
      
      window.addEventListener('afterprint', handleAfterPrint);
      
      return () => {
        clearTimeout(timer);
        window.removeEventListener('afterprint', handleAfterPrint);
      };
    }
  }, [isPrinting]);

  const handleShare = async () => {
    if (readOnly || !mapImage || !imageDimensions) {
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
        const { id, error } = await saveMap(mapData);

        if (error || !id) {
            throw new Error(error || 'Failed to save map and get ID.');
        }

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

  const transformStyle: React.CSSProperties = {
    transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
    transformOrigin: 'top left',
  };

  const annotationEditorContainerStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  };

  return (
    <>
    <div id="app-container" className="flex h-screen w-full bg-background font-body text-foreground">
      {!readOnly && (
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
            printOrientation={printOrientation}
            setPrintOrientation={setPrintOrientation}
            exportIconScale={exportIconScale}
            setExportIconScale={setExportIconScale}
          />
      )}
      <main className="flex-1 relative flex flex-col">
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
            editingItemId={readOnly ? null : editingItemId}
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
                <Button onClick={() => handleZoom('in')} size='icon' variant='outline' className='rounded-full h-9 w-9 bg-background/80 backdrop-blur-sm' aria-label="Zoom in">
                    <Plus className='h-4 w-4'/>
                </Button>
                  <Button onClick={() => handleZoom('out')} size='icon' variant='outline' className='rounded-full h-9 w-9 bg-background/80 backdrop-blur-sm' aria-label="Zoom out">
                    <Minus className='h-4 w-4'/>
                </Button>
            </div>
        )}
        <div style={annotationEditorContainerStyle}>
          <AnnotationEditor
            item={selectedItem}
            onClose={() => {
                setSelectedItem(null);
                if (!readOnly && !items.find(it => it.id === editingItemId)) {
                    setEditingItemId(null);
                }
                if(readOnly) {
                  setHighlightedItem(null);
                }
            }}
            onSave={handleSaveAnnotation}
            onDelete={handleDeleteItem}
            onToggleEditMode={handleToggleEditMode}
            readOnly={readOnly}
            panOffset={panOffset}
            zoomLevel={zoomLevel}
          />
        </div>
      </main>
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
              printOrientation={printOrientation}
              iconScale={exportIconScale}
            />
        </div>
    )}
    </>
  );
}
