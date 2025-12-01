'use client';

import { DrawingShape } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RectangleIcon } from '@/components/icons/RectangleIcon';
import { CircleIcon } from '@/components/icons/CircleIcon';
import { PolygonIcon } from '@/components/icons/PolygonIcon';

type ShapeToolbarProps = {
  activeShape: DrawingShape;
  onShapeSelect: (shape: DrawingShape) => void;
};

export function ShapeToolbar({ activeShape, onShapeSelect }: ShapeToolbarProps) {
  const shapeTools: { shape: DrawingShape; icon: React.FC<any>; name: string, shortcut: string }[] = [
    { shape: 'rectangle', icon: RectangleIcon, name: 'Rectangle', shortcut: 'R' },
    { shape: 'circle', icon: CircleIcon, name: 'Circle', shortcut: 'C' },
    { shape: 'polygon', icon: PolygonIcon, name: 'Polygon', shortcut: 'P' },
  ];

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-card p-2 rounded-full shadow-lg border flex gap-2">
      <TooltipProvider delayDuration={100}>
        {shapeTools.map(({ shape, icon: Icon, name, shortcut }) => (
          <Tooltip key={shape}>
            <TooltipTrigger asChild>
              <Button
                variant={activeShape === shape ? 'secondary' : 'ghost'}
                size="icon"
                className="rounded-full w-10 h-10"
                onClick={() => onShapeSelect(shape)}
              >
                <Icon className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{name} ({shortcut})</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
}
