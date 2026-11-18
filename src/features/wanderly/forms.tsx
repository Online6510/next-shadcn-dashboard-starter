'use client';

import { cloneElement, useActionState, useId } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { save } from './actions';
import { UploadPicker } from './upload-picker';
import { categories, destinations, dateLabel } from './catalog';
import type { Entry, Expense, Stop, Trip } from './model';

export function ActionForm({
  target,
  children,
  label,
  confirm,
  compact
}: {
  target: Parameters<typeof save>[0];
  children?: ReactNode;
  label: string;
  confirm?: string;
  compact?: boolean;
}) {
  const [error, action, pending] = useActionState(save.bind(null, target), '');
  return (
    <form
      action={action}
      className={compact ? 'compact-form' : 'editor-form'}
      onSubmit={(event) => {
        if (confirm && !window.confirm(confirm)) event.preventDefault();
      }}
    >
      {children}
      {error && (
        <p role='alert' className='error-text'>
          {error}
        </p>
      )}
      <button className={compact ? 'small-button' : 'button'} disabled={pending}>
        {pending ? 'Түр хүлээнэ үү…' : label}
      </button>
    </form>
  );
}

export function Field({
  label,
  children
}: {
  label: string;
  children: ReactElement<{ id?: string }>;
}) {
  const id = useId();
  return (
    <div className='field'>
      <label htmlFor={id}>{label}</label>
      {cloneElement(children, { id })}
    </div>
  );
}

function DestinationSelect({ value, id }: { value?: string; id?: string }) {
  return (
    <select id={id} name='destination' defaultValue={value || destinations[0].id}>
      {destinations.map((place) => (
        <option key={place.id} value={place.id}>
          {place.name}
        </option>
      ))}
    </select>
  );
}

export function TripForm({ trip, selection }: { trip?: Trip; selection?: string }) {
  return (
    <ActionForm
      target={{ kind: 'trip', trip: trip?.id }}
      label={trip ? 'Өөрчлөлт хадгалах' : 'Аялал үүсгэх'}
    >
      {selection && <input type='hidden' name='destination' value={selection} />}
      <Field label='Аяллын нэр'>
        <input
          name='title'
          required
          maxLength={140}
          defaultValue={trip?.title}
          placeholder='Хөвсгөлийн зуны аялал'
        />
      </Field>
      <div className='fields-row'>
        <Field label='Эхлэх өдөр'>
          <input name='start' type='date' required defaultValue={trip?.start} />
        </Field>
        <Field label='Дуусах өдөр'>
          <input name='end' type='date' required defaultValue={trip?.end} />
        </Field>
      </div>
      <div className='fields-row'>
        <Field label='Аялагчдын тоо'>
          <input
            name='travelers'
            type='number'
            required
            min='1'
            max='100'
            defaultValue={trip?.travelers || 2}
          />
        </Field>
        <Field label='Нийт төсөв (₮)'>
          <input
            name='budget'
            type='number'
            required
            min='0'
            max='1000000000'
            defaultValue={trip?.budget ?? 1500000}
          />
        </Field>
      </div>
      <Field label='Нүүр зураг / очих газар'>
        <select name='cover' defaultValue={trip?.cover || selection || destinations[0].id}>
          {destinations.map((place) => (
            <option key={place.id} value={place.id}>
              {place.name}
            </option>
          ))}
        </select>
      </Field>
      <p className='meta'>Нэг аяллын үргэлжлэх хугацаа 30 хүртэл хоног байна.</p>
    </ActionForm>
  );
}

export function StopForm({
  trip,
  days,
  day,
  stop,
  selection
}: {
  trip: string;
  days: string[];
  day: string;
  stop?: Stop;
  selection?: string;
}) {
  return (
    <ActionForm
      target={{ kind: 'stop', trip, id: stop?.id }}
      label={stop ? 'Зогсоол хадгалах' : 'Зогсоол нэмэх'}
    >
      <div className='fields-row'>
        <Field label='Очих газар'>
          <DestinationSelect value={stop?.destination || selection} />
        </Field>
        <Field label='Аяллын өдөр'>
          <select name='day' defaultValue={stop?.day || day}>
            {days.map((date) => (
              <option key={date} value={date}>
                {dateLabel(date)}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className='fields-row'>
        <Field label='Эхлэх цаг'>
          <input type='time' name='time' defaultValue={stop?.time || '09:00'} required />
        </Field>
        <Field label='Үргэлжлэх хугацаа (мин)'>
          <input
            type='number'
            name='duration'
            min='5'
            max='1440'
            defaultValue={stop?.duration || 60}
            required
          />
        </Field>
      </div>
      <Field label='Төлөвлөсөн зардал (₮)'>
        <input
          type='number'
          name='cost'
          min='0'
          max='1000000000'
          defaultValue={stop?.cost || 0}
          required
        />
      </Field>
      <Field label='Тэмдэглэл'>
        <textarea name='notes' rows={2} maxLength={2000} defaultValue={stop?.notes} />
      </Field>
    </ActionForm>
  );
}

export function ExpenseForm({
  trip,
  expense,
  day
}: {
  trip: Trip;
  expense?: Expense;
  day?: string;
}) {
  return (
    <ActionForm
      target={{ kind: 'expense', trip: trip.id, id: expense?.id, day }}
      label={expense ? 'Зардал хадгалах' : 'Зардал нэмэх'}
    >
      <Field label='Тайлбар'>
        <input name='note' required maxLength={140} defaultValue={expense?.note} />
      </Field>
      <div className='fields-row'>
        <Field label='Ангилал'>
          <select name='category' defaultValue={expense?.category}>
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </Field>
        <Field label='Дүн (₮)'>
          <input
            name='amount'
            type='number'
            min='1'
            max='1000000000'
            required
            defaultValue={expense?.amount}
          />
        </Field>
      </div>
      <Field label='Огноо'>
        <input name='date' type='date' required defaultValue={expense?.date || trip.start} />
      </Field>
    </ActionForm>
  );
}

export function EntryForm({ trip, entry }: { trip: Trip; entry?: Entry }) {
  return (
    <ActionForm
      target={{ kind: 'entry', trip: trip.id, id: entry?.id }}
      label={entry ? 'Тэмдэглэл хадгалах' : 'Тэмдэглэл нэмэх'}
    >
      <Field label='Гарчиг'>
        <input name='title' required maxLength={140} defaultValue={entry?.title} />
      </Field>
      <div className='fields-row'>
        <Field label='Огноо'>
          <input name='date' type='date' required defaultValue={entry?.date || trip.start} />
        </Field>
        <Field label='Байршил'>
          <input name='place' maxLength={140} defaultValue={entry?.place} />
        </Field>
      </div>
      <Field label='Түүх'>
        <textarea name='story' rows={4} required maxLength={5000} defaultValue={entry?.story} />
      </Field>
      <UploadPicker existing={entry?.photos} />
      <Field label='Зургийн холбоос'>
        <input name='image' maxLength={2048} placeholder='https://…' defaultValue={entry?.image} />
      </Field>
      <Field label='Сэтгэл хөдлөл'>
        <input name='mood' maxLength={64} defaultValue={entry?.mood} />
      </Field>
    </ActionForm>
  );
}
