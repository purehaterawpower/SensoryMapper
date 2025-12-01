'use client';

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { ALL_SENSORY_DATA, PRACTICAL_AMENITY_TYPES } from "@/lib/constants";
import { Item, Point, Marker } from "@/lib/types";
import { Trash2, Edit, Upload, X, Music } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { interpolateColor } from "@/lib/color-utils";
import Image from "next/image";
import { Input } from "@/components/ui/input";

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
  const [audio, setAudio] = useState<string | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    if (item) {
      setDescription(item.description || '');
      setImage(item.imageUrl || null);
      setAudio(item.audioUrl || null);
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
      setAudio(null);
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
  // Hide size controls completely in readOnly mode as it is not relevant info for the viewer
  const showSizeSlider = isFacility && !readOnly;
  const shapeName = item.shape === 'polygon' ? 'Custom Area' : 'Area';
  
  const placeholderText = `e.g., Describe the ${sensoryName.toLowerCase()} input. What does it feel, look, or sound like? Consider: ${sensoryDescription}`;

  const handleSave = () => {
    const data: Partial<Item> = { description, imageUrl: image, audioUrl: audio };
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

  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ variant: 'destructive', title: 'File too large', description: 'Please upload an audio file smaller than 5MB.'});
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAudio(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const sliderColor = showIntensitySlider ? interpolateColor(intensity) : '';
  const headerColor = ALL_SENSORY_DATA[item.type].color;

  return (
    <Popover open={!!item} onOpenChange={(open) => { if (!open) onClose() }}>
        <PopoverTrigger asChild>
            <div ref={triggerRef} />
        </PopoverTrigger>
      <PopoverContent 
        className="w-80 shadow-xl" 
        side="right" 
        align="center" 
        alignOffset={-140} 
        sideOffset={10} 
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="grid gap-4">
            {/* HEADER SECTION */}
            <div className={`flex items-center gap-3 ${readOnly ? 'mb-1' : ''}`}>
                <div 
                    className="p-2 rounded-lg shadow-sm shrink-0" 
                    style={{backgroundColor: showIntensitySlider ? sliderColor : headerColor}}
                >
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="space-y-0.5">
                    <h4 className="font-semibold text-lg leading-none">
                        {readOnly ? sensoryName : `Edit ${sensoryName}`}
                    </h4>
                    {!readOnly && (
                        <p className="text-xs text-muted-foreground">
                            {isShape ? shapeName : 'Marker'}
                        </p>
                    )}
                </div>
            </div>

            {/* CONTENT SECTION */}
            <div className="grid gap-4">
                {/* Image Section - Hidden in readOnly if no image exists */}
                {(!readOnly || image) && (
                    <div className="grid gap-2">
                        {!readOnly && <Label>Image</Label>}
                        {image ? (
                            <div className="relative rounded-lg overflow-hidden border bg-muted">
                                <Image src={image} alt="Annotation image" width={288} height={162} className="object-cover w-full aspect-video" />
                                {!readOnly && (
                                    <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7 shadow-sm" onClick={() => setImage(null)} aria-label="Remove image">
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ) : (
                            !readOnly && (
                                <>
                                <Input
                                    type="file"
                                    id="image-upload"
                                    ref={imageInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                                <Button variant="outline" className="w-full border-dashed" onClick={() => imageInputRef.current?.click()}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Photo
                                </Button>
                                </>
                            )
                        )}
                    </div>
                )}
                
                {/* Audio Section */}
                {(!readOnly || audio) && (
                    <div className="grid gap-2">
                         {!readOnly && <Label>Audio</Label>}
                         {audio ? (
                             <div className="relative rounded-lg overflow-hidden border bg-muted p-2">
                                <audio controls src={audio} className="w-full" />
                                {!readOnly && (
                                    <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7 shadow-sm" onClick={() => setAudio(null)} aria-label="Remove audio">
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                         ) : (
                            !readOnly && (
                                <>
                                <Input
                                    type="file"
                                    id="audio-upload"
                                    ref={audioInputRef}
                                    className="hidden"
                                    accept="audio/*"
                                    onChange={handleAudioUpload}
                                />
                                <Button variant="outline" className="w-full border-dashed" onClick={() => audioInputRef.current?.click()}>
                                    <Music className="mr-2 h-4 w-4" />
                                    Upload Audio
                                </Button>
                                </>
                            )
                         )}
                    </div>
                )}

                {/* Description Section */}
                <div className="grid gap-2">
                    {!readOnly && <Label htmlFor="description">Description</Label>}
                    
                    {readOnly ? (
                        <div className="text-sm leading-relaxed text-foreground/90 p-3 bg-muted/50 rounded-md">
                            {description || <span className="text-muted-foreground italic text-xs">No additional details provided.</span>}
                        </div>
                    ) : (
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="min-h-[100px] resize-none"
                            placeholder={placeholderText}
                        />
                    )}
                </div>

                {/* Sensory Intensity - Meter vs Slider */}
                {showIntensitySlider && (
                    <div className={`grid gap-2 ${readOnly ? 'mt-1' : ''}`}>
                        <Label className={readOnly ? "text-xs uppercase text-muted-foreground font-semibold" : ""}>
                            Sensory Intensity
                        </Label>
                        
                        {readOnly ? (
                            // READ ONLY: Visual Meter
                            <div className="space-y-1.5">
                                <div className="h-2.5 w-full bg-secondary/50 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full transition-all duration-300 ease-out"
                                        style={{ 
                                            width: `${intensity}%`, 
                                            backgroundColor: sliderColor 
                                        }} 
                                    />
                                </div>
                                <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-medium tracking-wider">
                                    <span>Low</span>
                                    <span>High</span>
                                </div>
                            </div>
                        ) : (
                            // EDIT MODE: Slider
                            <>
                                <Slider
                                    value={[intensity]}
                                    onValueChange={handleSliderChange}
                                    max={100}
                                    step={1}
                                    style={{ '--slider-color': sliderColor } as React.CSSProperties}
                                    rangeClassName="bg-[--slider-color]"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Low</span>
                                    <span>Medium</span>
                                    <span>High</span>
                                </div>
                            </>
                        )}
                    </div>
                )}
                
                {/* Size Slider - Only visible in Edit Mode */}
                {showSizeSlider && (
                    <div className="grid gap-4 pt-2">
                        <Label>Icon Size</Label>
                        <Slider
                            value={[iconSize]}
                            onValueChange={handleSizeSliderChange}
                            max={100}
                            step={1}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Small</span>
                            <span>Medium</span>
                            <span>Large</span>
                        </div>
                    </div>
                )}

                {/* Action Buttons - Only visible in Edit Mode */}
                {!readOnly && (
                    <div className="flex justify-between items-center pt-2 mt-2 border-t">
                        <Button variant="ghost" size="icon" onClick={handleDelete} className="text-muted-foreground hover:text-destructive transition-colors" title="Delete item" aria-label="Delete item">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                        <div className="flex gap-2">
                            {isShape && (
                                <Button onClick={handleToggleEditMode} variant="outline" size="sm" title="Adjust Shape">
                                    <Edit className="h-3.5 w-3.5 mr-2" />
                                    Adjust Shape
                                </Button>
                            )}
                            <Button onClick={handleSave} size="sm">Save Changes</Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
