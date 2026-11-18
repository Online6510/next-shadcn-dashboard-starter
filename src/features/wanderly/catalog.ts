export const destinations = [
  {
    id: 'khuvsgul',
    name: 'Хөвсгөл нуур',
    region: 'Хөвсгөл',
    category: 'Байгаль',
    image: 'lake',
    lat: 51.13,
    lon: 100.5,
    tags: ['Нуур', 'Тайга'],
    description: 'Тайгын дунд цэнхэртэх нуурын эргээр алхаж, нам гүм өглөөг угтаарай.'
  },
  {
    id: 'terelj',
    name: 'Горхи-Тэрэлж',
    region: 'Төв',
    category: 'Адал явдал',
    image: 'terelj',
    lat: 47.92,
    lon: 107.42,
    tags: ['Уул', 'Алхалт'],
    description: 'Боржин хад, ойт хөндий, голын эрэг хотын хэмнэлээс түр холдуулна.'
  },
  {
    id: 'khongor',
    name: 'Хонгорын элс',
    region: 'Өмнөговь',
    category: 'Адал явдал',
    image: 'gobi',
    lat: 43.76,
    lon: 102.29,
    tags: ['Говь', 'Элсэн манхан'],
    description: 'Сэврэй уулын бэл дэх элсэн манхны оройгоос говийн уудам талыг тольдоорой.'
  },
  {
    id: 'orkhon',
    name: 'Орхоны хүрхрээ',
    region: 'Өвөрхангай',
    category: 'Байгаль',
    image: 'orkhon',
    lat: 46.79,
    lon: 101.96,
    tags: ['Хүрхрээ', 'Хөндий'],
    description: 'Галт уулын хар чулуун хавцал дундуур урсах Орхон гол энд хүрхрээ болон бууна.'
  },
  {
    id: 'kharkhorin',
    name: 'Хархорин',
    region: 'Өвөрхангай',
    category: 'Соёл',
    image: 'kharkhorin',
    lat: 47.2,
    lon: 102.83,
    tags: ['Түүх', 'Хийд'],
    description: 'Эртний нийслэлийн туурь, Эрдэнэ Зуу хийдээр Монголын түүхтэй танилцаарай.'
  },
  {
    id: 'tsenkher',
    name: 'Цэнхэрийн халуун рашаан',
    region: 'Архангай',
    category: 'Амралт',
    image: 'tsenkher',
    lat: 47.32,
    lon: 101.65,
    tags: ['Рашаан', 'Ой'],
    description: 'Хангайн ойт хөндий дэх халуун рашаан аяллын дундуур амрахад тохиромжтой.'
  },
  {
    id: 'bayanzag',
    name: 'Баянзаг',
    region: 'Өмнөговь',
    category: 'Соёл',
    image: 'bayanzag',
    lat: 44.14,
    lon: 103.73,
    tags: ['Палеонтологи', 'Говь'],
    description: 'Үлэг гүрвэлийн олдвороор алдартай улаан цав нар жаргах үед улам тодордог.'
  },
  {
    id: 'altai',
    name: 'Алтай Таван Богд',
    region: 'Баян-Өлгий',
    category: 'Адал явдал',
    image: 'altai',
    lat: 49.15,
    lon: 87.82,
    tags: ['Мөсөн гол', 'Уул'],
    description: 'Монголын хамгийн өндөр оргилууд, Потанины мөсөн гол баруун хязгаарт оршино.'
  },
  {
    id: 'khatgal',
    name: 'Хатгал тосгон',
    region: 'Хөвсгөл',
    category: 'Соёл',
    image: 'lake',
    lat: 50.44,
    lon: 100.16,
    tags: ['Тосгон', 'Нуур'],
    description: 'Хөвсгөл нуурын өмнөд эрэг дээрх тосгон нуурын аяллын эхлэл болдог.'
  },
  {
    id: 'khankh',
    name: 'Ханх сум',
    region: 'Хөвсгөл',
    category: 'Амралт',
    image: 'hero',
    lat: 51.51,
    lon: 100.66,
    tags: ['Эрэг', 'Уул'],
    description: 'Нуурын хойд эргийн уулсын дунд Монголын хойд нутгийн амгалан төрхийг мэдрээрэй.'
  }
];

export type Destination = (typeof destinations)[number];
export const categories = ['Тээвэр', 'Байр', 'Хоол', 'Үзвэр', 'Бусад'] as const;
export const money = (value: number) => `${new Intl.NumberFormat('mn-MN').format(value)} ₮`;
export function dateLabel(value: string) {
  const [, month, day] = value.split('-');
  return `${Number(month)}-р сарын ${Number(day)}`;
}

export function mongoliaToday() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ulaanbaatar' }).format(new Date());
}
