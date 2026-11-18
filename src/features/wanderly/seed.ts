import type { Trip } from './model';

export const sample: Trip = {
  id: 'khuvsgul-demo',
  title: 'Хөвсгөлийн 3 өдрийн аялал',
  start: '2026-07-15',
  end: '2026-07-17',
  travelers: 2,
  budget: 1500000,
  cover: 'khuvsgul',
  stops: [
    {
      id: 'stop-1',
      day: '2026-07-15',
      destination: 'khatgal',
      time: '10:00',
      duration: 120,
      cost: 65000,
      notes: 'Эрэг дагуу алхаж, тосгоноор танилцах.'
    },
    {
      id: 'stop-2',
      day: '2026-07-15',
      destination: 'khuvsgul',
      time: '15:00',
      duration: 90,
      cost: 40000,
      notes: 'Нуурын эрэг дээр нар жаргахыг харах.'
    },
    {
      id: 'stop-3',
      day: '2026-07-16',
      destination: 'khuvsgul',
      time: '09:30',
      duration: 180,
      cost: 90000,
      notes: 'Өглөө эрт эргээр тайван алхах.'
    },
    {
      id: 'stop-4',
      day: '2026-07-17',
      destination: 'khankh',
      time: '11:00',
      duration: 90,
      cost: 25000,
      notes: 'Хойд эргийн уулсыг харах.'
    }
  ],
  expenses: [
    { id: 'expense-1', date: '2026-07-15', category: 'Тээвэр', amount: 180000, note: 'Шатахуун' },
    {
      id: 'expense-2',
      date: '2026-07-15',
      category: 'Байр',
      amount: 240000,
      note: 'Хоёр шөнийн буудал'
    },
    { id: 'expense-3', date: '2026-07-16', category: 'Хоол', amount: 95000, note: 'Өдрийн хоол' }
  ],
  entries: [
    {
      id: 'entry-1',
      date: '2026-07-15',
      place: 'Хатгал',
      title: 'Нууртай анх уулзсан нь',
      story: 'Тосгоны завьнуудын хажуугаар өнгөрөхөд усан дээр оройн нарны гэрэл гялалзаж байлаа.',
      image: '/images/lake.webp',
      mood: 'Баяртай'
    },
    {
      id: 'entry-2',
      date: '2026-07-16',
      place: 'Хөвсгөл нуур',
      title: 'Манан дундах өглөө',
      story:
        'Үүрээр эрэг дээр ганцаараа суув. Манан өргөгдөхөд алсад тайгын бараа аажмаар тодорсон.',
      image: '/images/hero.webp',
      mood: 'Амар амгалан'
    },
    {
      id: 'entry-3',
      date: '2026-07-17',
      place: 'Ханх',
      title: 'Эргэж ирэх амлалт',
      story: 'Нуурын хойд эрэгт цайгаа уугаад, нэг зураг авч үлдлээ. Дараа жил ахиад ирнэ ээ.',
      image: '/images/lake.webp',
      mood: 'Талархалтай'
    }
  ]
};
