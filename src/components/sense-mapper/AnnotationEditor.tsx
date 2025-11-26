'use client';

import { getSensorySummary } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { SENSORY_DATA } from "@/lib/constants";
import { Item } from "@/lib/types";
import { Loader2, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

type AnnotationEditorProps = {
  item: Item | null;
  onClose: () => void;
  onSave: (itemId: string, description: string) => void;
  onDelete: (itemId: string) => void;
  onGenerateSummary: (description: string) => Promise<void>;
  isSummaryLoading: boolean;
};

export function AnnotationEditor({ item, onClose, onSave, onDelete, onGenerateSummary, isSummaryLoading }: AnnotationEditorProps) {
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (item) {
      setDescription(item.description);
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
    <Sheet open={!!item} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <div className={`p-1.5 rounded-md ${className}`}>
                <Icon className="w-5 h-5" />
            </div>
            Edit {sensoryName} {'width' in item ? 'Zone' : 'Marker'}
          </SheetTitle>
          <SheetDescription>
            Add or edit the sensory details for this item.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4 flex-1">
          <Label htmlFor="description" className="text-right">
            Description
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-2 min-h-[200px]"
            placeholder="e.g., 'This area has a loud, constant humming noise from the ventilation system.'"
          />
        </div>
        <SheetFooter className="mt-auto">
          <Button variant="destructive" size="icon" onClick={handleDelete} className="mr-auto">
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button onClick={handleGenerateSummary} disabled={isSummaryLoading || !description.trim()}>
            {isSummaryLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
             Generate Insights
          </Button>
          <SheetClose asChild>
            <Button onClick={handleSave}>Save changes</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
