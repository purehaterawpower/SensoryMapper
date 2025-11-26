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
const MEDIUM_COLOR = '#FFD000'; // Neutral Yellow
const HIGH_COLOR = '#E76F51';   // Hot Red

export function interpolateColor(intensity: number): string {
    if (intensity <= 50) {
        // Interpolate between LOW_COLOR and MEDIUM_COLOR
        return lerpColor(LOW_COLOR, MEDIUM_COLOR, intensity / 50);
    } else {
        // Interpolate between MEDIUM_COLOR and HIGH_COLOR
        return lerpColor(MEDIUM_COLOR, HIGH_COLOR, (intensity - 50) / 50);
    }
}

function colorDistance(c1: {r:number, g:number, b:number}, c2: {r:number, g:number, b:number}): number {
    return Math.sqrt(Math.pow(c1.r - c2.r, 2) + Math.pow(c1.g - c2.g, 2) + Math.pow(c1.b - c2.b, 2));
}

export function colorToIntensity(hexColor?: string): number | undefined {
    if (!hexColor) return undefined;
    
    const targetRgb = hexToRgb(hexColor);
    const lowRgb = hexToRgb(LOW_COLOR);
    const mediumRgb = hexToRgb(MEDIUM_COLOR);
    const highRgb = hexToRgb(HIGH_COLOR);

    // Project target color onto the line segments to find the closest point
    
    // Segment 1: Low to Medium
    const l1 = { p1: lowRgb, p2: mediumRgb };
    const t1 = project(targetRgb, l1);
    const d1 = colorDistance(targetRgb, lerpColor(LOW_COLOR, MEDIUM_COLOR, t1));

    // Segment 2: Medium to High
    const l2 = { p1: mediumRgb, p2: highRgb };
    const t2 = project(targetRgb, l2);
    const d2 = colorDistance(targetRgb, lerpColor(MEDIUM_COLOR, HIGH_COLOR, t2));
    
    // Determine which segment is closer
    if (d1 < d2) {
        return Math.max(0, Math.min(50, t1 * 50));
    } else {
        return 50 + Math.max(0, Math.min(50, t2 * 50));
    }
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
