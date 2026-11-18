const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');

const origin=process.env.WANDERLY_TEST_URL||'http://127.0.0.1:3100';
const routes=['/','/explore','/map','/login','/design-review-v4/trip'];

async function main(){
 const browser=await chromium.launch({args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  const errors=[];
  page.on('pageerror',err=>errors.push(err.message));
  for(const size of [{width:1440,height:900},{width:390,height:844}]){
   await page.setViewportSize(size);
   for(const route of routes){
    const res=await page.goto(origin+route,{waitUntil:'load',timeout:20000});
    assert.equal(res.status(),200,'Route should open: '+route);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+3);
    assert.equal(overflow,false,'Overflow '+size.width+'px '+route);
   }
   await page.goto(origin+'/map',{waitUntil:'load'});
   await page.locator('.v4-explorer-map.leaflet-container').waitFor({timeout:12000});
   const map=page.locator('.v4-explorer-map.leaflet-container');
   await map.click({position:{x:Math.min(size.width>800?650:180,size.width-30),y:250}});
   await page.locator('.v4-map-selected').waitFor({timeout:4000});
   const name=await page.locator('.v4-map-selected input').inputValue();
   assert.ok(name.length>=1,'map click sets location name');
   assert.ok((await page.locator('.v4-map-selected small').innerText()).includes('°'),
    'custom map click fills valid coordinates');
   await page.goto(origin+'/design-review-v4/trip',{waitUntil:'load'});
   await page.getByText('Зогсоол нэмэх').first().click();
   await page.locator('.v4-place-picker').waitFor();
   await page.locator('.v4-place-picker select[name="destination"]').selectOption('custom');
   await page.locator('.v4-custom-fields input[name="customName"]').fill('Өөрийн сонгосон газар');
   await page.locator('.v4-custom-fields input[name="lat"]').fill('49.123456');
   await page.locator('.v4-custom-fields input[name="lon"]').fill('104.123456');
   assert.equal(await page.locator('.v4-custom-fields input[name="customName"]').inputValue(),
    'Өөрийн сонгосон газар','Trip stop editor accepts arbitrary place');
  }
  assert.deepEqual(errors,[],'JavaScript runtime errors in public flows');
  console.log('Wanderly V4 browser: public pages, mobile layout, custom map pin and trip editor OK');
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
