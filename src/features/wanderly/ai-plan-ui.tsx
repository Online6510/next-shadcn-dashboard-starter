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
  const [editMode,setEditMode]=useState(false);
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
      setEditMode(false);
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
      <div className='v4-ai-review-heading'>
        <strong>AI саналын засварлах төлөв</strong>
        <button type='button' className='small-button' onClick={()=>setEditMode(!editMode)}
         aria-expanded={editMode}>{editMode?'Дуусгах':'✎ Засварлах'}</button>
      </div>
      {plan.days.map((day,dayIndex)=>(
        <div className='expense-record v4-ai-day-review' key={day.dayIndex}>
          <h4>{day.dayIndex}-р өдөр</h4>
          {editMode ? <>
            <div className='v4-ai-place-editor'>
              {day.placeIds.map((id,placeIndex)=><div key={placeIndex}>
                <label>Очих газар {placeIndex+1}
                  <select value={id} onChange={event=>setPlan(prev=>prev?({
                    ...prev,days:prev.days.map((d,i)=>i===dayIndex?({
                      ...d,placeIds:d.placeIds.map((p,j)=>j===placeIndex?event.target.value:p)
                    }):d)
                  }):prev)}>
                    {destinations.map(place=><option key={place.id} value={place.id}>{place.name} · {place.region}</option>)}
                  </select>
                </label>
                <button type='button' className='small-button' aria-label={placeIndex+1+'-р газрыг хасах'}
                 disabled={day.placeIds.length<=1} onClick={()=>setPlan(prev=>prev?({
                  ...prev,days:prev.days.map((d,i)=>i===dayIndex?({
                   ...d,placeIds:d.placeIds.filter((_,j)=>j!==placeIndex)
                  }):d)
                 }):prev)}>×</button>
              </div>)}
            </div>
            <button type='button' className='small-button' disabled={day.placeIds.length>=3}
              onClick={()=>setPlan(prev=>prev?({...prev,days:prev.days.map((d,i)=>
               i===dayIndex?({...d,placeIds:[...d.placeIds,
                 destinations.find(p=>!d.placeIds.includes(p.id))?.id||destinations[0].id]}):d)}):prev)}
            >＋ Газар нэмэх</button>
            <label>Өдрийн тэмдэглэл
              <textarea rows={2} maxLength={350} value={day.note}
               onChange={event=>setPlan(prev=>prev?({...prev,days:prev.days.map((d,i)=>
                i===dayIndex?({...d,note:event.target.value}):d)}):prev)}/>
            </label>
          </> : <>
            <p>{day.placeIds.map(id=>destinations.find(p=>p.id===id)?.name||id).join(' → ')}</p>
            <small>{day.note}</small>
          </>}
        </div>
      ))}
      {plan.tips.length>0 && <ul>{plan.tips.map((tip,i)=><li key={i}>{tip}</li>)}</ul>}
      <p className='meta'>AI-ийн санал баталгаатай маршрут, аяллын зардал, цаг агаарын мэдээлэл биш.</p>
      {(() => {
        const ids=plan.days.flatMap(day=>day.placeIds);
        if(new Set(ids).size!==ids.length)return <p role='alert' className='error-text'>Нэг газрыг олон давхар сонгосон байна. Хадгалахаас өмнө засна уу.</p>;
        return <SaveAIPlan key={JSON.stringify(plan)} input={input} plan={plan}/>;
      })()}
      <p className='meta'>Жагсаалтаас бусад дурын газар очих бол аяллаа хадгалсны дараа газрын зураг дээр өөрийн цэгээ нэмнэ үү.</p>
    </>}
  </section>;
}
