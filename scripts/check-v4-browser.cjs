const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');

const origin=process.env.WANDERLY_TEST_URL||'http://127.0.0.1:3100';
const routes=['/','/explore','/map','/login','/design-review-v4/trip','/design-review-v4/ai','/design-review-v4/journal','/design-review-v4/budget'];

async function main(){
 const browser=await chromium.launch({args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  const errors=[];
  page.on('pageerror',err=>errors.push(err.message));
  for(const size of [{width:1440,height:900},{width:1024,height:768},{width:768,height:1024},{width:430,height:932},{width:390,height:844},{width:360,height:780}]){
   await page.setViewportSize(size);
   for(const route of routes){
    const res=await page.goto(origin+route,{waitUntil:'load',timeout:20000});
    assert.equal(res.status(),200,'Route should open: '+route);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+3);
    assert.equal(overflow,false,'Overflow '+size.width+'px '+route);
   }
   await page.goto(origin+'/login',{waitUntil:'load'});
   await page.getByRole('tab',{name:'Бүртгүүлэх'}).click();
   assert.equal(await page.getByRole('heading',{name:'Шинээр бүртгүүлэх'}).isVisible(),true,
    'Sign up form must appear when changing tabs');
   await page.getByRole('tab',{name:'Нэвтрэх'}).click();
   assert.equal(await page.getByRole('heading',{name:'Эргэн тавтай морил'}).isVisible(),true,
    'Sign in form must return without page navigation');
   await page.goto(origin+'/map',{waitUntil:'load'});
   await page.locator('.v4-explorer-map.leaflet-container').waitFor({timeout:12000});
   const map=page.locator('.v4-explorer-map.leaflet-container');
   const rect=await map.boundingBox();
   assert.ok(rect,'map visible in all viewport sizes');
   await map.click({position:{x:Math.floor(rect.width*.56),y:Math.min(250,Math.floor(rect.height*.68))}});
   await page.locator('.v4-map-selected').waitFor({timeout:4000});
   const name=await page.locator('.v4-map-selected input').inputValue();
   assert.ok(name.length>=1,'map click sets location name');
   assert.ok((await page.locator('.v4-map-selected small').innerText()).includes('°'),
    'custom map click fills valid coordinates');
   await page.goto(origin+'/design-review-v4/ai',{waitUntil:'load'});
   await page.locator('.v4-chat-message').first().waitFor();
   const chatScroll=await page.locator('.v4-chat-history').evaluate(el=>el.scrollTop);
   assert.equal(chatScroll,0,'AI demo must not start scrolled past first message');
   await page.goto(origin+'/design-review-v4/trip',{waitUntil:'load'});
   await page.getByText('Аяллын мэдээлэл засах').first().click();
   await page.locator('select[name="cover"]').first().selectOption('custom');
   assert.equal(await page.locator('input[name="coverLabel"]').first().isVisible(),true,
    'Existing trip can switch to arbitrary destination / custom cover');
   await page.getByText('Зогсоол нэмэх').first().click();
   await page.locator('.v4-place-picker').first().waitFor();
   await page.locator('.v4-place-picker select[name="destination"]').first().selectOption('custom');
   await page.locator('.v4-custom-fields input[name="customName"]').first().fill('Өөрийн сонгосон газар');
   await page.locator('.v4-custom-fields input[name="lat"]').first().fill('49.123456');
   await page.locator('.v4-custom-fields input[name="lon"]').first().fill('104.123456');
   assert.equal(await page.locator('.v4-custom-fields input[name="customName"]').first().inputValue(),
    'Өөрийн сонгосон газар','Trip stop editor accepts arbitrary place');
  }
  // Public safety: accounts and private APIs must not allow anonymous mutation.
  await page.goto(origin+'/explore',{waitUntil:'load'});
  await page.getByRole('button',{name:'Байгаль',exact:true}).last().click();
  assert.equal(await page.getByRole('button',{name:'Байгаль',exact:true}).last().getAttribute('aria-pressed'),'true',
    'Editorial category filter should be interactive');
  const favorites=await page.evaluate(async()=>{
    const list=await fetch('/api/favorites');
    const data=await list.json();
    const mutate=await fetch('/api/favorites',{method:'POST',
      headers:{'Content-Type':'application/json'},body:JSON.stringify({id:'khuvsgul',favorite:true})});
    const ai=await fetch('/api/ai/status');
    const state=await ai.json();
    return {authenticated:data.authenticated,ids:data.ids,mutationStatus:mutate.status,
      aiAuthenticated:state.authenticated};
  });
  assert.equal(favorites.authenticated,false,'Guest favorites should not imply a logged-in account');
  assert.equal(favorites.mutationStatus,401,'Guest must never write favorites');
  assert.equal(favorites.aiAuthenticated,false,'Guest must not receive private AI quota data');
  const exportRes=await page.request.get(origin+'/api/trips/khuvsgul-demo/export?format=gpx');
  assert.equal(exportRes.status(),401,'Trip GPX/CSV/ICS exports reject unauthenticated visitors');
  await page.goto(origin+'/design-review-v4/journal',{waitUntil:'load'});
  assert.ok(await page.locator('.v3-scrapbook-chapter').count()>=1,'Real journal entries should render');
  await page.goto(origin+'/design-review-v4/budget',{waitUntil:'load'});
  assert.ok(await page.locator('.v3-donut').count()===1,'Budget distribution must render from actual sample expenses');
  assert.deepEqual(errors,[],'JavaScript runtime errors in public flows');
  console.log('Wanderly V4 browser: 6 responsive sizes, routes, map click, AI first message, custom trip editor OK');
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
