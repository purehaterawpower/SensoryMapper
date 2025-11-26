

import type { SensoryType, AmenityType, SensoryInfo, AmenityInfo } from './types';
import { Hand, Users, Compass, Eye, Ear, PlusSquare, Info, Coffee } from 'lucide-react';
import { SmellIcon } from '@/components/icons/NoseIcon';
import { ToiletIcon } from '@/components/icons/ToiletIcon';
import { ExitIcon } from '@/components/icons/ExitIcon';
import { SeatingIcon } from '@/components/icons/SeatingIcon';
import { ResetIcon } from '@/components/icons/ResetIcon';


export const SENSORY_STIMULI_TYPES: (SensoryType | AmenityType)[] = ['vision', 'hearing', 'smell', 'space', 'touch', 'movement'];
export const PRACTICAL_AMENITY_TYPES: AmenityType[] = ['quietRoom', 'toilets', 'exit', 'help', 'firstAid', 'food', 'seating'];


export const SENSORY_DATA: Record<SensoryType, SensoryInfo> = {
  vision: { 
    name: 'Visual', 
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
    icon: SmellIcon, 
    color: '#E76F51',
  },
  touch: { 
    name: 'Feel', 
    description: 'Temperature, textures, and surfaces.',
    icon: Hand, 
    color: '#2A9D8F',
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
  quietRoom: {
    name: 'Reset Room',
    description: 'A designated room with low sensory input for calming and regulation.',
    icon: ResetIcon,
    color: '#457B9D'
  },
  seating: {
    name: 'Seating',
    description: 'Accessible seating, including benches or other options for rest.',
    icon: SeatingIcon,
    color: '#BDBDBD'
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

export const ALL_SENSORY_TYPES: (SensoryType | AmenityType)[] = [...SENSORY_STIMULI_TYPES, ...PRACTICAL_AMENITY_TYPES];
export const ALL_SENSORY_DATA = { ...SENSORY_DATA, ...AMENITY_DATA };
