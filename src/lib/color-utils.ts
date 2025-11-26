// Function to interpolate between two colors
// `amt` is a value from 0 to 100
function lerpColor(a: string, b: string, amt: number): string {
    const amount = amt / 100;
    const ah = parseInt(a.replace(/#/g, ''), 16);
    const ar = ah >> 16;
    const ag = (ah >> 8) & 0xff;
    const ab = ah & 0xff;
    const bh = parseInt(b.replace(/#/g, ''), 16);
    const br = bh >> 16;
    const bg = (bh >> 8) & 0xff;
    const bb = bh & 0xff;
    const rr = ar + amount * (br - ar);
    const rg = ag + amount * (bg - ag);
    const rb = ab + amount * (bb - ab);
  
    return `#${((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1)}`;
}

// Specific interpolation between light yellow and red
const LIGHT_YELLOW = '#F4A261'; // Using the old "Moderate" color
const RED = '#E76F51';       // Using the old "High" color

export function interpolateColor(intensity: number): string {
    return lerpColor(LIGHT_YELLOW, RED, intensity);
}

// Reverse function: from color to intensity
export function colorToIntensity(hexColor?: string): number | undefined {
    if (!hexColor) return undefined;
    
    const startColor = parseInt(LIGHT_YELLOW.slice(1), 16);
    const endColor = parseInt(RED.slice(1), 16);
    const targetColor = parseInt(hexColor.slice(1), 16);
  
    const sr = startColor >> 16, sg = (startColor >> 8) & 0xff, sb = startColor & 0xff;
    const er = endColor >> 16, eg = (endColor >> 8) & 0xff, eb = endColor & 0xff;
    const tr = targetColor >> 16, tg = (targetColor >> 8) & 0xff, tb = targetColor & 0xff;
  
    // We can solve for amount: amount = (target - start) / (end - start)
    // We can do this for each channel (R, G, B) and average them, but since it's a linear interpolation,
    // any single channel should give a good approximation if it has a non-zero difference.
    
    let totalAmount = 0;
    let components = 0;
    
    if (er - sr !== 0) {
        totalAmount += (tr - sr) / (er - sr);
        components++;
    }
    if (eg - sg !== 0) {
        totalAmount += (tg - sg) / (eg - sg);
        components++;
    }
    if (eb - sb !== 0) {
        totalAmount += (tb - sb) / (eb - sb);
        components++;
    }
    
    if(components === 0) return 50; // default if colors are the same

    const averageAmount = totalAmount / components;
    return Math.max(0, Math.min(100, averageAmount * 100));
}
