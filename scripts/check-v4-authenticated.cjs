/**
 * Real account integration test. Run ONLY against a disposable QA account on an
 * explicitly chosen Preview URL. Creates and later deletes one unique QA trip.
 * No fake credentials are bundled or logged.
 */
const assert=require('node:assert/strict');
const path=require('node:path');
const {chromium}=require('@playwright/test');
const base=process.env.WANDERLY_TEST_URL?.replace(/\/+$/,'');
const email=process.env.WANDERLY_TEST_EMAIL;
const password=process.env.WANDERLY_TEST_PASSWORD;
const secondEmail=process.env.WANDERLY_SECOND_TEST_EMAIL;
const secondPassword=process.env.WANDERLY_SECOND_TEST_PASSWORD;
const wantsAI=process.env.WANDERLY_AI_LIVE_TEST==='1';
const bypass=process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
if(!base||!email||!password)throw Error('Set WANDERLY_TEST_URL, WANDERLY_TEST_EMAIL and WANDERLY_TEST_PASSWORD');
if(!/^https:\/\/[-\w.]+$/.test(base)&&!/^http:\/\/127\.0\.0\.1:\d+$/.test(base))throw Error('Use a safe HTTPS preview origin or local test server.');
const title='Wanderly QA '+Date.now();
const headers=bypass?{'x-vercel-protection-bypass':bypass}:{};

async function login(page,user,password){
 await page.goto(base+'/login',{waitUntil:'load'});
 await page.locator('form.v4-auth-form input[name=email]').fill(user);
 await page.locator('form.v4-auth-form input[name=password]').fill(password);
 await page.locator('form.v4-auth-form button[type=submit]').click();
 await page.waitForURL(/\/trips(?:\?.*)?$/, {timeout:20000});
}

async function main(){
 const browser=await chromium.launch({args:['--no-sandbox']});
 let tripUrl=null;
 const page=await browser.newPage({viewport:{width:1440,height:900},extraHTTPHeaders:headers});
 page.on('dialog',dialog=>dialog.accept());
 try{
  await login(page,email,password);
  await page.goto(base+'/trips/new',{waitUntil:'load'});
  const trip=page.locator('form.editor-form').first();
  await trip.locator('[name=title]').fill(title);
  await trip.locator('[name=start]').fill('2027-03-15');
  await trip.locator('[name=end]').fill('2027-03-17');
  await trip.locator('[name=travelers]').fill('2');
  await trip.locator('[name=budget]').fill('500000');
  await trip.locator('[name=cover]').selectOption('custom');
  await trip.locator('[name=coverLabel]').fill('QA Custom Destination');
  await trip.getByRole('button',{name:'Аялал үүсгэх'}).click();
  await page.waitForURL(/\/trips\/[0-9a-f-]{36}/,{timeout:25000});
  tripUrl=new URL(page.url()).pathname;
  assert(tripUrl.startsWith('/trips/'),'Trip created and redirected');

  await page.getByText('Зогсоол нэмэх').first().click();
  const stop=page.locator('form.editor-form').filter({has:page.locator('.v4-place-picker')}).first();
  await stop.locator('select[name=destination]').selectOption('custom');
  await stop.locator('input[name=customName]').fill('QA Mountain Trail');
  await stop.locator('input[name=customAddress]').fill('QA test coordinate');
  await stop.locator('input[name=lat]').fill('47.918');
  await stop.locator('input[name=lon]').fill('106.918');
  await stop.locator('input[name=cost]').fill('12000');
  await stop.getByRole('button',{name:'Зогсоол нэмэх'}).click();
  await page.waitForURL(/day=/,{timeout:25000});
  assert(await page.getByText('QA Mountain Trail').first().isVisible(),'Arbitrary stop saved');

  await page.getByText('＋ Зардал нэмэх').first().click();
  const expense=page.locator('#budget form.editor-form').first();
  await expense.locator('[name=note]').fill('Wanderly QA expense');
  await expense.locator('[name=category]').selectOption('Тээвэр');
  await expense.locator('[name=amount]').fill('15000');
  await expense.locator('[name=date]').fill('2027-03-15');
  await expense.getByRole('button',{name:'Зардал нэмэх'}).click();
  await page.waitForURL(/panel=budget/,{timeout:25000});
  assert(await page.getByText('Wanderly QA expense').first().isVisible(),'Expense persisted');

  const id=tripUrl.split('/').at(-1);
  await page.goto(base+'/journal/'+id,{waitUntil:'load'});
  await page.getByText('Дурсамж нэмэх').first().click();
  const journal=page.locator('form.editor-form').filter({has:page.locator('[name=story]')}).first();
  await journal.locator('[name=title]').fill('QA Lake Memory');
  await journal.locator('[name=date]').fill('2027-03-15');
  await journal.locator('[name=place]').fill('QA Place');
  await journal.locator('[name=story]').fill('QA Journal content with private image.');
  const uploader=journal.locator('input[type=file]');
  if(await uploader.count())await uploader.first().setInputFiles(path.join(process.cwd(),'public','images','lake.webp'));
  await journal.getByRole('button',{name:'Тэмдэглэл нэмэх'}).click();
  await page.waitForURL(new RegExp('/journal/'+id),{timeout:25000});
  assert(await page.getByText('QA Lake Memory').first().isVisible(),'Journal saved with media');

  await page.goto(base+'/explore',{waitUntil:'load'});
  await page.getByRole('button',{name:'Дуртай газар хадгалах'}).first().click();
  await page.waitForTimeout(650);
  assert(await page.getByRole('button',{name:'Дуртай газраас хасах'}).count()>0,'Supabase favorite saved');

  if(secondEmail&&secondPassword){
    const guest=await browser.newPage({extraHTTPHeaders:headers});
    try{
      await login(guest,secondEmail,secondPassword);
      const response=await guest.goto(base+tripUrl,{waitUntil:'load'});
      assert.equal(response.status(),404,'Other users cannot load private trip');
      const journalResponse=await guest.goto(base+'/journal/'+id,{waitUntil:'load'});
      assert.equal(journalResponse.status(),404,'Other users cannot see private journal');
    }finally{await guest.close();}
  }

  if(wantsAI){
    const result=await page.evaluate(async()=>{
      const status=await fetch('/api/ai/status');
      const info=await status.json();
      if(!info.configured)return {ready:false,error:'AI Gateway not configured'};
      const res=await fetch('/api/ai/chat',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({message:'Хөвсгөл рүү аялах нэг зөвлөгөөг Монгол хэлээр өг.',history:[]})});
      return {ready:res.ok,response:await res.json(),code:res.status};
    });
    assert.equal(result.ready,true,'Live AI Gateway inference failed: '+JSON.stringify(result));
    assert(result.response?.answer?.length>10,'AI reply missing');
    console.log('Live AI inference verified; tokens and usage may be billed.');
  }
  console.log('Wanderly authenticated E2E completed: account, trip, custom place, expense, journal, favorite'+(secondEmail?' and two-user RLS':'')+(wantsAI?' and live AI':''));
 }finally{
  if(tripUrl){
   try{
    await page.goto(base+tripUrl,{waitUntil:'load'});
    await page.getByText('Аяллын мэдээлэл засах').first().click();
    await page.getByRole('button',{name:'Аялал устгах'}).first().click();
    await page.waitForURL(/\/trips(?:\?.*)?$/,{timeout:20000});
    console.log('QA trip successfully deleted');
   }catch(e){console.error('Cleanup needed for unique QA trip: '+title+'; '+String(e));}
  }
  await browser.close();
 }
}
main().catch(error=>{console.error(error);process.exitCode=1});
