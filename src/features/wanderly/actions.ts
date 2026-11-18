'use server';

import type { Photo } from './model';
import { storePhotos, discard, photoLimit } from './media';
import { randomUUID } from 'node:crypto';
import { redirect } from 'next/navigation';
import { createTrip, deleteTrip, updateTrip } from './db';
import { plannerFields, suggest } from './planner';
import { entryFields, expenseFields, listDays, stopFields, tripFields } from './model';

type Target =
  | { kind: 'plan'; trip?: never }
  | { kind: 'trip'; trip?: string }
  | { kind: 'stop' | 'expense' | 'entry'; trip: string; id?: string }
  | { kind: 'remove'; collection: 'stops' | 'expenses' | 'entries'; trip: string; id: string }
  | { kind: 'move'; trip: string; id: string; direction: -1 | 1 }
  | { kind: 'delete-trip'; trip: string };

function replace<T extends { id: string }>(items: T[], value: T) {
  const index = items.findIndex((item) => item.id === value.id);
  if (index === -1) items.push(value);
  else items[index] = value;
}

export async function save(target: Target, previous: string, form: FormData) {
  void previous;
  const fields = Object.fromEntries(form);
  let next = target.trip ? '/trips/' + target.trip : '/trips';
  let added: Photo[] = [];
  const removed: Photo[] = [];
  try {
    if (target.kind === 'plan') {
      const input = plannerFields.parse({ ...fields, interests: form.getAll('interests') });
      const plan = suggest(input);
      const id = randomUUID();
      createTrip({
        ...plan.trip,
        id,
        expenses: [],
        entries: [],
        stops: plan.itinerary.flatMap(({ day, picks }) =>
          picks.map(({ place, matches }, index) => ({
            id: randomUUID(),
            day,
            destination: place.id,
            time: ['09:00', '13:00', '16:00'][index],
            duration: 90,
            cost: plan.cost,
            notes: matches ? 'Сонгосон сонирхолд нийцсэн газар.' : 'Тухайн аймгийн өөр нэг зогсоол.'
          }))
        )
      });
      next = '/trips/' + id;
    } else if (target.kind === 'trip') {
      const value = tripFields.parse(fields);
      if (target.trip) {
        updateTrip(target.trip, (trip) => {
          const days = listDays(value.start, value.end);
          if (trip.stops.some((stop) => !days.includes(stop.day))) {
            throw new Error('Огноо өөрчлөхөөс өмнө хугацаанаас гадуурх зогсоолуудыг шилжүүлнэ үү.');
          }
          Object.assign(trip, value);
        });
      } else {
        const id = randomUUID();
        createTrip({ ...value, id, stops: [], expenses: [], entries: [] });
        const selected = fields.destination === value.cover ? '?add=' + value.cover : '';
        next = '/trips/' + id + selected;
      }
    } else if (target.kind === 'delete-trip') {
      removed.push(...deleteTrip(target.trip));
      next = '/trips';
    } else {
      if (target.kind === 'entry') {
        const entry = entryFields.parse(fields);
        added = await storePhotos(form.getAll('uploads').filter((item): item is File => typeof item !== 'string' && Boolean(item.name)), entry.title);
      }
      updateTrip(target.trip, (trip) => {
        if (target.kind === 'stop') {
          const value = stopFields.parse(fields);
          if (!listDays(trip.start, trip.end).includes(value.day))
            throw new Error('Аяллын өдрөө сонгоно уу.');
          replace(trip.stops, { ...value, id: target.id || randomUUID() });
          next += '?day=' + value.day;
        }
        if (target.kind === 'expense') {
          replace(trip.expenses, { ...expenseFields.parse(fields), id: target.id || randomUUID() });
          next += '#budget';
        }
        if (target.kind === 'entry') {
          const original = trip.entries.find((item) => item.id === target.id);
          if (target.id && !original) throw new Error('Дурсамж устгагдсан байна.');
          const removals = new Set(form.getAll('removePhoto'));
          const keep = (original?.photos || []).filter(photo => !removals.has(photo.id));
          removed.push(...(original?.photos || []).filter(photo => removals.has(photo.id)));
          const photos = [...keep,...added];
          if (photos.length > photoLimit) throw new Error('Нэг дурсамжид 6 хүртэл зураг хадгална.');
          replace(trip.entries, { ...entryFields.parse(fields), photos, id: target.id || randomUUID() });
          next = '/journal/' + trip.id;
        }
        if (target.kind === 'remove') {
          const id = target.id;
          if (target.collection === 'stops') {
            const stop = trip.stops.find((entry) => entry.id === id);
            trip.stops = trip.stops.filter((entry) => entry.id !== id);
            if (stop) next += '?day=' + stop.day;
          }
          if (target.collection === 'expenses') {
            trip.expenses = trip.expenses.filter((entry) => entry.id !== id);
            next += '#budget';
          }
          if (target.collection === 'entries') {
            removed.push(...(trip.entries.find(entry => entry.id === id)?.photos || []));
            trip.entries = trip.entries.filter((entry) => entry.id !== id);
            next = '/journal/' + trip.id;
          }
        }
        if (target.kind === 'move') {
          const index = trip.stops.findIndex((stop) => stop.id === target.id);
          const stop = trip.stops[index];
          if (!stop) return;
          const indexes = trip.stops.flatMap((item, i) => (item.day === stop.day ? [i] : []));
          const other = indexes[indexes.indexOf(index) + target.direction];
          if (other !== undefined)
            [trip.stops[index], trip.stops[other]] = [trip.stops[other], stop];
          next += '?day=' + stop.day;
        }
      });
    }
  } catch (error) {
    await discard(added);
    if (error instanceof Error && /[А-Яа-яӨөҮү]/.test(error.message) && error.name !== 'ZodError')
      return error.message;
    return 'Мэдээллийг шалгана уу. Огноо, дүн болон заавал бөглөх талбаруудыг нягтлаарай.';
  }
  await discard(removed);
  redirect(next);
}
