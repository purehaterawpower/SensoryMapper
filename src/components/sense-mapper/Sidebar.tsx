
'use client';

import { SENSORY_STIMULI_TYPES, PRACTICAL_AMENITY_TYPES, ALL_SENSORY_DATA } from "@/lib/constants";
import { Item, ItemType, ActiveTool, PrintOrientation } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { FileDown, Loader2, Save, HelpCircle, FilePlus2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Slider } from "../ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ScrollArea } from "../ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


type SidebarProps = {
  activeTool: ActiveTool;
  setActiveTool: (tool: ActiveTool) => void;
  visibleLayers: Record<string, boolean>;
  onLayerVisibilityChange: (layer: ItemType, visible: boolean) => void;
  onExportPDF: () => void;
  isExporting: boolean;
  onSave: () => void;
  onNewMap: () => void;
  isSaving: boolean;
  printOrientation: PrintOrientation;
  setPrintOrientation: (orientation: PrintOrientation) => void;
  exportIconScale: number;
  setExportIconScale: (scale: number) => void;
  readOnly?: boolean;
  items: Item[];
  showNumberedIcons: boolean;
  setShowNumberedIcons: (show: boolean) => void;
  isExistingMap: boolean;
  hasUnsavedChanges: boolean;
};

export function Sidebar({ 
  activeTool, 
  setActiveTool, 
  visibleLayers, 
  onLayerVisibilityChange, 
  onExportPDF, 
  isExporting, 
  onSave,
  onNewMap,
  isSaving, 
  printOrientation, 
  setPrintOrientation,
  exportIconScale,
  setExportIconScale,
  readOnly,
  items,
  showNumberedIcons,
  setShowNumberedIcons,
  isExistingMap,
  hasUnsavedChanges,
}: SidebarProps) {
  const [isExportPopoverOpen, setIsExportPopoverOpen] = useState(false);
  const pathname = usePathname();

  const handleToolChange = (type: ItemType) => {
    if (readOnly) return;
    
    const isSensory = SENSORY_STIMULI_TYPES.includes(type);
    
    if (isSensory) {
      setActiveTool({ tool: 'shape', type: type, shape: 'polygon' });
    } else {
      setActiveTool({ tool: 'marker', type: type });
    }
  };

  const renderTypeSection = (title: string, types: ItemType[]) => {
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

  const renderLayerCheckboxes = () => {
    const areAllFacilitiesVisible = PRACTICAL_AMENITY_TYPES.every(type => visibleLayers[type]);
    const areSomeFacilitiesVisible = PRACTICAL_AMENITY_TYPES.some(type => visibleLayers[type]);
    
    const masterCheckboxState = areAllFacilitiesVisible ? true : areSomeFacilitiesVisible ? 'indeterminate' : false;

    return (
      <>
        <div>
            <h3 className="text-sm font-semibold px-2 mb-1 text-muted-foreground">Sensory</h3>
            {SENSORY_STIMULI_TYPES.map(type => {
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
        <Accordion type="single" collapsible className="w-full" defaultValue={readOnly ? undefined : 'facilities'}>
          <AccordionItem value="facilities" className="border-b-0">
            <div className="flex items-center rounded-md hover:bg-muted pr-2">
              <AccordionTrigger className="py-2 px-2 flex-1 font-normal hover:no-underline flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-gray-400 border" />
                <span className="flex-1 text-left">Facilities</span>
              </AccordionTrigger>
              <Checkbox
                  checked={masterCheckboxState}
                  onClick={(e) => {
                      e.stopPropagation();
                      const nextState = !areAllFacilitiesVisible;
                      PRACTICAL_AMENITY_TYPES.forEach(type => {
                          onLayerVisibilityChange(type, nextState);
                      });
                  }}
                  className="ml-auto"
              />
            </div>
            <AccordionContent className="pt-1 pl-4 space-y-1">
              {PRACTICAL_AMENITY_TYPES.map(type => {
                const { icon: Icon, name } = ALL_SENSORY_DATA[type];
                return (
                  <div key={type} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50">
                    <div className="p-1 rounded-md" style={{ backgroundColor: ALL_SENSORY_DATA[type].color }}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <Label htmlFor={`layer-${type}`} className="flex-1 font-normal">{name}</Label>
                    <Checkbox
                        id={`layer-${type}`}
                        checked={visibleLayers[type]}
                        onCheckedChange={(checked) => onLayerVisibilityChange(type, !!checked)}
                    />
                  </div>
                )
              })}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </>
    );
  }
  
  const renderNumberedItems = () => (
    <div className="p-4 space-y-3">
        <h3 className="text-lg font-semibold px-2">Annotations</h3>
        <ScrollArea className="h-[calc(100vh-400px)]">
            <div className="space-y-2 pr-4">
                {items.map((item, index) => {
                    if (!visibleLayers[item.type]) return null;
                    const { name, icon: Icon, color } = ALL_SENSORY_DATA[item.type];
                    return (
                        <div key={item.id} className="text-sm p-2 rounded-md border bg-muted/30">
                            <div className="flex items-start gap-3">
                                <div className="font-bold text-muted-foreground">{index + 1}.</div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="p-1 rounded-md" style={{ backgroundColor: item.color || color }}>
                                            <Icon className="w-3 h-3 text-white" />
                                        </div>
                                        <span className="font-semibold">{name}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-snug">
                                        {item.description || "No details provided."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </ScrollArea>
    </div>
);


  const handleExportClick = () => {
    onExportPDF();
    setIsExportPopoverOpen(false);
  }

  const faqLink = readOnly ? `/faq?view=readonly&back=${encodeURIComponent(pathname)}` : "/faq";

  return (
    <aside id="sidebar" className="w-80 bg-card border-r flex flex-col h-screen">
      <TooltipProvider delayDuration={100}>
        <div className="p-4 flex flex-col gap-4 border-b">
          <h1 className="text-xl font-bold">Sensory Mapper</h1>
          <div className="grid grid-cols-2 gap-2">
            {!readOnly && (
              <>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" disabled={!hasUnsavedChanges}>
                      <FilePlus2 className="mr-2 h-4 w-4" />
                      New
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Start a New Map?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will clear your current unsaved map. Are you sure you want to continue?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={onNewMap}>Start New Map</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button onClick={onSave} disabled={isSaving} variant="outline" size="sm">
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {isExistingMap ? 'Save & Update' : 'Save & Share'}
                </Button>
              </>
            )}
            <Popover open={isExportPopoverOpen} onOpenChange={setIsExportPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={cn("flex-1", readOnly && "col-span-full")}>
                  <FileDown className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64" align="start">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Export to PDF</h4>
                    <p className="text-sm text-muted-foreground">
                      Configure the layout for your PDF export.
                    </p>
                  </div>
                  <div className="grid gap-4">
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
                    <div className="grid gap-2">
                      <Label>Icon Size</Label>
                      <Slider
                        value={[exportIconScale]}
                        onValueChange={(value) => setExportIconScale(value[0])}
                        min={50}
                        max={150}
                        step={10}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Small</span>
                        <span>Default</span>
                        <span>Large</span>
                      </div>
                    </div>
                  </div>
                  <Button onClick={handleExportClick} disabled={isExporting} className="w-full">
                    {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Print to PDF
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Button asChild variant="outline" size="sm" className="h-9">
              <Link href={faqLink} title="Frequently Asked Questions">
                <HelpCircle className="mr-2 h-4 w-4" /> Help
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {!readOnly ? (
            <>
              <div className="p-4 space-y-4">
                  <h2 className="text-lg font-semibold px-2">Map Categories</h2>
                  {renderTypeSection('Sensory', SENSORY_STIMULI_TYPES)}
                  {renderTypeSection('Facilities', PRACTICAL_AMENITY_TYPES)}
              </div>
              <Separator />
            </>
          ) : null}

          <div className="p-4 space-y-4">
              <Accordion type="single" collapsible className="w-full" defaultValue={'view-layers'}>
                  <AccordionItem value="view-layers" className="border-b-0">
                  <AccordionTrigger className="py-2 px-2 text-lg font-semibold hover:no-underline rounded-md hover:bg-muted">
                      {readOnly ? 'Map Key' : 'View Layers'}
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 space-y-4">
                      {readOnly && (
                        <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted">
                           <Label htmlFor="show-numbered-icons" className="flex-1 font-normal">Show Icons with Numbers</Label>
                           <Checkbox
                              id="show-numbered-icons"
                              checked={showNumberedIcons}
                              onCheckedChange={(checked) => setShowNumberedIcons(!!checked)}
                           />
                        </div>
                      )}
                      {renderLayerCheckboxes()}
                  </AccordionContent>
                  </AccordionItem>
              </Accordion>
          </div>
           {readOnly && showNumberedIcons && (
              <>
                  <Separator />
                  {renderNumberedItems()}
              </>
           )}
        </div>
      </TooltipProvider>
    </aside>
  );
}
