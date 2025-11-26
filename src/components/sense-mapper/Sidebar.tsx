'use client';

import { SENSORY_STIMULI_TYPES, PRACTICAL_AMENITY_TYPES, ALL_SENSORY_DATA } from "@/lib/constants";
import { ItemType, ActiveTool } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { MousePointer, MapPin, FileDown, Loader2, Share2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { PolygonIcon } from "../icons/PolygonIcon";

type SidebarProps = {
  activeTool: ActiveTool;
  setActiveTool: (tool: ActiveTool) => void;
  visibleLayers: Record<string, boolean>;
  onLayerVisibilityChange: (layer: ItemType, visible: boolean) => void;
  onExportPDF: () => void;
  isExporting: boolean;
  onShare: () => void;
  isSharing: boolean;
  readOnly?: boolean;
};

export function Sidebar({ activeTool, setActiveTool, visibleLayers, onLayerVisibilityChange, onExportPDF, isExporting, onShare, isSharing, readOnly }: SidebarProps) {

  const handleToolChange = (tool: 'select' | 'shape' | 'marker') => {
    if (readOnly) return;
    if (tool === 'select') {
      setActiveTool({ tool: 'select' });
    } else { 
      const currentType = activeTool.type || SENSORY_STIMULI_TYPES[0];
      if (tool === 'marker') {
        setActiveTool({ tool: 'marker', type: currentType });
      } else { // shape
        setActiveTool({ tool: 'shape', type: currentType, shape: 'polygon' });
      }
    }
  };

  const handleSensoryTypeChange = (type: ItemType) => {
    if (readOnly) return;
    const isPracticalAmenity = PRACTICAL_AMENITY_TYPES.includes(type as any);

    if (activeTool.type === type && activeTool.tool !== 'select') {
        // If the same category is clicked again, switch to select tool
        setActiveTool({ tool: 'select' });
    } else if (isPracticalAmenity) {
      setActiveTool({ tool: 'marker', type });
    } else {
      // Default to polygon shape for sensory areas
      setActiveTool({ tool: 'shape', shape: 'polygon', type });
    }
  };
  
  const selectedItemType = activeTool.tool !== 'select' ? activeTool.type : undefined;

  const renderTypeSection = (title: string, types: ItemType[], withTooltips = false) => {
    if (types.length === 0) return null;
    return (
      <div key={title}>
        <h3 className="text-sm font-semibold px-2 mb-1 text-muted-foreground">{title}</h3>
        <div className="space-y-1">
          {types.map(type => {
              const { icon: Icon, name, color, description } = ALL_SENSORY_DATA[type];
              const isSelected = selectedItemType === type;
              const isAmenity = PRACTICAL_AMENITY_TYPES.includes(type as any);

              const categoryButton = (
                <Button
                  key={type}
                  variant={isSelected ? 'secondary' : 'ghost'}
                  onClick={() => handleSensoryTypeChange(type)}
                  className={cn("h-10 w-full justify-start pl-3 gap-3 rounded-md", readOnly && "cursor-not-allowed")}
                  disabled={readOnly}
                >
                  <div className="p-1.5 rounded-md flex items-center justify-center" style={{backgroundColor: color}}>
                      <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span>{name}</span>
                </Button>
              );

              return (
                  <div key={type}>
                      {withTooltips ? (
                          <Tooltip>
                              <TooltipTrigger asChild>{categoryButton}</TooltipTrigger>
                              <TooltipContent side="right" className="max-w-xs">
                                  <p>{description}</p>
                              </TooltipContent>
                          </Tooltip>
                      ) : categoryButton}
                      
                      {isSelected && !readOnly && (
                        <div className="pl-10 pr-2 py-2">
                          <div className="flex items-center justify-around bg-muted p-1 rounded-md">
                            {isAmenity ? (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant={activeTool.tool === 'marker' ? 'secondary' : 'ghost'} size="icon" className="rounded-full flex-1" onClick={() => handleToolChange('marker')}>
                                            <MapPin className="w-5 h-5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="max-w-xs text-center">
                                        <p className="font-bold">Place Marker</p>
                                        <p>Click on the map to place an amenity icon. (M)</p>
                                    </TooltipContent>
                                </Tooltip>
                            ) : (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant={activeTool.tool === 'shape' && activeTool.shape === 'polygon' ? 'secondary' : 'ghost'} size="icon" className="rounded-full flex-1" onClick={() => handleToolChange('shape')}>
                                      <PolygonIcon className="w-5 h-5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="bottom" className="max-w-xs text-center">
                                      <p className="font-bold">Draw Custom Area</p>
                                      <p>Draw a custom shape by clicking to place points. Click the first point or double-click to finish. (P)</p>
                                  </TooltipContent>
                                </Tooltip>
                            )}
                          </div>
                        </div>
                      )}
                  </div>
              );
          })}
        </div>
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
        
        <div className="p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">SenseMapper</h1>
          <div className="flex gap-2">
            {!readOnly && (
              <Button onClick={onShare} disabled={isSharing} variant="outline" size="sm">
                {isSharing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Share2 className="mr-2 h-4 w-4" />}
                Share
              </Button>
            )}
            <Button onClick={onExportPDF} disabled={isExporting} variant="outline" size="sm">
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
                    <Button variant={activeTool.tool === 'select' ? 'secondary' : 'ghost'} size="icon" className="rounded-full" onClick={() => handleToolChange('select')}>
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
                {renderTypeSection('Sensory', SENSORY_STIMULI_TYPES, true)}
                {renderTypeSection('Facilities', PRACTICAL_AMENITY_TYPES)}
            </div>
            
            <Separator />
            
            <Accordion type="single" collapsible className="w-full" defaultValue="view-layers">
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
