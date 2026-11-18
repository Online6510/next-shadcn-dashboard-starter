import { test } from 'node:test';
import assert from 'node:assert/strict';
import { budgetTotals, listDays, tripFields } from './model';
import { sample } from './seed';
import { suggest } from './planner';

test('trip days include both bounds and handle leap days', () => {
  assert.deepEqual(listDays('2028-02-28', '2028-03-01'), [
    '2028-02-28',
    '2028-02-29',
    '2028-03-01'
  ]);
  assert.deepEqual(listDays('2026-12-03', '2026-12-01'), []);
  assert.deepEqual(listDays('2026-12-01', '2026-12-31'), []);
});

test('trip validation rejects invalid dates and negative budgets', () => {
  assert.equal(tripFields.safeParse(sample).success, true);
  assert.equal(tripFields.safeParse({ ...sample, start: '2026-02-29' }).success, false);
  assert.equal(tripFields.safeParse({ ...sample, budget: -1 }).success, false);
});

test('budget separates estimates from paid expenses and detects overspending', () => {
  const totals = budgetTotals(sample);
  assert.equal(totals.spent, 515000);
  assert.equal(totals.planned, 220000);
  assert.equal(totals.remaining, 985000);
  assert.equal(totals.byCategory.find(({ category }) => category === 'Хоол')?.amount, 95000);
  const over = budgetTotals({ ...sample, budget: 500000 });
  assert.equal(over.remaining, -15000);
  assert.equal(over.percent, 103);
});

test('planner prioritizes interests, applies daily pace and keeps stops in the same region per day', () => {
  const plan = suggest({
    title: 'Хойд нутаг',
    start: '2026-07-15',
    duration: 3,
    budget: 120000,
    interests: ['Байгаль'],
    pace: 'Тэнцвэртэй',
    region: 'Хөвсгөл'
  });
  assert.equal(plan.trip.end, '2026-07-17');
  assert.equal(plan.itinerary[0].picks[0].place.id, 'khuvsgul');
  assert.deepEqual(
    plan.itinerary.map((day) => day.picks.length),
    [2, 0, 0]
  );
  assert.equal(plan.cost, 21000);
  assert(plan.itinerary[0].picks.every(({ place }) => place.region === 'Хөвсгөл'));
});

test('a trip can start without choosing from the curated destination list',()=>{
 const input={...sample,cover:'custom',coverLabel:'Миний сонгосон чиглэл'};
 const result=tripFields.safeParse(input);
 assert.equal(result.success,true);
 if(result.success){
  assert.equal(result.data.cover,'custom');
  assert.equal(result.data.coverLabel,'Миний сонгосон чиглэл');
 }
 assert.equal(tripFields.safeParse({...input,coverLabel:'a'.repeat(101)}).success,false);
});

test('AI advice can be safely attached to an editable custom trip',()=>{
 const trip=tripFields.safeParse({
  title:'Миний аялал',start:'2026-12-02',end:'2026-12-04',
  travelers:2,budget:500000,cover:'custom',
  coverLabel:'AI туслахын санал',
  aiBrief:'AI-ийн аяллын зөвлөгөө — баталгаагүй.'
 });
 assert.equal(trip.success,true);
 if(trip.success)assert.match(trip.data.aiBrief||'','AI');
 assert.equal(tripFields.safeParse({
  title:'Аялал',start:'2026-12-02',end:'2026-12-04',
  travelers:1,budget:0,cover:'custom',aiBrief:'x'.repeat(5001)
 }).success,false);
});
