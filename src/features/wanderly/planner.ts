import { z } from 'zod';
import { destinations } from './catalog';
import { listDays, tripFields } from './model';

export const interests = ['Байгаль', 'Адал явдал', 'Соёл', 'Амралт'] as const;
export const paces = ['Тайван', 'Тэнцвэртэй', 'Идэвхтэй'] as const;
export const regions = [...new Set(destinations.map((place) => place.region))];
export const plannerFields = z.object({
  title: z.string().trim().min(1).max(140),
  start: z.iso.date().refine((date) => date <= '9999-12-25'),
  duration: z.coerce.number().int().min(1).max(7),
  budget: z.coerce.number().int().min(0).max(1_000_000_000),
  interests: z
    .array(z.enum(interests))
    .min(1)
    .max(3)
    .refine((values) => new Set(values).size === values.length),
  pace: z.enum(paces),
  region: z.string().refine((region) => region === '' || regions.includes(region))
});

export type PlannerInput = z.infer<typeof plannerFields>;

function endDate(start: string, duration: number) {
  return new Date(Date.parse(start) + (duration - 1) * 86_400_000).toISOString().slice(0, 10);
}

export function suggest(input: PlannerInput) {
  const end = endDate(input.start, input.duration);
  const days = listDays(input.start, end);
  const matched = destinations
    .filter((place) => !input.region || place.region === input.region)
    .map((place) => ({
      place,
      matches: input.interests.some((interest) => interest === place.category)
    }))
    .toSorted((a, b) => Number(b.matches) - Number(a.matches));

  const capacity = paces.indexOf(input.pace) + 1;
  const proposedCount = Math.min(
    capacity * days.length,
    Math.max(1, Math.floor(input.budget / 60000))
  );
  const visited = new Set<string>();
  const itinerary = days.map((day) => {
    const next = matched.find(({ place }) => !visited.has(place.id));
    const picks =
      next && visited.size < proposedCount
        ? matched
            .filter(({ place }) => place.region === next.place.region && !visited.has(place.id))
            .slice(0, Math.min(capacity, proposedCount - visited.size))
        : [];
    for (const { place } of picks) visited.add(place.id);
    return { day, picks };
  });
  const cost = visited.size ? Math.floor((input.budget * 0.35) / visited.size) : 0;
  const trip = tripFields.parse({ ...input, end, travelers: 1, cover: matched[0]?.place.id });
  return { trip, itinerary, cost };
}
