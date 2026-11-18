'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconHome,IconCompass,IconCalendarEvent,IconPhoto,IconUser } from '@tabler/icons-react';

const items=[
 {href:'/',label:'Нүүр',icon:IconHome},
 {href:'/explore',label:'Судлах',icon:IconCompass},
 {href:'/trips',label:'Аялал',icon:IconCalendarEvent},
 {href:'/journal',label:'Дурсамж',icon:IconPhoto},
 {href:'/settings/appearance',label:'Би',icon:IconUser}
];
export function MobileBottomNav(){
 const pathname=usePathname();
 return <nav className='v4-mobile-bottom' aria-label='Гар утасны үндсэн цэс'>
 {items.map(({href,label,icon:Icon})=><Link key={href} href={href} aria-current={
 pathname===href||href!=='/'&&pathname.startsWith(href+'/')?'page':undefined
 }><Icon size={21} stroke={2}/><span>{label}</span></Link>)}
 </nav>;
}
