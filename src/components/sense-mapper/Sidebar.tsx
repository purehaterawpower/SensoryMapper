'use client';

import { SENSORY_STIMULI_TYPES, RESPITE_ZONE_TYPES, PRACTICAL_AMENITY_TYPES, ALL_SENSORY_DATA } from "@/lib/constants";
import { ItemType, ActiveTool } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { MousePointer, Square, Upload, Circle } from "lucide-react";
import { useRef } from "react";
import { Input } from "../ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { PolygonIcon } from "../icons/PolygonIcon";

type SidebarProps = {
  activeTool: ActiveTool;
  setActiveTool: (tool: ActiveTool) => void;
  visibleLayers: Record<string, boolean>;
  onLayerVisibilityChange: (layer: ItemType, visible: boolean) => void;
  onMapUpload: (file: File) => void;
};

export function Sidebar({ activeTool, setActiveTool, visibleLayers, onLayerVisibilityChange, onMapUpload }: SidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleToolChange = (tool: 'select' | 'shape', shape?: 'rectangle' | 'circle' | 'polygon') => {
    if (tool === 'select') {
      setActiveTool({ tool: 'select' });
    } else { // shape
      const currentType = activeTool.type || SENSORY_STIMULI_TYPES[0];
      setActiveTool({ tool: 'shape', type: currentType, shape: shape || 'rectangle' });
    }
  };

  const handleSensoryTypeChange = (type: ItemType) => {
    if (activeTool.tool === 'select') {
        // If select tool is active, switch to shape tool with the new type
        setActiveTool({ tool: 'shape', shape: 'rectangle', type });
    } else {
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
  
  const selectedItemType = activeTool.tool !== 'select' ? activeTool.type : undefined;

  const renderTypeButtons = (types: ItemType[]) => {
    return types.map(type => {
        const { icon: Icon, name, color } = ALL_SENSORY_DATA[type];
        return (
            <Button
                key={type}
                variant={selectedItemType === type ? 'secondary' : 'ghost'}
                onClick={() => handleSensoryTypeChange(type)}
                className="h-10 w-full justify-start pl-3 gap-3 rounded-md"
            >
                <div className="p-1.5 rounded-md flex items-center justify-center" style={{backgroundColor: color}}>
                    <Icon className="w-4 h-4 text-white" />
                </div>
                <span>{name}</span>
            </Button>
        );
    });
  }

  const renderLayerCheckboxes = (types: ItemType[]) => {
    return types.map(type => {
      const { icon: Icon, name } = ALL_SENSORY_DATA[type];
      const isVisible = visibleLayers[type];
      return (
        <div key={type} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted">
          <div className={`p-1 rounded-md`} style={{ backgroundColor: ALL_SENSORY_DATA[type].color }}>
              <Icon className="w-4 h-4 text-white" />
          </div>
          <Label htmlFor={`layer-${type}`} className="flex-1 font-normal">{name}</Label>
          <Checkbox
            id={`layer-${type}`}
            checked={isVisible}
            onCheckedChange={(checked) => onLayerVisibilityChange(type, !!checked)}
          />
        </div>
      );
    });
  }

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
          accept="image/*,application/pdf"
          onChange={handleFileUpload}
        />
        <Button onClick={() => fileInputRef.current?.click()} className="w-full">
          <Upload className="mr-2 h-4 w-4" />
          Upload Floor Plan
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-4">
        <div>
            <h2 className="text-lg font-semibold px-2 mb-2">Sensory</h2>
            <div className="flex flex-col gap-1">
                {renderTypeButtons(SENSORY_STIMULI_TYPES)}
            </div>
        </div>

        <div>
            <h2 className="text-lg font-semibold px-2 mb-2">Respite Zones</h2>
            <div className="flex flex-col gap-1">
                {renderTypeButtons(RESPITE_ZONE_TYPES)}
            </div>
        </div>

        <div>
            <h2 className="text-lg font-semibold px-2 mb-2">Practical Amenities</h2>
            <div className="flex flex-col gap-1">
                {renderTypeButtons(PRACTICAL_AMENITY_TYPES)}
            </div>
        </div>
      </div>
      
      <Separator />

      <TooltipProvider delayDuration={100}>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold px-2">Tools</h2>
          <div className="flex items-center justify-around">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant={activeTool.tool === 'select' ? 'secondary' : 'ghost'} size="icon" className="rounded-full" onClick={() => handleToolChange('select')}>
                    <MousePointer className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom"><p>Select (V)</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant={activeTool.tool === 'shape' && activeTool.shape === 'rectangle' ? 'secondary' : 'ghost'} size="icon" className="rounded-full" onClick={() => handleToolChange('shape', 'rectangle')}>
                    <Square className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom"><p>Draw Rectangle Zone (R)</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant={activeTool.tool === 'shape' && activeTool.shape === 'circle' ? 'secondary' : 'ghost'} size="icon" className="rounded-full" onClick={() => handleToolChange('shape', 'circle')}>
                    <Circle className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom"><p>Draw Circle Zone (C)</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant={activeTool.tool === 'shape' && activeTool.shape === 'polygon' ? 'secondary' : 'ghost'} size="icon" className="rounded-full" onClick={() => handleToolChange('shape', 'polygon')}>
                    <PolygonIcon className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs text-center">
                    <p className="font-bold">Draw Polygon Zone (P)</p>
                    <p>Draw a custom shape by clicking to place points. Click the first point or double-click to finish.</p>
                </TooltipContent>
              </Tooltip>
          </div>
        </div>
      </TooltipProvider>

      <Separator />

      <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
        <AccordionItem value="item-1" className="border-b-0">
          <AccordionTrigger className="py-2 px-2 text-lg font-semibold hover:no-underline">
              View Layers
          </AccordionTrigger>
          <AccordionContent className="pt-2 space-y-4">
            <div>
              <h3 className="text-sm font-semibold px-2 mb-1 text-muted-foreground">Sensory</h3>
              <div className="space-y-1">
                {renderLayerCheckboxes(SENSORY_STIMULI_TYPES)}
              </div>
            </div>
             <div>
              <h3 className="text-sm font-semibold px-2 mb-1 text-muted-foreground">Respite Zones</h3>
              <div className="space-y-1">
                {renderLayerCheckboxes(RESPITE_ZONE_TYPES)}
              </div>
            </div>
             <div>
              <h3 className="text-sm font-semibold px-2 mb-1 text-muted-foreground">Practical Amenities</h3>
              <div className="space-y-1">
                {renderLayerCheckboxes(PRACTICAL_AMENITY_TYPES)}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </aside>
  );
}
