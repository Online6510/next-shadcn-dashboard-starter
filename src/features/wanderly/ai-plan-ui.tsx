'use client';
import { useActionState, useState } from 'react';
import { saveAiTrip } from './ai-actions';
import { aiPlanSchema, type AIPlan } from './ai-schema';
import type { PlannerInput } from './planner';
import { destinations } from './catalog';

function SaveAIPlan({input,plan}:{input:PlannerInput;plan:AIPlan}) {
  const [error,action,pending]=useActionState(saveAiTrip.bind(null,input,plan),'');
  return <form action={action}>
    {error && <p className='error-text' role='alert'>{error}</p>}
    <button className='button' disabled={pending}>
      {pending?'Хадгалж байна…':'AI төлөвлөгөөг аялал болгож хадгалах →'}
    </button>
  </form>;
}

export function AIPlanBuilder({input}:{input:PlannerInput}) {
  const [plan,setPlan]=useState<AIPlan|null>(null);
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(false);
  async function generate() {
    setLoading(true);setError('');setPlan(null);
    try {
      const response=await fetch('/api/ai/trip',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(input)
      });
      const result=await response.json();
      if(!response.ok) throw new Error(result.error||'AI санал авах боломжгүй байна.');
      const parsed=aiPlanSchema.safeParse(result.plan);
      if(!parsed.success) throw new Error('AI саналын бүтэц буруу байна.');
      setPlan(parsed.data);
    } catch(err) {
      setError(err instanceof Error?err.message:'AI санал авч чадсангүй.');
    } finally {setLoading(false);}
  }
  return <section className='v3-ai-panel'>
    <div className='panel-heading'>
      <div><p className='eyebrow'>WANDERLY AI</p><h3>AI аяллын туслах</h3></div>
      <span aria-hidden='true'>✧</span>
    </div>
    <p className='meta'>Өдөр, төсөв, сонирхолд тулгуурласан нэмэлт AI санал. Нэг хэрэглэгч өдөрт 5 удаа ашиглана.</p>
    <button type='button' className='button' disabled={loading} onClick={generate}>
      {loading?'AI санал боловсруулж байна…':'✧ AI-аар өөр санал гаргах'}
    </button>
    {error && <p className='error-text' role='alert'>{error}</p>}
    {plan && <>
      <p className='v3-ai-overview'>{plan.overview}</p>
      {plan.days.map((day)=>(
        <div className='expense-record' key={day.dayIndex}>
          <h4>{day.dayIndex}-р өдөр</h4>
          <p>{day.placeIds.map((id)=>destinations.find((p)=>p.id===id)?.name||id).join(' → ')}</p>
          <small>{day.note}</small>
        </div>
      ))}
      {plan.tips.length>0 && <ul>{plan.tips.map((tip,i)=><li key={i}>{tip}</li>)}</ul>}
      <p className='meta'>AI-ийн санал баталгаатай маршрут, аяллын зардал, цаг агаарын мэдээлэл биш.</p>
      <SaveAIPlan input={input} plan={plan}/>
    </>}
  </section>;
}
