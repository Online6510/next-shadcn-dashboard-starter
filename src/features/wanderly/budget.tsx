'use client';
import { useState } from 'react';
import { categories, dateLabel, money } from './catalog';
import { ActionForm, ExpenseForm } from './forms';
import { budgetTotals } from './model';
import type { Trip } from './model';

export function Budget({ trip }: { trip: Trip }) {
  const [category, setCategory] = useState('');
  const records = trip.expenses.filter((expense) => !category || expense.category === category);
  const totals = budgetTotals(trip);
  return (
    <section id='budget' className='budget-section'>
      <div>
        <p className='eyebrow'>ЗАРДАЛ</p>
        <h2>Аяллын төсөв</h2>
      </div>
      <div className='budget-grid'>
        <div className='panel budget-summary'>
          <dl className='metrics'>
            <div>
              <dt>Нийт төсөв</dt>
              <dd>{money(trip.budget)}</dd>
            </div>
            <div>
              <dt>Бодит зардал</dt>
              <dd>{money(totals.spent)}</dd>
            </div>
            <div>
              <dt>{totals.remaining < 0 ? 'Хэтэрсэн дүн' : 'Үлдэгдэл'}</dt>
              <dd className={totals.remaining < 0 ? 'error-text' : undefined}>
                {money(Math.abs(totals.remaining))}
              </dd>
            </div>
            <div>
              <dt>Зогсоолын тооцоо</dt>
              <dd>{money(totals.planned)}</dd>
            </div>
          </dl>
          <p className='meta'>
            {trip.budget ? 'Төсвийн ' + totals.percent + '% зарцуулсан' : 'Нийт төсөв 0 ₮'}
          </p>
          <progress
            value={Math.min(totals.percent, 100)}
            max={100}
            aria-label='Төсвийн зарцуулалт'
          />
          <div className='chart' aria-label='Ангилал тус бүрийн бодит зардал'>
            {totals.byCategory.map((item) => (
              <div className='chart-row' key={item.category}>
                <span>{item.category}</span>
                <span className='chart-track' aria-hidden='true'>
                  <span
                    style={{ width: (totals.spent ? (item.amount / totals.spent) * 100 : 0) + '%' }}
                  />
                </span>
                <strong>{money(item.amount)}</strong>
              </div>
            ))}
          </div>
        </div>
        <div className='panel'>
          <h3>Бодит зардлууд</h3>
          <label>
            Зардлаар шүүх
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value=''>Бүх ангилал</option>
              {categories.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <details className='inline-details'>
            <summary>＋ Зардал нэмэх</summary>
            <ExpenseForm trip={trip} />
          </details>
          {!records.length && <p className='meta'>Зардал бүртгээгүй байна.</p>}
          {records.map((expense) => (
            <article className='expense-record' key={expense.id}>
              <div className='panel-heading'>
                <strong>{expense.note}</strong>
                <strong>{money(expense.amount)}</strong>
              </div>
              <small>
                {expense.category} · {dateLabel(expense.date)}
              </small>
              <details className='inline-details'>
                <summary>Засах</summary>
                <ExpenseForm trip={trip} expense={expense} />
              </details>
              <ActionForm
                compact
                target={{ kind: 'remove', trip: trip.id, collection: 'expenses', id: expense.id }}
                label='Устгах'
                confirm='Энэ зардлыг устгах уу?'
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
