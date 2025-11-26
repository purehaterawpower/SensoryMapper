'use client';

import { getSensorySummary } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { SENSORY_DATA } from "@/lib/constants";
import { Item } from "@/lib/types";
import { Loader2, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";

type AnnotationEditorProps = {
  item: Item | null;
  onClose: () => void;
  onSave: (itemId: string, description: string) => void;
  onDelete: (itemId: string) => void;
  onGenerateSummary: (description: string) => Promise<void>;
  isSummaryLoading: boolean;
  mapRef: React.RefObject<HTMLDivElement>;
};

export function AnnotationEditor({ item, onClose, onSave, onDelete, onGenerateSummary, isSummaryLoading, mapRef }: AnnotationEditorProps) {
  const [description, setDescription] = useState('');
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (item) {
      setDescription(item.description);
    }
  }, [item]);

  useEffect(() => {
    if (item && triggerRef.current) {
        // Position the trigger over the selected item
        const style = triggerRef.current.style;
        style.position = 'absolute';
        style.left = `${item.x}px`;
        style.top = `${item.y}px`;
        if ('width' in item) {
            style.width = `${item.width}px`;
            style.height = `${item.height}px`;
        } else {
            style.width = '0px';
            style.height = '0px';
        }
    }
  }, [item]);

  if (!item) return null;

  const { name: sensoryName, icon: Icon, className } = SENSORY_DATA[item.type];

  const handleSave = () => {
    onSave(item.id, description);
  };

  const handleDelete = () => {
    onDelete(item.id);
  };
  
  const handleGenerateSummary = async () => {
    await onGenerateSummary(description);
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
                    <div className={`p-1.5 rounded-md ${className}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    Edit {sensoryName} {'width' in item ? 'Zone' : 'Marker'}
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
                    placeholder="e.g., 'This area has a loud, constant humming noise from the ventilation system.'"
                />
            </div>
            <div className="flex justify-between items-center">
                 <Button variant="destructive" size="icon" onClick={handleDelete} className="mr-auto">
                    <Trash2 className="w-4 h-4" />
                </Button>
                <div className="flex gap-2">
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
