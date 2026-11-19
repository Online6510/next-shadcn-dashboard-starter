import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LoginForm } from '@/features/wanderly/login-form';
import { optionalUser } from '@/lib/wanderly/auth';
import { Cover } from '@/features/wanderly/visuals';

export const metadata={title:'Нэвтрэх'};
export default async function LoginPage(){
 if(await optionalUser())redirect('/trips');
 return <section className='v4-auth-layout'>
  <aside className='v4-auth-hero'>
   <Cover image='hero' label='Монгол орны гайхалтай уулс, нуурууд' priority/>
   <div className='v4-auth-hero-inner'>
    <p className='v4-auth-badge'>✧ WANDERLY · MONGOLIA</p>
    <h2>Аяллаа төлөвлө.<br/><span>Дурсамжаа хадгал.</span></h2>
    <p>Таны очих газар, өдөр бүрийн маршрут, төсөв, зураг, дурсамж — бүгд нэг дор, зөвхөн таны хувийн орон зайд.</p>
    <div className='v4-auth-hero-metrics'>
     <span>⌖ &nbsp; Дурын газар</span>
     <span>▧ &nbsp; Хувийн аялал</span>
     <span>✧ &nbsp; Дурсамжийн журнал</span>
    </div>
   </div>
  </aside>
  <div className='v4-auth-right'>
   <div className='v4-auth-panel'>
    <p className='v4-overline'>YOUR NEXT JOURNEY STARTS HERE</p>
    <h1>Тавтай <span>морил.</span></h1>
    <p className='v4-auth-lead'>Нэвтэрч аяллаа үргэлжлүүлэх эсвэл шинэ бүртгэл үүсгээд өөрийн маршрутыг бүтээ.</p>
    <LoginForm/>
    <p className='v4-auth-note'>Таны аялал, хувийн зураг болон тэмдэглэл бусад хэрэглэгчээс хамгаалагдсан.</p>
    <p className='v4-auth-explore'><Link href='/map'>Бүртгэлгүйгээр газрын зураг үзэх ↗</Link></p>
   </div>
  </div>
 </section>;
}
