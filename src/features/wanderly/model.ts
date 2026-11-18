import { z } from 'zod';
import { categories, destinations } from './catalog';

const text = z.string().trim().min(1).max(140);
const integer = (min: number, max: number) =>
  z
    .union([z.number(), z.string().trim().regex(/^\d+$/).transform(Number)])
    .pipe(z.number().int().min(min).max(max));
const amount = integer(0, 1_000_000_000);
const destinationId = z
  .string()
  .refine((id) => destinations.some((place) => place.id === id), 'Газар сонгоно уу.');
export const tripFields = z
  .object({
    title: text,
    start: z.iso.date(),
    end: z.iso.date(),
    travelers: integer(1, 100),
    budget: amount,
    cover: destinationId
  })
  .refine(
    ({ start, end }) => listDays(start, end).length > 0,
    'Огнооны зөрүү 0–29 хоног байх ёстой.'
  );

export const stopFields = z.object({
  destination: destinationId,
  day: z.iso.date(),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  duration: integer(5, 1440),
  cost: amount,
  notes: z.string().trim().max(2000)
});
export const expenseFields = z.object({
  note: text,
  date: z.iso.date(),
  category: z.enum(categories),
  amount: integer(1, 1_000_000_000)
});
export const entryFields = z.object({
  title: text,
  date: z.iso.date(),
  place: z.string().trim().max(140),
  story: z.string().trim().min(1).max(5000),
  image: z
    .string()
    .trim()
    .max(2048)
    .refine(
      (value) =>
        value === '' ||
        /^\/images\/[\w-]+\.webp$/.test(value) ||
        (z.url().safeParse(value).success && /^https?:\/\//i.test(value)),
      'Зургийн HTTP эсвэл HTTPS холбоос оруулна уу.'
    ),
  mood: z.string().trim().max(64)
});

export type Stop = z.infer<typeof stopFields> & { id: string };
export type Expense = z.infer<typeof expenseFields> & { id: string };
export type Photo = { id: string; alt: string; width: number; height: number };
export type Entry = z.infer<typeof entryFields> & { id: string; photos?: Photo[] };
export type Trip = z.infer<typeof tripFields> & {
  id: string;
  stops: Stop[];
  expenses: Expense[];
  entries: Entry[];
};

export function listDays(start: string, end: string): string[] {
  const first = Date.parse(start);
  const days = (Date.parse(end) - first) / 86_400_000 + 1;
  if (!Number.isInteger(days) || days < 1 || days > 30) return [];
  return Array.from({ length: days }, (_, i) =>
    new Date(first + i * 86_400_000).toISOString().slice(0, 10)
  );
}

export function budgetTotals(trip: Trip) {
  const byCategory = categories.map((category) => ({
    category,
    amount: trip.expenses.reduce(
      (total, expense) => total + (expense.category === category ? expense.amount : 0),
      0
    )
  }));
  const spent = byCategory.reduce((total, item) => total + item.amount, 0);
  return {
    byCategory,
    spent,
    remaining: trip.budget - spent,
    planned: trip.stops.reduce((total, stop) => total + stop.cost, 0),
    percent: trip.budget ? Math.round((spent / trip.budget) * 100) : spent ? 100 : 0
  };
}
