'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";

type ShareDialogProps = {
  shareUrl: string | null;
  editCode: string | null;
  onClose: () => void;
};

export function ShareDialog({ shareUrl, editCode, onClose }: ShareDialogProps) {
  const { toast } = useToast();

  const handleCopy = (textToCopy: string, type: 'Link' | 'Code') => {
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      toast({ title: "Copied!", description: `The ${type} has been copied to your clipboard.` });
    }
  };

  const fullEditUrl = shareUrl && editCode ? `${shareUrl}?editCode=${editCode}` : null;

  return (
    <Dialog open={!!shareUrl} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share & Edit</DialogTitle>
          <DialogDescription>
            Your map is saved. Use the links below to share or edit it later.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="share-link" className="text-sm font-medium">View-Only Link</Label>
                <p className="text-xs text-muted-foreground">Anyone with this link can view your map.</p>
                <div className="flex items-center space-x-2">
                    <Input id="share-link" value={shareUrl || ''} readOnly />
                    <Button type="button" size="icon" className="shrink-0" onClick={() => handleCopy(shareUrl || '', 'Link')}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            {fullEditUrl && (
              <>
                <Separator />

                <div className="space-y-2">
                    <Label htmlFor="edit-code" className="text-sm font-medium">Your Private Edit Link</Label>
                    <p className="text-xs text-muted-foreground">
                        <span className="font-bold">Important:</span> Save this link to edit your map later. Do not share it.
                    </p>
                    <div className="flex items-center space-x-2">
                        <Input id="edit-code" value={fullEditUrl} readOnly />
                        <Button type="button" size="icon" className="shrink-0" onClick={() => handleCopy(fullEditUrl, 'Link')}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
              </>
            )}
        </div>
        <DialogFooter className="sm:justify-end">
          <Button onClick={onClose} type="button">Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
