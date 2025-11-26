import type { SensoryType, AmenityType, SensoryInfo, AmenityInfo } from './types';
import { Hand, Users, Compass, Eye, Ear, PlusSquare, Info, Coffee, MessageCircle, VolumeX } from 'lucide-react';
import { NoseIcon } from '@/components/icons/NoseIcon';
import { ToiletIcon } from '@/components/icons/ToiletIcon';
import { ExitIcon } from '@/components/icons/ExitIcon';


export const SENSORY_STIMULI_TYPES: SensoryType[] = ['touch', 'proprioception', 'vestibular', 'vision', 'hearing', 'smell'];
export const RESPITE_ZONE_TYPES: AmenityType[] = ['quietZone', 'seating'];
export const PRACTICAL_AMENITY_TYPES: AmenityType[] = ['toilets', 'exit', 'help', 'firstAid', 'food'];


export const SENSORY_DATA: Record<SensoryType, SensoryInfo> = {
  vision: { 
    name: 'Visuals', 
    description: 'Lights & Patterns: Warns of bright or flashing lights, darkness, or "visually busy" areas with lots of colours and patterns.',
    icon: Eye, 
    color: '#8DAEF3', 
  },
  hearing: { 
    name: 'Sound', 
    description: 'Volume & Echo: Indicates if a space is loud, has sudden noises (like hand dryers), or echoes. Also marks quiet zones.',
    icon: Ear,
    color: '#E6ACAC', 
  },
  smell: { 
    name: 'Smell', 
    description: 'Scents & Odours: Warns of strong smells like food courts, cleaning chemicals, or perfumes. Also marks fresh air areas.',
    icon: NoseIcon, 
    color: '#FDDDB1',
  },
  vestibular: { 
    name: 'Movement', 
    description: 'Balance & Navigation: Tells you if the floor is uneven, if there are slopes/escalators, or if the layout is confusing to navigate.',
    icon: Compass, 
    color: '#007C78', 
  },
  touch: { 
    name: 'Touch', 
    description: 'Tactile stimuli from textures, temperature, or being touched.',
    icon: Hand, 
    color: '#2558D7', 
  },
  proprioception: { 
    name: 'Space', 
    description: 'Crowding & Proximity: Tells you if an area is tight, usually crowded, or requires squeezing through narrow gaps.',
    icon: Users, 
    color: '#F37255',
  },
};

export const AMENITY_DATA: Record<AmenityType, AmenityInfo> = {
  quietZone: {
    name: 'Quiet Zone',
    description: 'A designated area with low sensory input for calming and regulation.',
    icon: VolumeX,
    color: '#A7D8A9'
  },
  seating: {
    name: 'Seating Area',
    description: 'Accessible seating, including benches or other options for rest.',
    icon: MessageCircle,
    color: '#A7D8A9'
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

export const ALL_SENSORY_TYPES: (SensoryType | AmenityType)[] = [...SENSORY_STIMULI_TYPES, ...RESPITE_ZONE_TYPES, ...PRACTICAL_AMENITY_TYPES];
export const ALL_SENSORY_DATA = { ...SENSORY_DATA, ...AMENITY_DATA };
