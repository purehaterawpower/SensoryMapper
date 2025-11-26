'use client';

import { SENSORY_DATA, SENSORY_TYPES } from "@/lib/constants";
import { ActiveTool, SensoryType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { MousePointer, Square, Upload, Landmark, Circle, Pentagon } from "lucide-react";
import { useRef } from "react";
import { Input } from "../ui/input";

type SidebarProps = {
  activeTool: ActiveTool;
  setActiveTool: (tool: ActiveTool) => void;
  visibleLayers: Record<SensoryType, boolean>;
  onLayerVisibilityChange: (layer: SensoryType, visible: boolean) => void;
  onMapUpload: (file: File) => void;
};

export function Sidebar({ activeTool, setActiveTool, visibleLayers, onLayerVisibilityChange, onMapUpload }: SidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleToolChange = (tool: 'select' | 'marker' | 'shape', shape?: 'rectangle' | 'circle' | 'polygon') => {
    if (tool === 'select') {
      setActiveTool({ tool: 'select' });
    } else if (tool === 'marker') {
      const currentType = activeTool.type || SENSORY_TYPES[0];
      setActiveTool({ tool: 'marker', type: currentType });
    } else { // shape
      const currentType = activeTool.type || SENSORY_TYPES[0];
      setActiveTool({ tool: 'shape', type: currentType, shape: shape || 'rectangle' });
    }
  };

  const handleSensoryTypeChange = (type: SensoryType) => {
    if (activeTool.tool !== 'select') {
      setActiveTool({ ...activeTool, type });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onMapUpload(file);
    }
    // Reset file input to allow uploading the same file again
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  return (
    <aside className="w-80 bg-card border-r flex flex-col p-4 gap-4">
      <div className="p-2">
        <h1 className="text-2xl font-bold">SenseMapper</h1>
        <p className="text-sm text-muted-foreground">Map and analyze sensory experiences.</p>
      </div>
      <Separator />

      <div>
        <Input
          type="file"
          id="map-upload"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileUpload}
        />
        <Button onClick={() => fileInputRef.current?.click()} className="w-full">
          <Upload className="mr-2 h-4 w-4" />
          Upload Floor Plan
        </Button>
      </div>


      <TooltipProvider delayDuration={100}>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold px-2">Tools</h2>
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
                    <Landmark className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right"><p>Marker (M)</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant={activeTool.tool === 'shape' && activeTool.shape === 'rectangle' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleToolChange('shape', 'rectangle')}>
                    <Square className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right"><p>Rectangle Zone (Z)</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant={activeTool.tool === 'shape' && activeTool.shape === 'circle' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleToolChange('shape', 'circle')}>
                    <Circle className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right"><p>Circle Zone</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant={activeTool.tool === 'shape' && activeTool.shape === 'polygon' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleToolChange('shape', 'polygon')}>
                    <Pentagon className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right"><p>Polygon Zone</p></TooltipContent>
              </Tooltip>
          </div>
        </div>

        {activeTool.tool !== 'select' && (
          <>
            <Separator />
            <div className="space-y-2">
              <h2 className="text-lg font-semibold px-2">Sensory Type</h2>
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
                          className={cn("h-12 w-12")}
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

      <div className="flex-1 space-y-2 overflow-y-auto">
        <h2 className="text-lg font-semibold px-2">View Layers</h2>
        {SENSORY_TYPES.map(type => {
          const { name, icon: Icon, className } = SENSORY_DATA[type];
          return (
            <div key={type} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted">
              <Checkbox
                id={type}
                checked={visibleLayers[type]}
                onCheckedChange={(checked) => onLayerVisibilityChange(type, !!checked)}
              />
              <Label htmlFor={type} className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <div className={cn("p-1 rounded-md", className)}>
                  <Icon className="w-4 h-4 text-white" />
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
