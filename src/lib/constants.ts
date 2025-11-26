import type { SensoryType, AmenityType, SensoryInfo, AmenityInfo } from './types';
import { Hand, Users, Compass, Eye, Ear, PlusSquare, Info, Coffee, VolumeX } from 'lucide-react';
import { NoseIcon } from '@/components/icons/NoseIcon';
import { ToiletIcon } from '@/components/icons/ToiletIcon';
import { ExitIcon } from '@/components/icons/ExitIcon';
import { SeatingIcon } from '@/components/icons/SeatingIcon';


export const SENSORY_STIMULI_TYPES: SensoryType[] = ['vision', 'hearing', 'smell', 'touch', 'movement', 'space'];
export const RESPITE_AREA_TYPES: AmenityType[] = ['quietArea', 'seating'];
export const PRACTICAL_AMENITY_TYPES: AmenityType[] = ['toilets', 'exit', 'help', 'firstAid', 'food'];


export const SENSORY_DATA: Record<SensoryType, SensoryInfo> = {
  vision: { 
    name: 'Visuals', 
    description: 'Lighting, glare, and clutter.',
    icon: Eye, 
    color: '#82B4A1', 
  },
  hearing: { 
    name: 'Sound', 
    description: 'Volume, echoes, and sudden noises.',
    icon: Ear,
    color: '#F4A261', 
  },
  smell: { 
    name: 'Smell', 
    description: 'Strong scents, chemicals, or food.',
    icon: NoseIcon, 
    color: '#E76F51',
  },
  touch: { 
    name: 'Touch', 
    description: 'Textures, temperature, and surfaces.',
    icon: Hand, 
    color: '#2A9D8F', _CHANGE_
  },
  movement: { 
    name: 'Movement', 
    description: 'Flow, navigation, and stability.',
    icon: Compass, 
    color: '#264653', 
  },
  space: { 
    name: 'Space', 
    description: 'Crowding, proximity, and layout.',
    icon: Users, 
    color: '#E9C46A',
  },
};

export const AMENITY_DATA: Record<AmenityType, AmenityInfo> = {
  quietArea: {
    name: 'Quiet Area',
    description: 'A designated area with low sensory input for calming and regulation.',
    icon: VolumeX,
    color: '#A8DADC'
  },
  seating: {
    name: 'Seating Area',
    description: 'Accessible seating, including benches or other options for rest.',
    icon: SeatingIcon,
    color: '#A8DADC'
  },
  toilets: {
    name: 'Toilets',
    description: 'Location of standard, accessible, and ambulant toilets.',
    icon: ToiletIcon,
    color: '#BDBDBD'
  },
  exit: {
    name: 'Exit',
    description: 'Emergency exits or quick exit routes for rapid departure.',
    icon: ExitIcon,
    color: '#BDBDBD'
  },
  help: {
    name: 'Help Point',
    description: 'Information Desks or locations where staff can provide assistance.',
    icon: Info,
    color: '#BDBDBD'
  },
  firstAid: {
    name: 'First Aid',
    description: 'Location for medical assistance.',
    icon: PlusSquare,
    color: '#BDBDBD'
  },
  food: {
    name: 'Food & Drink',
    description: 'Location for food and beverages.',
    icon: Coffee,
    color: '#BDBDBD'
  },
}

export const ALL_SENSORY_TYPES: (SensoryType | AmenityType)[] = [...SENSORY_STIMULI_TYPES, ...RESPITE_AREA_TYPES, ...PRACTICAL_AMENITY_TYPES];
export const ALL_SENSORY_DATA = { ...SENSORY_DATA, ...AMENITY_DATA };
