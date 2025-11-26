'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a summary of sensory considerations within a selected zone on a map.
 *
 * - generateSensorySummary - A function that takes a zone description and generates a sensory summary.
 * - GenerateSensorySummaryInput - The input type for the generateSensorySummary function.
 * - GenerateSensorySummaryOutput - The return type for the generateSensorySummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSensorySummaryInputSchema = z.object({
  zoneDescription: z
    .string()
    .describe(
      'A detailed description of the zone, including sensory inputs such as touch, vestibular, proprioception, vision, hearing, smell, and taste.'
    ),
});
export type GenerateSensorySummaryInput = z.infer<
  typeof GenerateSensorySummaryInputSchema
>;

const GenerateSensorySummaryOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A concise summary of the sensory considerations within the specified zone.'
    ),
});
export type GenerateSensorySummaryOutput = z.infer<
  typeof GenerateSensorySummaryOutputSchema
>;

export async function generateSensorySummary(
  input: GenerateSensorySummaryInput
): Promise<GenerateSensorySummaryOutput> {
  return generateSensorySummaryFlow(input);
}

const generateSensorySummaryPrompt = ai.definePrompt({
  name: 'generateSensorySummaryPrompt',
  input: {schema: GenerateSensorySummaryInputSchema},
  output: {schema: GenerateSensorySummaryOutputSchema},
  prompt: `You are an AI assistant designed to generate summaries of sensory considerations within a specific zone. Based on the description of the zone provided, create a concise summary highlighting the key sensory impacts of that area.

Zone Description: {{{zoneDescription}}}

Summary:`, // Changed `description` to `zoneDescription`.
});

const generateSensorySummaryFlow = ai.defineFlow(
  {
    name: 'generateSensorySummaryFlow',
    inputSchema: GenerateSensorySummaryInputSchema,
    outputSchema: GenerateSensorySummaryOutputSchema,
  },
  async input => {
    const {output} = await generateSensorySummaryPrompt(input);
    return output!;
  }
);
