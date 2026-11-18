import Link from 'next/link';
import { optionalUser } from '@/lib/wanderly/auth';
import { signOut } from './auth-actions';

export async function AuthNav() {
  const user = await optionalUser();
  return user ? (
    <form action={signOut} className='v3-auth-nav'>
      <button className='small-button' type='submit' title='Гарах'>Гарах</button>
    </form>
  ) : (
    <Link className='v3-auth-link' href='/login'>Нэвтрэх</Link>
  );
}
