'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ShareDialogProps = {
  shareUrl: string | null;
  onClose: () => void;
};

export function ShareDialog({ shareUrl, onClose }: ShareDialogProps) {
  const { toast } = useToast();

  const handleCopy = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      toast({ title: "Copied!", description: "The link has been copied to your clipboard." });
    }
  };

  if (!shareUrl) return null;

  return (
    <Dialog open={!!shareUrl} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Map</DialogTitle>
          <DialogDescription>
            Anyone with this link will be able to view a read-only version of your map.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
                <Input
                    id="link"
                    defaultValue={shareUrl}
                    readOnly
                />
            </div>
            <Button type="submit" size="icon" className="px-3" onClick={handleCopy}>
                <span className="sr-only">Copy</span>
                <Copy className="h-4 w-4" />
            </Button>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    