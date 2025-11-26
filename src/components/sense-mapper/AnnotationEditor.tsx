'use client';

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { ALL_SENSORY_DATA } from "@/lib/constants";
import { Item }from "@/lib/types";
import { Loader2, Sparkles, Trash2, Edit } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { ZONE_COLORS, ZoneColor } from "@/lib/zone-colors";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type AnnotationEditorProps = {
  item: Item | null;
  onClose: () => void;
  onSave: (itemId: string, data: { description: string, color?: string }) => void;
  onDelete: (itemId: string) => void;
  onGenerateSummary: (description: string) => Promise<void>;
  isSummaryLoading: boolean;
  onToggleEditMode: (itemId: string) => void;
};

export function AnnotationEditor({ item, onClose, onSave, onDelete, onGenerateSummary, isSummaryLoading, onToggleEditMode }: AnnotationEditorProps) {
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('');
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (item) {
      setDescription(item.description);
      if(item.shape !== 'marker') {
        setColor(item.color || ZONE_COLORS[0].color);
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

  const { name: sensoryName, icon: Icon } = ALL_SENSORY_DATA[item.type];
  const isShape = item.shape !== 'marker';

  const handleSave = () => {
    const data: { description: string, color?: string } = { description };
    if (isShape) {
      data.color = color;
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
                    Edit {sensoryName} {isShape ? 'Area' : 'Marker'}
                </h4>
                <p className="text-sm text-muted-foreground">
                    Add or edit the sensory details for this item.
                </p>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[120px]"
                    placeholder="e.g., 'This area has a loud, constant humming noise...'"
                />
            </div>

            {isShape && (
              <div className="grid gap-2">
                <Label>Area Category</Label>
                <TooltipProvider delayDuration={100}>
                <div className="flex flex-wrap gap-2">
                    {ZONE_COLORS.map((zoneColor: ZoneColor) => (
                        <Tooltip key={zoneColor.id}>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => setColor(zoneColor.color)}
                                    className={cn("w-8 h-8 rounded-full border-2 transition-all",
                                        color === zoneColor.color ? 'border-primary' : 'border-transparent'
                                    )}
                                >
                                    {zoneColor.id === 'extreme' ? (
                                        <svg width="100%" height="100%" className="rounded-full">
                                            <defs>
                                                <pattern id="extreme-pattern-preview" patternUnits="userSpaceOnUse" width="8" height="8">
                                                    <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" stroke="black" strokeWidth="1" />
                                                </pattern>
                                            </defs>
                                            <rect x="0" y="0" width="100%" height="100%" fill="#DC2626" />
                                            <rect x="0" y="0" width="100%" height="100%" fill="url(#extreme-pattern-preview)" />
                                        </svg>
                                    ) : (
                                        <div className="w-full h-full rounded-full" style={{backgroundColor: zoneColor.color}}></div>
                                    )}
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs text-center">
                                <p className="font-bold">{zoneColor.name}</p>
                                <p>{zoneColor.description}</p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </div>
                </TooltipProvider>
              </div>
            )}

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
        </div>
      </PopoverContent>
    </Popover>
  );
}
