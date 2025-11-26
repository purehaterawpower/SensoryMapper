import type { SensoryType, AmenityType, SensoryInfo, AmenityInfo } from './types';
import { Hand, Scale, User, Eye, Ear, Siren, Speaker, VolumeX, Lightbulb, Zap, SprayCan, MessageCircle, Waves, Snowflake, DoorOpen, PlusSquare, Info, Coffee } from 'lucide-react';
import { NoseIcon } from '@/components/icons/NoseIcon';

export const SENSORY_TYPES: SensoryType[] = ['vision', 'hearing', 'smell', 'vestibular', 'touch', 'proprioception'];

export const SENSORY_STIMULI_TYPES: SensoryType[] = ['vision', 'hearing', 'smell', 'touch'];
export const RESPITE_ZONE_TYPES: AmenityType[] = ['quietZone', 'seating'];
export const PRACTICAL_AMENITY_TYPES: AmenityType[] = ['toilets', 'exit', 'help', 'firstAid', 'food'];

export const SENSORY_DATA: Record<SensoryType, SensoryInfo> = {
  vision: { 
    name: 'Vision', 
    description: 'Visual stimuli like bright lights, flashing effects, or visual clutter.',
    icon: Eye, 
    color: '#8DAEF3', 
    className: 'bg-[#8DAEF3]' 
  },
  hearing: { 
    name: 'Hearing', 
    description: 'Auditory stimuli like loud music, sudden noises, or announcements.',
    icon: Ear, 
    color: '#E6ACAC', 
    className: 'bg-[#E6ACAC]' 
  },
  smell: { 
    name: 'Smell', 
    description: 'Olfactory stimuli like food smells, cleaning products, or perfumes.',
    icon: NoseIcon, 
    color: '#FDDDB1',
    className: 'bg-[#FDDDB1]' 
  },
  vestibular: { 
    name: 'Vestibular system', 
    description: 'Stimuli related to balance and spatial orientation, like spinning or uneven surfaces.',
    icon: Scale, 
    color: '#007C78', 
    className: 'bg-[#007C78]' 
  },
  touch: { 
    name: 'Touch', 
    description: 'Tactile stimuli from textures, temperature, or being touched.',
    icon: Hand, 
    color: '#2558D7', 
    className: 'bg-[#2558D7]' 
  },
  proprioception: { 
    name: 'Proprioceptive system', 
    description: 'Stimuli related to body awareness, like crowded spaces or heavy work.',
    icon: User, 
    color: '#F37255', 
    className: 'bg-[#F37255]'
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
    icon: MessageCircle, // Placeholder, find a better one
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

export const ALL_SENSORY_TYPES = [...SENSORY_STIMULI_TYPES, ...RESPITE_ZONE_TYPES, ...PRACTICAL_AMENITY_TYPES];
export const ALL_SENSORY_DATA = { ...SENSORY_DATA, ...AMENITY_DATA };
