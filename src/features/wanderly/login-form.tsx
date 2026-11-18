'use client';
import { useActionState } from 'react';
import { signIn, signUp } from './auth-actions';

export function LoginForm() {
  const [signInError, signInAction, signInPending] = useActionState(signIn, '');
  const [signUpError, signUpAction, signUpPending] = useActionState(signUp, '');
  return (
    <div className='v3-login-options'>
      <form action={signInAction} className='panel editor-form'>
        <h2>Нэвтрэх</h2>
        <label>Имэйл<input type='email' name='email' autoComplete='email' required /></label>
        <label>Нууц үг<input type='password' name='password' autoComplete='current-password' minLength={8} required /></label>
        {signInError && <p role='status' className='meta'>{signInError}</p>}
        <button className='button' disabled={signInPending}>Нэвтрэх →</button>
      </form>
      <form action={signUpAction} className='panel editor-form'>
        <h2>Шинээр бүртгүүлэх</h2>
        <label>Имэйл<input type='email' name='email' autoComplete='email' required /></label>
        <label>Нууц үг<input type='password' name='password' autoComplete='new-password' minLength={8} required /></label>
        {signUpError && <p role='status' className='meta'>{signUpError}</p>}
        <button className='button' disabled={signUpPending}>Бүртгүүлэх →</button>
      </form>
    </div>
  );
}
