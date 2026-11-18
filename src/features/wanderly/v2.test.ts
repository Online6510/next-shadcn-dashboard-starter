import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mediaObjectPath, normalizePhoto, storePhotos } from './media';
import { plannerFields, suggest } from './planner';
import { expenseFields, entryFields, budgetTotals } from './model';
import { sample } from './seed';
import { destinations } from './catalog';

const options = {
  title: 'Тест',
  start: '2028-02-29',
  duration: 1,
  budget: 0,
  interests: ['Байгаль'] as ['Байгаль'],
  pace: 'Тайван' as const,
  region: ''
};
test('single day zero budget allocates no money', () => {
  const result = suggest(options);
  assert.equal(result.cost, 0);
  assert.equal(result.trip.end, options.start);
  assert.equal(result.itinerary.length, 1);
});
test('reject repeated preferences', () =>
  assert.equal(
    plannerFields.safeParse({ ...options, interests: ['Соёл', 'Соёл'] }).success,
    false
  ));
test('unknown region rejected', () =>
  assert.equal(plannerFields.safeParse({ ...options, region: 'unknown' }).success, false));
test('all legacy stops resolve to existing places', () =>
  sample.stops.forEach((stop) =>
    assert(destinations.some((place) => place.id === stop.destination))
  ));
test('legacy entry JSON without photos is valid', () =>
  assert(entryFields.safeParse(JSON.parse(JSON.stringify(sample.entries[0]))).success));
test('reject fractional MNT', () =>
  assert.equal(expenseFields.safeParse({ ...sample.expenses[0], amount: 0.5 }).success, false));
test('zero budget records actual debt', () =>
  assert.equal(budgetTotals({ ...sample, budget: 0 }).remaining, -515000));
test('invalid media keys rejected', () => assert.throws(() => mediaObjectPath('123', '../trips.sqlite')));
test('media count limit checked', async () =>
  await assert.rejects(
    storePhotos(
      Array.from({ length: 7 }, () => new File([], 'x.png')),
      'x'
    )
  ));
test('reject corrupt image bytes', async () =>
  await assert.rejects(
    normalizePhoto(new File(['incorrect'], 'x.png', { type: 'image/png' }))
  ));
test('reject mismatched content type', async () => {
  const sharp = (await import('sharp')).default;
  const jpg = await sharp({create:{width:16,height:10,channels:3,background:'#173d35'}}).webp().toBuffer();
  await assert.rejects(normalizePhoto(new File([new Uint8Array(jpg)],'x.jpg',{type:'image/jpeg'})));
});

test('preview order only rearranges recommended places in their own day', () => {
  const choice = { ...options, budget: 1500000, pace: 'Идэвхтэй' as const, region: 'Хөвсгөл' };
  const first = suggest(choice);
  const ids = first.itinerary[0].picks.map((item) => item.place.id).toReversed();
  assert.deepEqual(
    suggest(choice, ['invalid', ...ids]).itinerary[0].picks.map((item) => item.place.id),
    ids
  );
});

test('JPEG and PNG are normalized into valid WebP buffers', async () => {
  const sharp=(await import('sharp')).default;
  const jpg=await sharp({create:{width:16,height:10,channels:3,background:'#173d35'}}).jpeg().toBuffer();
  const png=await sharp({create:{width:16,height:10,channels:3,background:'#173d35'}}).png().toBuffer();
  const samples=[
    new File([new Uint8Array(jpg)],'a.jpg',{type:'image/jpeg'}),
    new File([new Uint8Array(png)],'b.png',{type:'image/png'})
  ];
  for(const file of samples) {
    const normalized=await normalizePhoto(file);
    assert.equal((await sharp(normalized.data).metadata()).format,'webp');
    assert.equal(normalized.width,16);
  }
});
