'use client';
import {useActionState,useState} from 'react';
import {signIn,signUp} from './auth-actions';

export function LoginForm(){
 const [mode,setMode]=useState<'login'|'signup'>('login');
 const [signInError,signInAction,signInPending]=useActionState(signIn,'');
 const [signUpError,signUpAction,signUpPending]=useActionState(signUp,'');
 const signUpMode=mode==='signup';
 return <div className='v4-login-form'>
  <div role='tablist' aria-label='Бүртгэлийн төрөл' className='v4-login-switch'>
   <button type='button' role='tab' id='v4-login-tab' aria-controls='v4-login-panel'
    aria-selected={!signUpMode} onClick={()=>setMode('login')}>Нэвтрэх</button>
   <button type='button' role='tab' id='v4-signup-tab' aria-controls='v4-login-panel'
    aria-selected={signUpMode} onClick={()=>setMode('signup')}>Бүртгүүлэх</button>
  </div>
  <div role='tabpanel' id='v4-login-panel' aria-labelledby={signUpMode?'v4-signup-tab':'v4-login-tab'}>
   {signUpMode?
    <form action={signUpAction} className='v4-auth-form'>
     <h2>Шинээр бүртгүүлэх</h2>
     <p>Имэйлээ баталгаажуулж, хувийн аяллуудаа хадгалаарай.</p>
     <label>Имэйл хаяг
      <input type='email' name='email' autoComplete='email' placeholder='you@example.com' required/>
     </label>
     <label>Нууц үг
      <input type='password' name='password' autoComplete='new-password' minLength={8}
       placeholder='8 ба түүнээс олон тэмдэгт' required/>
     </label>
     {signUpError&&<p role='status' className='v4-auth-form-error'>{signUpError}</p>}
     <button type='submit' className='v4-auth-submit' disabled={signUpPending}>
      {signUpPending?'Бүртгэж байна…':'Бүртгэл үүсгэх'} <span>↗</span>
     </button>
    </form>:
    <form action={signInAction} className='v4-auth-form'>
     <h2>Эргэн тавтай морил</h2>
     <p>Аяллын төлөвлөгөө болон дурсамжаа үргэлжлүүлээрэй.</p>
     <label>Имэйл хаяг
      <input type='email' name='email' autoComplete='email' placeholder='you@example.com' required/>
     </label>
     <label>Нууц үг
      <input type='password' name='password' autoComplete='current-password' minLength={8}
       placeholder='Нууц үг' required/>
     </label>
     {signInError&&<p role='status' className='v4-auth-form-error'>{signInError}</p>}
     <button type='submit' className='v4-auth-submit' disabled={signInPending}>
      {signInPending?'Нэвтэрч байна…':'Аяллуудаа нээх'} <span>→</span>
     </button>
    </form>}
  </div>
 </div>;
}
