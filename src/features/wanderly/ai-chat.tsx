'use client';
import Link from 'next/link';
import {useState,useRef,useEffect} from 'react';
import {IconSend,IconSparkles,IconRoute,IconMap2,IconCalendarPlus,IconRobot} from '@tabler/icons-react';

type Message={role:'user'|'assistant';content:string};
const prompts=[
 'Би 3 хоног 500,000₮ төсөвтэй Хөвсгөлд аялахыг хүсэж байна.',
 'Говийн аялалд заавал анхаарах зүйлс юу вэ?',
 'Хүүхэдтэй гэр бүлд тохирох 2 өдрийн маршрут санал болго.',
 'Очих газраа хэрхэн газрын зураг дээр нэмэх вэ?'
];

export function AIChat({demo=false}:{demo?:boolean}){
 const [messages,setMessages]=useState<Message[]>(demo?[
  {role:'user',content:'Би 3 хоног, 500,000₮ төсөвтэй Хөвсгөл рүү аялах төлөвлөгөө гаргаарай.'},
  {role:'assistant',content:'Таны 3 хоногийн Хөвсгөлийн аяллын санаа бэлэн!\n\n1-р өдөр — Хатгалд очиж, нуурын эрэг дагуу тайван алхах.\n2-р өдөр — Нуурын эрэг орчмын байгалийн газруудыг үзэх.\n3-р өдөр — Үзэсгэлэнт цэгт өглөөг өнгөрүүлээд буцах.\n\n500,000₮-ийн төсвийг тээвэр, байр, хоол, нөөц зардлаар өөрөө хуваарилаарай. Замын бодит цаг, үнэ, нөхцөлийг явахаасаа өмнө нягтлаарай.'}
 ]:[]);
 const [input,setInput]=useState('');
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState('');
 const end=useRef<HTMLDivElement>(null);
 useEffect(()=>{end.current?.scrollIntoView({behavior:'smooth',block:'nearest'})},[messages.length,loading]);
 async function ask(question:string){
  const text=question.trim();
  if(text.length<3||loading||demo)return;
  setInput('');setError('');setLoading(true);
  const history=messages.slice(-8);
  setMessages([...messages,{role:'user',content:text}]);
  try{
   const res=await fetch('/api/ai/chat',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({message:text,history})
   });
   const json=await res.json() as {answer?:string;error?:string};
   if(!res.ok||!json.answer)throw new Error(json.error||'AI хариу ирсэнгүй.');
   setMessages(prev=>[...prev,{role:'assistant',content:json.answer||''}]);
  }catch(e){setError(e instanceof Error?e.message:'AI холбогдоход алдаа гарлаа.');}
  finally{setLoading(false)}
 }
 return <section className='v4-chat-card' aria-label='Wanderly AI чат'>
  <div className='v4-chat-head'>
   <div className='v4-chat-head-icon'><IconSparkles size={23}/></div>
   <div><p className='v4-overline'>WANDERLY AI</p><h2>AI Аяллын туслах</h2>
    <p>Танд тохирсон маршрутын санааг ярилцаж бүтээе.</p></div>
   <span className='v4-chat-live'>AI Gateway</span>
  </div>
  <div className='v4-chat-history' aria-live='polite' aria-busy={loading}>
   {messages.length===0&&<div className='v4-chat-welcome'>
    <IconRobot size={37} stroke={1.5}/>
    <h3>Хаашаа аялах вэ?</h3>
    <p>Хаашаа, хэд хоног, хэдүүлээ, ямар төсөвтэй явахаа бичээрэй. Би санаа өгч, төлөвлөгөөг чинь цэгцлэхэд тусална.</p>
    <div className='v4-chat-prompt-grid'>
     {prompts.map(p=><button key={p} type='button' onClick={()=>void ask(p)} disabled={loading||demo}>{p} →</button>)}
    </div>
   </div>}
   {messages.map((message,index)=><div className={'v4-chat-message v4-chat-'+message.role} key={index}>
    <span className='v4-chat-avatar'>{message.role==='assistant'?'✧':'Т'}</span>
    <div><small>{message.role==='assistant'?'Wanderly AI':'Та'}</small>
     <p>{message.content}</p></div>
   </div>)}
   {loading&&<div className='v4-chat-thinking'><IconSparkles size={18}/> AI аяллын санааг боловсруулж байна…</div>}
   {error&&<p role='alert' className='v4-chat-error'>{error}</p>}
   <div ref={end}/>
  </div>
  <div className='v4-chat-quick-actions'>
   <Link href='/map'><IconMap2 size={17}/> Газрын зураг</Link>
   <Link href='/trips/new'><IconCalendarPlus size={17}/> Аялал үүсгэх</Link>
   <Link href='/trips/suggest'><IconRoute size={17}/> Төлөвлөгч</Link>
  </div>
  <form className='v4-chat-composer' onSubmit={e=>{e.preventDefault();void ask(input)}}>
   <input aria-label='AI туслахаас асуух' value={input} disabled={loading||demo} maxLength={1200}
    onChange={e=>setInput(e.target.value)} placeholder='Аяллын тухай юу ч асуугаарай…'/>
   <button type='submit' disabled={loading||input.trim().length<3||demo} aria-label='Илгээх'><IconSend size={21}/></button>
  </form>
  <p className='v4-chat-disclaimer'>AI-ийн мэдээлэл нь баталгаатай зам, үнэ, захиалга, цаг агаарын эх сурвалж биш. Нэвтэрсэн хэрэглэгч 24 цагт 5 хүсэлт илгээнэ.</p>
 </section>;
}
