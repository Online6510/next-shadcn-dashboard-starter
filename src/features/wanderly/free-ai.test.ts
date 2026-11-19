import {test} from 'node:test';
import assert from 'node:assert/strict';
import {freeTripJsonSchema} from './free-ai-json-schema';
import {aiPlanSchema} from './ai-schema';

test('Groq strict plan schema is all-required and object-only',()=>{
 assert.equal(freeTripJsonSchema.type,'object');
 assert.deepEqual(freeTripJsonSchema.required,['overview','days','tips']);
 assert.equal(freeTripJsonSchema.additionalProperties,false);
 assert.equal(freeTripJsonSchema.properties.days.items.additionalProperties,false);
 assert.deepEqual(freeTripJsonSchema.properties.days.items.required,['dayIndex','placeIds','note']);
});
test('structured free-model output still rejects unknown destinations and excess days',()=>{
 const good={overview:'Таны аялал',days:[{dayIndex:1,placeIds:['khuvsgul'],note:'Бодит замын цагийг шалгана уу.'}],tips:[]};
 assert.equal(aiPlanSchema.safeParse(good).success,true);
 assert.equal(aiPlanSchema.safeParse({...good,days:[{...good.days[0],placeIds:['wrong-hallucinated-place']}]}).success,false);
 assert.equal(aiPlanSchema.safeParse({...good,days:[{...good.days[0],dayIndex:8}]}).success,false);
});
