export type ZoneColor = {
    id: string;
    name: string;
    description: string;
    color: string;
};

export const ZONE_COLORS: ZoneColor[] = [
    {
        id: 'moderate',
        name: 'Moderate',
        description: 'Noticeable activity, elevated input.',
        color: '#F4A261' // Yellow/Orange
    },
    {
        id: 'high',
        name: 'High',
        description: 'Intense, potential trigger or overwhelm.',
        color: '#E76F51' // Red
    },
];
