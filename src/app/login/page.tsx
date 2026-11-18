import { redirect } from 'next/navigation';
import { LoginForm } from '@/features/wanderly/login-form';
import { optionalUser } from '@/lib/wanderly/auth';

export const metadata = { title: 'Нэвтрэх' };

export default async function LoginPage() {
  if (await optionalUser()) redirect('/trips');
  return (
    <section className='container section v3-login-page'>
      <p className='eyebrow'>WANDERLY / ХУВИЙН ОРОН ЗАЙ</p>
      <h1>Аяллын түүхээ <em>хадгал</em></h1>
      <p className='intro'>Өөрийн аялал, зардал, дурсамжаа зөвхөн өөртөө нээлттэй хадгалаарай.</p>
      <LoginForm />
    </section>
  );
}
