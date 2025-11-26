'use client';

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { ALL_SENSORY_DATA } from "@/lib/constants";
import { Item }from "@/lib/types";
import { Loader2, Sparkles, Trash2, Edit, Upload, X } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { interpolateColor, colorToIntensity } from "@/lib/color-utils";
import Image from "next/image";
import { Input } from "../ui/input";

type AnnotationEditorProps = {
  item: Item | null;
  onClose: () => void;
  onSave: (itemId: string, data: { description:string, imageUrl?: string | null, color?: string, intensity?: number }) => void;
  onDelete: (itemId: string) => void;
  onGenerateSummary: (description: string) => Promise<void>;
  isSummaryLoading: boolean;
  onToggleEditMode: (itemId: string) => void;
  readOnly?: boolean;
};

export function AnnotationEditor({ item, onClose, onSave, onDelete, onGenerateSummary, isSummaryLoading, onToggleEditMode, readOnly }: AnnotationEditorProps) {
  const [description, setDescription] = useState('');
  const [intensity, setIntensity] = useState(50);
  const [image, setImage] = useState<string | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    if (item) {
      setDescription(item.description);
      setImage(item.imageUrl || null);
      if(item.shape !== 'marker') {
        setIntensity(item.intensity ?? colorToIntensity(item.color) ?? 50);
      }
    }
  }, [item]);
  
  useEffect(() => {
    if (item && triggerRef.current) {
        const style = triggerRef.current.style;
        style.position = 'absolute';
        
        if (item.shape === 'marker') {
            style.left = `${item.x}px`;
            style.top = `${item.y}px`;
            style.width = `0px`;
            style.height = `0px`;
        } else if (item.shape === 'rectangle') {
            style.left = `${item.x + item.width / 2}px`;
            style.top = `${item.y + item.height / 2}px`;
            style.width = `0px`;
            style.height = `0px`;
        } else if (item.shape === 'circle') {
            style.left = `${item.cx}px`;
            style.top = `${item.cy}px`;
            style.width = `0px`;
            style.height = `0px`;
        } else if (item.shape === 'polygon') {
            // Find centroid of polygon
            let cx = 0, cy = 0;
            item.points.forEach(p => { cx += p.x; cy += p.y; });
            style.left = `${cx / item.points.length}px`;
            style.top = `${cy / item.points.length}px`;
            style.width = `0px`;
            style.height = `0px`;
        }
    }
  }, [item]);

  if (!item) return null;

  const { name: sensoryName, icon: Icon, description: sensoryDescription } = ALL_SENSORY_DATA[item.type];
  const isShape = item.shape !== 'marker';
  const showColorPicker = isShape && item.type !== 'quietArea';
  const shapeName = item.shape === 'polygon' ? 'Custom Area' : 'Area';

  const handleSave = () => {
    const data: { description: string, imageUrl?: string | null, color?: string, intensity?: number } = { description, imageUrl: image };
    if (showColorPicker) {
      data.color = interpolateColor(intensity);
      data.intensity = intensity;
    }
    onSave(item.id, data);
  };

  const handleDelete = () => {
    onDelete(item.id);
  };
  
  const handleGenerateSummary = async () => {
    await onGenerateSummary(description);
  }

  const handleToggleEditMode = () => {
    onToggleEditMode(item.id);
  }

  const handleSliderChange = (value: number[]) => {
    setIntensity(value[0]);
  }
  
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

  return (
    <Popover open={!!item} onOpenChange={(open) => !open && onClose()}>
        <PopoverTrigger asChild>
            <div ref={triggerRef} />
        </PopoverTrigger>
      <PopoverContent className="w-80" side="right" align="start" sideOffset={10}>
        <div className="grid gap-4">
            <div className="space-y-2">
                <h4 className="font-medium leading-none flex items-center gap-2">
                    <div className={`p-1.5 rounded-md`} style={{backgroundColor: ALL_SENSORY_DATA[item.type].color}}>
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
                <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[120px]"
                    placeholder={readOnly ? 'No description provided.' : `e.g., Describe the ${sensoryName.toLowerCase()} like ${sensoryDescription.toLowerCase()}`}
                    readOnly={readOnly}
                />
            </div>
            
            <div className="grid gap-2">
              <Label>Image</Label>
              {image ? (
                <div className="relative">
                  <Image src={image} alt="Annotation image" width={288} height={162} className="rounded-md object-cover w-full aspect-video" />
                  {!readOnly && (
                    <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => setImage(null)}>
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

            {showColorPicker && (
              <div className="grid gap-4 pt-2">
                <Label>Intensity</Label>
                <Slider
                  value={[intensity]}
                  onValueChange={handleSliderChange}
                  max={100}
                  step={1}
                  disabled={readOnly}
                />
                 <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Moderate</span>
                    <span>High</span>
                </div>
              </div>
            )}

            {!readOnly && (
                <div className="flex justify-between items-center">
                    <Button variant="destructive" size="icon" onClick={handleDelete} className="mr-auto">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                    <div className="flex gap-2">
                        {isShape && (
                            <Button onClick={handleToggleEditMode} variant="outline" size="icon" title="Adjust Shape">
                                <Edit className="h-4 w-4" />
                            </Button>
                        )}
                        <Button onClick={handleGenerateSummary} disabled={isSummaryLoading || !description.trim()} variant="outline">
                            {isSummaryLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            Insights
                        </Button>
                        <Button onClick={handleSave}>Save</Button>
                    </div>
                </div>
            )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

    