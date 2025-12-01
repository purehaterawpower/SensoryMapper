




function lerpColor(color1: string, color2: string, factor: number): string {
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);

    const r = Math.round(c1.r + factor * (c2.r - c1.r));
    const g = Math.round(c1.g + factor * (c2.g - c1.g));
    const b = Math.round(c1.b + factor * (c2.b - c1.b));

    return rgbToHex(r, g, b);
}

function hexToRgb(hex: string): { r: number, g: number, b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

function rgbToHex(r: number, g: number, b: number): string {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}


const LOW_COLOR = '#409AF5';     // Blue
const NEUTRAL_COLOR = '#FFFFFF'; // White
const MID_COLOR = '#FACC15';   // Yellow
const HIGH_COLOR = '#F97316';    // Orange
const PEAK_COLOR = '#DC2626';    // Red

export function interpolateColor(intensity: number): string {
    if (intensity <= 25) {
        // Blue to White
        return lerpColor(LOW_COLOR, NEUTRAL_COLOR, intensity / 25);
    } else if (intensity <= 50) {
        // White to Yellow
        return lerpColor(NEUTRAL_COLOR, MID_COLOR, (intensity - 25) / 25);
    } else if (intensity <= 75) {
        // Yellow to Orange
        return lerpColor(MID_COLOR, HIGH_COLOR, (intensity - 50) / 25);
    } else {
        // Orange to Red
        return lerpColor(HIGH_COLOR, PEAK_COLOR, (intensity - 75) / 25);
    }
}

function colorDistance(c1: {r:number, g:number, b:number}, c2: {r:number, g:number, b:number}): number {
    return Math.sqrt(Math.pow(c1.r - c2.r, 2) + Math.pow(c1.g - c2.g, 2) + Math.pow(c1.b - c2.b, 2));
}

export function colorToIntensity(hexColor?: string): number | undefined {
    if (!hexColor) return undefined;
    
    const targetRgb = hexToRgb(hexColor);
    
    const segments = [
        { p1: hexToRgb(LOW_COLOR), p2: hexToRgb(NEUTRAL_COLOR), intensityStart: 0, intensityEnd: 25 },
        { p1: hexToRgb(NEUTRAL_COLOR), p2: hexToRgb(MID_COLOR), intensityStart: 25, intensityEnd: 50 },
        { p1: hexToRgb(MID_COLOR), p2: hexToRgb(HIGH_COLOR), intensityStart: 50, intensityEnd: 75 },
        { p1: hexToRgb(HIGH_COLOR), p2: hexToRgb(PEAK_COLOR), intensityStart: 75, intensityEnd: 100 },
    ];

    let bestMatch = {
        intensity: 0,
        distance: Infinity,
    };

    segments.forEach(segment => {
        const t = project(targetRgb, segment);
        const projectedColorHex = lerpColor(rgbToHex(segment.p1.r, segment.p1.g, segment.p1.b), rgbToHex(segment.p2.r, segment.p2.g, segment.p2.b), t);
        const d = colorDistance(targetRgb, hexToRgb(projectedColorHex));
        
        if (d < bestMatch.distance) {
            bestMatch.distance = d;
            bestMatch.intensity = segment.intensityStart + t * (segment.intensityEnd - segment.intensityStart);
        }
    });

    return Math.round(bestMatch.intensity);
}

// Project point p onto line segment l
function project(p: {r:number, g:number, b:number}, l: {p1: {r:number, g:number, b:number}, p2: {r:number, g:number, b:number}}) {
    const { p1, p2 } = l;
    const v = { r: p2.r - p1.r, g: p2.g - p1.g, b: p2.b - p1.b };
    const w = { r: p.r - p1.r, g: p.g - p1.g, b: p.b - p1.b };
    const dotV = v.r * v.r + v.g * v.g + v.b * v.b;
    if (dotV === 0) return 0; // p1 and p2 are the same
    const t = (w.r * v.r + w.g * v.g + w.b * v.b) / dotV;
    return Math.max(0, Math.min(1, t)); // Clamp to [0, 1] for segment
}
