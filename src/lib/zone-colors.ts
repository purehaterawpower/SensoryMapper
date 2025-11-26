export type ZoneColor = {
    id: string;
    name: string;
    description: string;
    color: string;
};

export const ZONE_COLORS: ZoneColor[] = [
    {
        id: 'blue',
        name: 'Blue Zone = Sensory Friendly',
        description: 'A sensory friendly zone is an area where there are few sensory inputs (such as background music, dim lighting) and where sensory inputs are controllable or predictable.',
        color: '#8DAEF3' // Using Sky Blue from secondary palette
    },
    {
        id: 'green',
        name: 'Green Zone = Lower sensory',
        description: 'A green zone is a lower sensory area where there are some sensory inputs but these are not overwhelming or competing (e.g. a single source of background music or natural light that is filtered through tinted windows). Green zones are not likely to cause overwhelm.',
        color: '#007C78' // Using Emerald from secondary palette
    },
    {
        id: 'orange',
        name: 'Orange Zone – Medium sensory',
        description: 'An orange zone is an area with moderate levels of sensory input. These areas may have competing sensory inputs (e.g. background music for the venue competing with other sounds from stores/exhibits etc.). Orange zones indicate the need for some strategies (e.g. noise cancelling headphones/sunglasses) and have an increased chance of leading to overwhelm.',
        color: '#F37255' // Using Aspect Coral from primary palette
    },
    {
        id: 'red',
        name: 'Red Zone – High sensory',
        description: 'A Red Zone is an area with heightened sensory input or with multiple overlapping/competing sensory inputs simultaneously. (E.g. loud noises from multiple sources as well as crowding and smells). Red zones indicate the need for coping strategies and have a high likelihood of leading to overwhelm without strategies in place.',
        color: '#DC2626' // A standard strong red
    },
    {
        id: 'extreme',
        name: 'Extreme sensory',
        description: 'An extreme sensory zone is reserved for the highest levels of sensory input (e.g. entering a plane via the tarmac at an airport). Extreme zones have multiple sources of overwhelming input (e.g. loud sounds strong smells etc.) simultaneously and require the Autistic person to manage multiple overwhelming inputs at once. Extreme zones require multiple coping strategies to navigate and have a high likelihood of leading to overwhelm without support.',
        color: 'url(#extreme-pattern)'
    },
    {
        id: 'purple',
        name: 'Purple – Sensory Opportunity',
        description: 'The colour purple indicates a potential positive sensory opportunity. Purple Sensory symbols/areas indicate an opportunity for someone who finds pleasure in that sense (e.g visual, balance, movement) to experience positive sensory stimulation in that space.',
        color: '#8E4180' // Using Violet from secondary palette
    }
];
