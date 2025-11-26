

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


const LOW_COLOR = '#409AF5';    // Blue
const MID_LOW_COLOR = '#00E500'; // Vibrant Green
const MEDIUM_COLOR = '#FFD000'; // Neutral Yellow
const MID_HIGH_COLOR = '#FFA500'; // Orange
const HIGH_COLOR = '#ff0a0a';   // Hot Red

export function interpolateColor(intensity: number): string {
    if (intensity <= 25) {
        // Blue to Green
        return lerpColor(LOW_COLOR, MID_LOW_COLOR, intensity / 25);
    } else if (intensity <= 50) {
        // Green to Yellow
        return lerpColor(MID_LOW_COLOR, MEDIUM_COLOR, (intensity - 25) / 25);
    } else if (intensity <= 75) {
        // Yellow to Orange
        return lerpColor(MEDIUM_COLOR, MID_HIGH_COLOR, (intensity - 50) / 25);
    } else {
        // Orange to Red
        return lerpColor(MID_HIGH_COLOR, HIGH_COLOR, (intensity - 75) / 25);
    }
}

function colorDistance(c1: {r:number, g:number, b:number}, c2: {r:number, g:number, b:number}): number {
    return Math.sqrt(Math.pow(c1.r - c2.r, 2) + Math.pow(c1.g - c2.g, 2) + Math.pow(c1.b - c2.b, 2));
}

export function colorToIntensity(hexColor?: string): number | undefined {
    if (!hexColor) return undefined;
    
    const targetRgb = hexToRgb(hexColor);
    const lowRgb = hexToRgb(LOW_COLOR);
    const midLowRgb = hexToRgb(MID_LOW_COLOR);
    const mediumRgb = hexToRgb(MEDIUM_COLOR);
    const highRgb = hexToRgb(HIGH_COLOR);

    // Project target color onto the line segments to find the closest point
    
    // Segment 1: Low to Mid-Low
    const l1 = { p1: lowRgb, p2: midLowRgb };
    const t1 = project(targetRgb, l1);
    const d1 = colorDistance(targetRgb, lerpColor(LOW_COLOR, MID_LOW_COLOR, t1));
    const intensity1 = t1 * 25;

    // Segment 2: Mid-Low to Medium
    const l2 = { p1: midLowRgb, p2: mediumRgb };
    const t2 = project(targetRgb, l2);
    const d2 = colorDistance(targetRgb, lerpColor(MID_LOW_COLOR, MEDIUM_COLOR, t2));
    const intensity2 = 25 + (t2 * 25);

    // Segment 3: Medium to High (now starts at 75)
    const l3 = { p1: mediumRgb, p2: highRgb };
    const t3 = project(targetRgb, l3);
    const d3 = colorDistance(targetRgb, lerpColor(MEDIUM_COLOR, HIGH_COLOR, t3));
    const intensity3 = 75 + (t3 * 25);
    
    // Find the closest segment
    const distances = [d1, d2, d3];
    let minDistance = distances[0];
    let finalIntensity = intensity1;

    if (distances[1] < minDistance) {
        minDistance = distances[1];
        finalIntensity = intensity2;
    }
    if (distances[2] < minDistance) {
        finalIntensity = intensity3;
    }

    // Check if it's closer to pure yellow (in the 50-75 range)
    const dYellow = colorDistance(targetRgb, mediumRgb);
    if (dYellow < minDistance) {
        // Find a representative intensity in the yellow range. 62.5 is the midpoint.
        finalIntensity = 62.5; 
    }
    
    return Math.round(finalIntensity);
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
