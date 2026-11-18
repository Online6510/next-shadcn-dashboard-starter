import type { Metadata } from 'next';
import Link from 'next/link';
import { ThemePicker } from '@/features/wanderly/theme-picker';

export const metadata: Metadata = { title: 'Өнгө ба дизайн' };

export default function AppearanceSettingsPage() {
  return (
    <section className='container section v3-appearance'>
      <p className='eyebrow'>WANDERLY / SETTINGS</p>
      <h1>Өөрийн аяллын <em>өнгө төрх</em></h1>
      <p className='intro'>
        Дуртай өнгөний уур амьсгалаа сонгоорой. Сонголт энэ хөтөч дээр хадгалагдаж,
        бүх хуудсанд ашиглагдана.
      </p>
      <div className='v3-settings-layout'>
        <div>
          <h2>Appearance</h2>
          <p className='v3-settings-description'>
            Гурван загварыг туршиж, өөрт хамгийн тухтай санагдсаныг сонго.
            Nature Luxury нь анхдагч загвар юм.
          </p>
          <ThemePicker />
        </div>
        <aside className='v3-appearance-preview'>
          <div className='v3-preview-photo' role='img' aria-label='Монголын байгалийн аяллын зураг'>
            <span>WANDERLY / EXPLORE</span>
          </div>
          <div className='v3-preview-content'>
            <p className='eyebrow'>WANDER MORE</p>
            <h3>Аялал бүр <em>дурсамж.</em></h3>
            <p>Өнгөө сольсноор энэ preview болон аппын хуудсуудын өнгө өөрчлөгдөнө.</p>
            <Link className='button' href='/explore'>Газруудыг судлах →</Link>
          </div>
        </aside>
      </div>
      <Link className='text-link' href='/'>← Нүүр хуудас</Link>
    </section>
  );
}
