'use client';

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { ALL_SENSORY_DATA, PRACTICAL_AMENITY_TYPES } from "@/lib/constants";
import { Item, Point, Marker }from "@/lib/types";
import { Trash2, Edit, Upload, X } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { interpolateColor } from "@/lib/color-utils";
import Image from "next/image";
import { Input } from "../ui/input";

type AnnotationEditorProps = {
  item: Item | null;
  onClose: () => void;
  onSave: (itemId: string, data: Partial<Item>) => void;
  onDelete: (itemId: string) => void;
  onToggleEditMode: (itemId: string) => void;
  readOnly?: boolean;
  panOffset: Point;
  zoomLevel: number;
};

export function AnnotationEditor({ item, onClose, onSave, onDelete, onToggleEditMode, readOnly, panOffset, zoomLevel }: AnnotationEditorProps) {
  const [description, setDescription] = useState('');
  const [intensity, setIntensity] = useState(50);
  const [iconSize, setIconSize] = useState(50);
  const [image, setImage] = useState<string | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    if (item) {
      setDescription(item.description || '');
      setImage(item.imageUrl || null);
      if(item.shape !== 'marker' && item.type !== 'quietRoom') {
        setIntensity(item.intensity ?? 50);
      }
      if (item.shape === 'marker') {
        setIconSize((item as Marker).size ?? 50);
      }
    } else {
      // Reset state when no item is selected
      setDescription('');
      setImage(null);
      setIntensity(50);
      setIconSize(50);
    }
  }, [item]);
  
  useEffect(() => {
    if (item && triggerRef.current) {
        const style = triggerRef.current.style;
        style.position = 'absolute';
        
        let targetMapX = 0, targetMapY = 0;

        if (item.shape === 'marker') {
            targetMapX = item.x;
            targetMapY = item.y;
        } else if (item.shape === 'rectangle') {
            targetMapX = item.x + item.width / 2;
            targetMapY = item.y + item.height / 2;
        } else if (item.shape === 'circle') {
            targetMapX = item.cx;
            targetMapY = item.cy;
        } else if (item.shape === 'polygon') {
            let cx = 0, cy = 0;
            item.points.forEach(p => { cx += p.x; cy += p.y; });
            targetMapX = cx / item.points.length;
            targetMapY = cy / item.points.length;
        }
        
        const screenX = (targetMapX * zoomLevel) + panOffset.x;
        const screenY = (targetMapY * zoomLevel) + panOffset.y;

        style.left = `${screenX}px`;
        style.top = `${screenY}px`;
        style.width = `0px`;
        style.height = `0px`;
    }
  }, [item, panOffset, zoomLevel]);

  if (!item) return null;

  const { name: sensoryName, icon: Icon, description: sensoryDescription } = ALL_SENSORY_DATA[item.type];
  const isShape = item.shape !== 'marker';
  const isFacility = item.shape === 'marker' && PRACTICAL_AMENITY_TYPES.some(t => t === item.type);
  const showIntensitySlider = isShape && item.type !== 'quietRoom';
  const showSizeSlider = isFacility;
  const shapeName = item.shape === 'polygon' ? 'Custom Area' : 'Area';
  
  const placeholderText = `e.g., Describe the ${sensoryName.toLowerCase()} input. What does it feel, look, or sound like? Consider: ${sensoryDescription}`;
  const noDescriptionText = 'No description provided.';

  const handleSave = () => {
    const data: Partial<Item> = { description, imageUrl: image };
    if (showIntensitySlider) {
      data.color = interpolateColor(intensity);
      data.intensity = intensity;
    }
    if (showSizeSlider) {
      (data as Marker).size = iconSize;
    }
    onSave(item.id, data);
  };

  const handleDelete = () => {
    onDelete(item.id);
  };

  const handleToggleEditMode = () => {
    onToggleEditMode(item.id);
  }

  const handleSliderChange = (value: number[]) => {
    setIntensity(value[0]);
  }
  
  const handleSizeSliderChange = (value: number[]) => {
    setIconSize(value[0]);
  };
  
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({ variant: 'destructive', title: 'File too large', description: 'Please upload an image smaller than 2MB.'});
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const sliderColor = showIntensitySlider ? interpolateColor(intensity) : '';

  return (
    <Popover open={!!item} onOpenChange={(open) => { if (!open) onClose() }}>
        <PopoverTrigger asChild>
            <div ref={triggerRef} />
        </PopoverTrigger>
      <PopoverContent className="w-80" side="right" align="center" alignOffset={-140} sideOffset={10} onOpenAutoFocus={(e) => e.preventDefault()}>
        <div className="grid gap-4">
            <div className="space-y-2">
                <h4 className="font-medium leading-none flex items-center gap-2">
                    <div className={`p-1.5 rounded-md`} style={{backgroundColor: showIntensitySlider ? sliderColor : ALL_SENSORY_DATA[item.type].color}}>
                        <Icon className="w-5 h-5 text-white" />
                    </div>
                    {readOnly ? '' : 'Edit'} {sensoryName} {isShape ? shapeName : 'Marker'}
                </h4>
                <p className="text-sm text-muted-foreground">
                    {readOnly ? 'Details for this annotation.' : 'Add or edit the sensory details for this item.'}
                </p>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                {readOnly ? (
                    <div className="min-h-[120px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm">
                        {description ? (
                            <p>{description}</p>
                        ) : (
                            <p className="text-muted-foreground">{noDescriptionText}</p>
                        )}
                    </div>
                ) : (
                    <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="min-h-[120px]"
                        placeholder={placeholderText}
                    />
                )}
            </div>
            
            <div className="grid gap-2">
              <Label>Image</Label>
              {image ? (
                <div className="relative">
                  <Image src={image} alt="Annotation image" width={288} height={162} className="rounded-md object-cover w-full aspect-video" />
                  {!readOnly && (
                    <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => setImage(null)} aria-label="Remove image">
                        <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ) : (
                <>
                 <Input
                    type="file"
                    id="image-upload"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={readOnly}
                  />
                  {readOnly ? (
                     <p className="text-sm text-muted-foreground">No image was uploaded for this annotation.</p>
                  ) : (
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={readOnly}>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Image
                    </Button>
                  )}
                </>
              )}
            </div>

            {showIntensitySlider && (
              <div className="grid gap-4 pt-2">
                <Label>Sensory Level</Label>
                <Slider
                  value={[intensity]}
                  onValueChange={handleSliderChange}
                  max={100}
                  step={1}
                  disabled={readOnly}
                  style={{ '--slider-color': sliderColor } as React.CSSProperties}
                  rangeClassName="bg-[--slider-color]"
                />
                 <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Low</span>
                    <span>Medium</span>
                    <span>High</span>
                </div>
              </div>
            )}
            
            {showSizeSlider && (
              <div className="grid gap-4 pt-2">
                <Label>Icon Size</Label>
                <Slider
                  value={[iconSize]}
                  onValueChange={handleSizeSliderChange}
                  max={100}
                  step={1}
                  disabled={readOnly}
                />
                 <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Small</span>
                    <span>Medium</span>
                    <span>Large</span>
                </div>
              </div>
            )}


            {!readOnly && (
                <div className="flex justify-between items-center">
                    <Button variant="destructive" size="icon" onClick={handleDelete} className="mr-auto" title="Delete item" aria-label="Delete item">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                    <div className="flex gap-2">
                        {isShape && (
                            <Button onClick={handleToggleEditMode} variant="outline" size="icon" title="Adjust Shape" aria-label="Adjust Shape">
                                <Edit className="h-4 w-4" />
                            </Button>
                        )}
                        <Button onClick={handleSave}>Save</Button>
                    </div>
                </div>
            )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
