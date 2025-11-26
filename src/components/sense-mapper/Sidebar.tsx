'use client';

import { SENSORY_DATA, SENSORY_TYPES } from "@/lib/constants";
import { ActiveTool, SensoryType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { MousePointer, Square, Type } from "lucide-react";

type SidebarProps = {
  activeTool: ActiveTool;
  setActiveTool: (tool: ActiveTool) => void;
  visibleLayers: Record<SensoryType, boolean>;
  onLayerVisibilityChange: (layer: SensoryType, visible: boolean) => void;
};

export function Sidebar({ activeTool, setActiveTool, visibleLayers, onLayerVisibilityChange }: SidebarProps) {
  
  const handleToolChange = (tool: 'select' | 'marker' | 'zone') => {
    if (tool === 'select') {
      setActiveTool({ tool: 'select' });
    } else {
      // Default to first sensory type if none is selected
      const currentType = activeTool.type || SENSORY_TYPES[0];
      setActiveTool({ tool, type: currentType });
    }
  };

  const handleSensoryTypeChange = (type: SensoryType) => {
    if (activeTool.tool !== 'select') {
      setActiveTool({ tool: activeTool.tool, type });
    }
  };

  return (
    <aside className="w-80 bg-card border-r flex flex-col">
      <div className="p-4">
        <h1 className="text-2xl font-bold font-headline text-primary">SenseMapper</h1>
        <p className="text-sm text-muted-foreground">Map and analyze sensory experiences.</p>
      </div>
      <Separator />

      <TooltipProvider delayDuration={100}>
        <div className="p-4 space-y-4">
          <h2 className="text-lg font-semibold">Tools</h2>
          <div className="flex items-center space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant={activeTool.tool === 'select' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleToolChange('select')}>
                    <MousePointer className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right"><p>Select (V)</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant={activeTool.tool === 'marker' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleToolChange('marker')}>
                    <Type className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right"><p>Marker (M)</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant={activeTool.tool === 'zone' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleToolChange('zone')}>
                    <Square className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right"><p>Zone (Z)</p></TooltipContent>
              </Tooltip>
          </div>
        </div>

        {activeTool.tool !== 'select' && (
          <>
            <Separator />
            <div className="p-4 space-y-4">
              <h2 className="text-lg font-semibold">Sensory Type</h2>
              <div className="grid grid-cols-4 gap-2">
                {SENSORY_TYPES.map(type => {
                  const Icon = SENSORY_DATA[type].icon;
                  return (
                    <Tooltip key={type}>
                      <TooltipTrigger asChild>
                        <Button
                          variant={activeTool.type === type ? 'secondary' : 'ghost'}
                          size="icon"
                          onClick={() => handleSensoryTypeChange(type)}
                          className={cn("h-12 w-12", SENSORY_DATA[type].className.replace('bg-', 'hover:bg-'))}
                        >
                          <Icon className="w-6 h-6" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top"><p>{SENSORY_DATA[type].name}</p></TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </TooltipProvider>

      <Separator />

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <h2 className="text-lg font-semibold">Layers</h2>
        {SENSORY_TYPES.map(type => {
          const { name, icon: Icon, className } = SENSORY_DATA[type];
          return (
            <div key={type} className="flex items-center space-x-3">
              <Checkbox
                id={type}
                checked={visibleLayers[type]}
                onCheckedChange={(checked) => onLayerVisibilityChange(type, !!checked)}
              />
              <Label htmlFor={type} className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <div className={cn("p-1 rounded-md", className)}>
                  <Icon className="w-4 h-4" />
                </div>
                {name}
              </Label>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
