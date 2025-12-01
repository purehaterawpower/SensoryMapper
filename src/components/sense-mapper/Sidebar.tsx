'use client';

import { SENSORY_STIMULI_TYPES, PRACTICAL_AMENITY_TYPES, ALL_SENSORY_DATA } from "@/lib/constants";
import { ItemType, ActiveTool, PrintOrientation } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { MousePointer, FileDown, Loader2, Share2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

type SidebarProps = {
  activeTool: ActiveTool;
  setActiveTool: (tool: ActiveTool) => void;
  visibleLayers: Record<string, boolean>;
  onLayerVisibilityChange: (layer: ItemType, visible: boolean) => void;
  onExportPDF: () => void;
  isExporting: boolean;
  onShare: () => void;
  isSharing: boolean;
  printOrientation: PrintOrientation;
  setPrintOrientation: (orientation: PrintOrientation) => void;
  readOnly?: boolean;
};

export function Sidebar({ activeTool, setActiveTool, visibleLayers, onLayerVisibilityChange, onExportPDF, isExporting, onShare, isSharing, printOrientation, setPrintOrientation, readOnly }: SidebarProps) {

  const handleToolChange = (type: ItemType) => {
    if (readOnly) return;

    if (activeTool.type === type) {
      setActiveTool({ tool: 'select' });
    } else {
      const isAmenity = PRACTICAL_AMENITY_TYPES.includes(type as any);
      if (isAmenity) {
        setActiveTool({ tool: 'marker', type });
      } else {
        setActiveTool({ tool: 'shape', shape: 'polygon', type });
      }
    }
  };

  const renderTypeSection = (title: string, types: ItemType[]) => {
    if (types.length === 0) return null;

    const onValueChange = (value: string) => {
      if (value) {
        handleToolChange(value as ItemType);
      }
    };

    return (
      <div key={title}>
        <h3 className="text-sm font-semibold px-2 mb-2 text-muted-foreground">{title}</h3>
        <RadioGroup
          value={activeTool.type}
          onValueChange={onValueChange}
          className="space-y-1"
          disabled={readOnly}
        >
          {types.map(type => {
            const { icon: Icon, name, color, description } = ALL_SENSORY_DATA[type];
            
            return (
              <Tooltip key={type}>
                <TooltipTrigger asChild>
                  <Label
                    htmlFor={`tool-${type}`}
                    className={cn(
                      "flex items-center gap-3 w-full h-10 pl-3 rounded-md cursor-pointer transition-colors hover:bg-muted",
                      activeTool.type === type && "bg-secondary",
                      readOnly && "cursor-not-allowed opacity-50"
                    )}
                  >
                    <RadioGroupItem value={type} id={`tool-${type}`} className="sr-only" />
                    <div className="p-1.5 rounded-md flex items-center justify-center" style={{ backgroundColor: color }}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="flex-1">{name}</span>
                  </Label>
                </TooltipTrigger>
                <TooltipContent side="right" align="start" className="max-w-xs text-left">
                  <p className="font-bold mb-1">
                    {name}
                  </p>
                  <p className="text-muted-foreground">{description}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </RadioGroup>
      </div>
    );
  }

  const renderLayerCheckboxes = (title: string, types: ItemType[]) => {
    if (types.length === 0) return null;
    return (
      <div key={title}>
        <h3 className="text-sm font-semibold px-2 mb-1 text-muted-foreground">{title}</h3>
        {types.map(type => {
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
        })}
      </div>
    );
  }

  return (
    <aside id="sidebar" className="w-80 bg-card border-r flex flex-col">
      <TooltipProvider delayDuration={100}>
        
        <div className="p-4 flex flex-col gap-4">
            <h1 className="text-xl font-bold">SenseMapper</h1>
            <div className="flex gap-2">
                {!readOnly && (
                <Button onClick={onShare} disabled={isSharing} variant="outline" size="sm" className="flex-1">
                    {isSharing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Share2 className="mr-2 h-4 w-4" />}
                    Share
                </Button>
                )}
                <Button onClick={onExportPDF} disabled={isExporting} variant="outline" size="sm" className="flex-1">
                    {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                    Export
                </Button>
            </div>
        </div>
        <Separator/>

        {!readOnly && (
            <div className="p-4 flex items-center justify-around border-b">
                <Tooltip>
                  <TooltipTrigger asChild>
                      <Button 
                        variant={activeTool.tool === 'select' ? 'secondary' : 'ghost'} 
                        size="icon" 
                        className="rounded-full" 
                        onClick={() => setActiveTool({ tool: 'select' })}
                        aria-label="Select Tool (V)"
                      >
                        <MousePointer className="w-5 h-5" />
                      </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs text-center">
                      <p className="font-bold">Select</p>
                      <p>Select, move, and edit items on the map. (V)</p>
                  </TooltipContent>
                </Tooltip>
                <p className="text-sm text-muted-foreground">Select a category below to start drawing</p>
            </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="space-y-4">
                <h2 className="text-lg font-semibold px-2">{readOnly ? 'Map Key' : 'Map Categories'}</h2>
                {renderTypeSection('Sensory', SENSORY_STIMULI_TYPES)}
                {renderTypeSection('Facilities', PRACTICAL_AMENITY_TYPES)}
            </div>
            
            <Separator />

            <Accordion type="multiple" className="w-full" defaultValue={['view-layers']}>
              <AccordionItem value="export-options" className="border-b-0">
                  <AccordionTrigger className="py-2 px-2 text-lg font-semibold hover:no-underline rounded-md hover:bg-muted">
                      Export Options
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 space-y-4 px-2">
                      <div>
                          <Label className="text-sm font-medium">Page Orientation</Label>
                          <RadioGroup 
                              value={printOrientation} 
                              onValueChange={(value) => setPrintOrientation(value as PrintOrientation)}
                              className="mt-2"
                          >
                              <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="portrait" id="portrait" />
                                  <Label htmlFor="portrait" className="font-normal">Portrait</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="landscape" id="landscape" />
                                  <Label htmlFor="landscape" className="font-normal">Landscape</Label>
                              </div>
                          </RadioGroup>
                      </div>
                  </AccordionContent>
              </AccordionItem>
                <AccordionItem value="view-layers" className="border-b-0">
                <AccordionTrigger className="py-2 px-2 text-lg font-semibold hover:no-underline rounded-md hover:bg-muted">
                    View Layers
                </AccordionTrigger>
                <AccordionContent className="pt-2 space-y-4">
                    {renderLayerCheckboxes('Sensory', SENSORY_STIMULI_TYPES)}
                    {renderLayerCheckboxes('Facilities', PRACTICAL_AMENITY_TYPES)}
                </AccordionContent>
                </AccordionItem>
            </Accordion>

        </div>
      </TooltipProvider>
    </aside>
  );
}
