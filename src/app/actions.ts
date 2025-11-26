'use server';

import { generateSensorySummary } from "@/ai/flows/generate-sensory-summary";

export async function getSensorySummary(description: string) {
  try {
    if (!description.trim()) {
      return { error: 'Description cannot be empty.' };
    }
    const result = await generateSensorySummary({ areaDescription: description });
    return { summary: result.summary };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to generate summary. Please try again.' };
  }
}
