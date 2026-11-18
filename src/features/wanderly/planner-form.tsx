'use client';

import { useState } from 'react';
import { dateLabel, money } from './catalog';
import { ActionForm, Field } from './forms';
import { interests, paces, plannerFields, regions, suggest } from './planner';
import type { PlannerInput } from './planner';

export function PlannerForm() {
  const [input, setInput] = useState<PlannerInput>();
  const [error, setError] = useState('');
  const plan = input && suggest(input);
  return (
    <div className='budget-grid'>
      <div className='panel'>
        <form
          className='editor-form'
          onChange={() => {
            setInput(undefined);
            setError('');
          }}
          onSubmit={(event) => {
            event.preventDefault();
            const fields = new FormData(event.currentTarget);
            const result = plannerFields.safeParse({
              ...Object.fromEntries(fields),
              interests: fields.getAll('interests')
            });
            if (!result.success) {
              setError('Огноогоо шалгаад 1–3 сонирхол сонгоно уу.');
              return;
            }
            setInput(result.data);
          }}
        >
          <Field label='Аяллын нэр'>
            <input
              name='title'
              required
              maxLength={140}
              defaultValue='Монгол орноор аялах төлөвлөгөө'
            />
          </Field>
          <div className='fields-row'>
            <Field label='Эхлэх өдөр'>
              <input name='start' type='date' required />
            </Field>
            <Field label='Хоногийн тоо'>
              <input name='duration' type='number' min='1' max='7' required defaultValue='3' />
            </Field>
          </div>
          <Field label='Төсвийн дээд хязгаар (₮)'>
            <input
              name='budget'
              type='number'
              min='0'
              max='1000000000'
              required
              defaultValue='800000'
            />
          </Field>
          <div className='fields-row'>
            <Field label='Аймаг'>
              <select name='region'>
                <option value=''>Бүх аймаг</option>
                {regions.map((region) => (
                  <option key={region}>{region}</option>
                ))}
              </select>
            </Field>
            <Field label='Аяллын хэмнэл'>
              <select name='pace' defaultValue={paces[1]}>
                {paces.map((pace) => (
                  <option key={pace}>{pace}</option>
                ))}
              </select>
            </Field>
          </div>
          <fieldset className='interest-options'>
            <legend>Сонирхол (1–3)</legend>
            {interests.map((value) => (
              <label key={value}>
                <input
                  type='checkbox'
                  name='interests'
                  value={value}
                  defaultChecked={value === 'Байгаль'}
                />
                {value}
              </label>
            ))}
          </fieldset>
          {error && (
            <p className='error-text' role='alert'>
              {error}
            </p>
          )}
          <button className='button'>Санал харах →</button>
        </form>
      </div>
      <div className='panel' aria-live='polite'>
        <h2 className='suggest-heading'>Санал болгосон өдрүүд</h2>
        {input && plan ? (
          <>
            <p className='meta'>
              Өдөрт нэг аймгийн газруудыг бүлэглэв. Нэг зогсоолд {money(plan.cost)}-ийн төсвийн зай
              хуваарилав.
            </p>
            {plan.itinerary.map(({ day, picks }) => (
              <article className='expense-record' key={day}>
                <h3>{dateLabel(day)}</h3>
                {picks.length ? (
                  <ul>
                    {picks.map(({ place, matches }) => (
                      <li key={place.id}>
                        <strong>{place.name}</strong> · {place.region}
                        <br />
                        <small>
                          {matches
                            ? `Сонирхолтой нийцсэн · ${place.category}`
                            : 'Тухайн аймгийн өөр нэг газар'}
                        </small>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className='meta'>Чөлөөт өдөр</p>
                )}
              </article>
            ))}
            <ActionForm target={{ kind: 'plan' }} label='Аялал болгож хадгалах'>
              {Object.entries(input).flatMap(([key, value]) =>
                (Array.isArray(value) ? value : [value]).map((item) => (
                  <input key={key + item} type='hidden' name={key} value={item} />
                ))
              )}
            </ActionForm>
          </>
        ) : (
          <p className='meta'>Өдөр, төсөв, сонирхлоо сонгоод үр дүнг энд харна уу.</p>
        )}
      </div>
    </div>
  );
}
