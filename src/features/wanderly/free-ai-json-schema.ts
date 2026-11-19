import {destinations} from './catalog';

/** Minimal JSON Schema supported by Groq GPT-OSS strict structured outputs.
 * Validate the returned value again with Zod, never trust model-generated IDs.
 */
export const freeTripJsonSchema={
 type:'object',
 properties:{
  overview:{type:'string'},
  days:{type:'array',items:{
   type:'object',
   properties:{
    dayIndex:{type:'integer'},
    placeIds:{type:'array',items:{type:'string',enum:destinations.map(p=>p.id)}},
    note:{type:'string'}
   },
   required:['dayIndex','placeIds','note'],
   additionalProperties:false
  }},
  tips:{type:'array',items:{type:'string'}}
 },
 required:['overview','days','tips'],
 additionalProperties:false
} as const;
