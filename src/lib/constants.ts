import type { SensoryType, AmenityType, SensoryInfo, AmenityInfo } from './types';
import { Hand, Scale, User, Eye, Ear, Waves, DoorOpen, PlusSquare, Info, Coffee } from 'lucide-react';
import { NoseIcon } from '@/components/icons/NoseIcon';
import { VolumeX, MessageCircle } from 'lucide-react';

export const SENSORY_STIMULI_TYPES: SensoryType[] = ['touch', 'proprioception', 'vestibular', 'vision', 'hearing', 'smell'];
export const RESPITE_ZONE_TYPES: AmenityType[] = ['quietZone', 'seating'];
export const PRACTICAL_AMENITY_TYPES: AmenityType[] = ['toilets', 'exit', 'help', 'firstAid', 'food'];


export const SENSORY_DATA: Record<SensoryType, SensoryInfo> = {
  vision: { 
    name: 'Vision', 
    description: 'Visual stimuli like bright lights, flashing effects, or visual clutter.',
    icon: Eye, 
    color: '#8DAEF3', 
  },
  hearing: { 
    name: 'Hearing', 
    description: 'Auditory stimuli like loud music, sudden noises, or announcements.',
    icon: Ear, 
    color: '#E6ACAC', 
  },
  smell: { 
    name: 'Smell', 
    description: 'Olfactory stimuli like food smells, cleaning products, or perfumes.',
    icon: NoseIcon, 
    color: '#FDDDB1',
  },
  vestibular: { 
    name: 'Balance & Motion', 
    description: 'Stability & Direction: Tells you if the floor is uneven, if there are elevators, or if the layout is confusing. Helpful if you get dizzy easily.',
    icon: Scale, 
    color: '#007C78', 
  },
  touch: { 
    name: 'Touch', 
    description: 'Tactile stimuli from textures, temperature, or being touched.',
    icon: Hand, 
    color: '#2558D7', 
  },
  proprioception: { 
    name: 'Body Space', 
    description: 'Crowding & Squeeze: Tells you if an area is tight, crowded, or if you might bump into things. Helpful if you need personal space.',
    icon: User, 
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
    icon: Waves,
    color: '#BDBDBD'
  },
  exit: {
    name: 'Exit',
    description: 'Emergency exits or quick exit routes for rapid departure.',
    icon: DoorOpen,
    color: '#BDBDBD'
  },
  help: {
    name: 'Help Point',
    description: 'Information desks or locations where staff can provide assistance.',
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
