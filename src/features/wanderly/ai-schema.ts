import { z } from 'zod';
import { destinations } from './catalog';

const validIds = destinations.map((place) => place.id) as [string, ...string[]];

export const aiPlanSchema = z.object({
  overview: z.string().trim().min(1).max(550),
  days: z.array(z.object({
    dayIndex: z.number().int().min(1).max(7),
    placeIds: z.array(z.enum(validIds)).min(1).max(3),
    note: z.string().trim().max(350)
  })).min(1).max(7),
  tips: z.array(z.string().trim().max(200)).max(4)
});
export type AIPlan = z.infer<typeof aiPlanSchema>;
