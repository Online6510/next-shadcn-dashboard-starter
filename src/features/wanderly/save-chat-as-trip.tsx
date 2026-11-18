'use client';
import {useActionState,useState} from 'react';
import {saveChatTrip} from './ai-chat-actions';

export function SaveChatAsTrip({content}:{content:string}){
 const [open,setOpen]=useState(false);
 const [error,action,pending]=useActionState(saveChatTrip.bind(null,content),'');
 return <div className='v4-chat-trip-draft'>
  <button type='button' className='v4-chat-save-button' aria-expanded={open}
   onClick={()=>setOpen(!open)}>{open?'Хаах':'✧ AI зөвлөгөөг шинэ аялал болгож хадгалах →'}</button>
  {open&&<form action={action} className='v4-chat-trip-fields'>
   <p>AI хариуг аяллын тэмдэглэл болгон хадгална. Очих газруудыг газрын зураг дээр баталгаажуулж нэмээрэй.</p>
   <label>Аяллын нэр<input name='title' required maxLength={140} defaultValue='Миний шинэ аялал'/></label>
   <div className='fields-row'>
    <label>Эхлэх өдөр<input name='start' type='date' required/></label>
    <label>Хоног<input name='duration' type='number' min={1} max={30} defaultValue={3} required/></label>
   </div>
   <div className='fields-row'>
    <label>Аялагч<input name='travelers' type='number' min={1} max={100} defaultValue={1} required/></label>
    <label>Төсөв (₮)<input name='budget' type='number' min={0} max={1000000000} defaultValue={500000} required/></label>
   </div>
   {error&&<p role='alert' className='v4-chat-error'>{error}</p>}
   <button type='submit' className='v4-chat-trip-submit' disabled={pending}>
    {pending?'Аялал хадгалж байна…':'Аялал үүсгэж төлөвлөгөөгөө нээх →'}
   </button>
  </form>}
 </div>;
}
