const pw=require('playwright');const devices=pw.devices;const chromium=pw[process.env.ENGINE||'chromium'];const fs=require('fs'),path=require('path');
const ROOT=process.env.ROOT||'/home/user/fastaqim';const MT={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.otf':'font/otf','.mp3':'audio/mpeg'};
const OUT=process.argv[2]||'flow';fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch();const c=await b.newContext({...devices[process.env.DEV||'iPhone 13'],deviceScaleFactor:+(process.env.DSF||1)});
 await c.route('**/*',r=>{const u0=new URL(r.request().url());if(u0.host!=='fq.test')return r.abort();let u=u0.pathname;if(u.endsWith('/'))u+='index.html';const f=path.join(ROOT,decodeURIComponent(u));if(fs.existsSync(f))r.fulfill({body:fs.readFileSync(f),contentType:MT[path.extname(f)]||'application/octet-stream'});else r.fulfill({status:404,body:''})});
 const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 const L=process.env.LANGQ||'';
 await p.goto('http://fq.test/next/v6/'+L+'#home');await p.waitForTimeout(700);
 const ok=(n,v)=>console.log((v?'PASS ':'FAIL ')+n);const snap=async n=>p.screenshot({path:OUT+'/'+n+'.png'});
 // Today's path expand
 await p.click('#ciH');await p.waitForTimeout(300);ok('path expands',await p.$eval('#ci',e=>e.classList.contains('open')));await p.click('#ciH');
 // pin chip opens tool
 await p.click('#pins [data-tool="water"]');await p.waitForTimeout(400);ok('water opens',await p.isVisible('#cPlus'));
 for(let i=0;i<8;i++){await p.click('#cPlus');await p.waitForTimeout(60)}await p.waitForTimeout(500);ok('water goal celebration',await p.$eval('#cel',e=>e.classList.contains('on')));await snap('1_water_goal');await p.click('#celX');
 await p.click('[data-back]:visible');await p.waitForTimeout(300);ok('back to home',await p.isVisible('#s-home'));
 ok('pin shows 8 of 8',(await p.textContent('#pins')).includes('8'));
 // tools
 await p.click('#pins .add');await p.waitForTimeout(400);ok('tools opens',await p.isVisible('#tlg'));await snap('2_tools');
 await p.click('[data-pin="habits"]');await p.waitForTimeout(200);ok('4th pin blocked',(await p.textContent('#toast')).includes('3'));
 await p.click('[data-pin="saved"]');await p.click('[data-pin="habits"]');await p.waitForTimeout(200);ok('pin swap',await p.$eval('[data-pin="habits"]',e=>e.classList.contains('on')));
 // new list
 await p.click('#tlNew');await p.waitForTimeout(400);await p.fill('#lsN','Gift ideas');await p.click('[data-ic="gift"]');await snap('3_new_list');await p.click('#lsOk');await p.waitForTimeout(500);
 ok('custom list opened',(await p.textContent('#toT'))==='Gift ideas');
 await p.click('#toAdd');await p.waitForTimeout(350);await p.fill('#isT','Book for Muaz');await p.fill('#isN','Tafsir as-Sadi, volume 1\nhttps://example.com');await p.click('#isOk');await p.waitForTimeout(350);
 ok('item added',(await p.textContent('#toB')).includes('Book for Muaz'));await snap('4_list_item');
 await p.click('#toB [data-i="0"]');await p.waitForTimeout(350);await p.click('#isDel');await p.waitForTimeout(300);ok('item deleted',!(await p.textContent('#toB')).includes('Book for Muaz'));
 await snap('5_undo');await p.click('#utoast button');await p.waitForTimeout(300);ok('undo restores',(await p.textContent('#toB')).includes('Book for Muaz'));
 // rename
 await p.click('#toEd');await p.waitForTimeout(350);await p.fill('#lsN','Gifts');await p.click('#lsOk');await p.waitForTimeout(300);ok('rename',(await p.textContent('#toT'))==='Gifts');
 await p.click('[data-back]:visible');await p.waitForTimeout(300);ok('back to tools',await p.isVisible('#tlg'));
 // money
 await p.click('#tlg [data-tool="money"]');await p.waitForTimeout(300);await p.click('#mBud');await p.waitForTimeout(300);await p.fill('#bA','120');await p.click('#bOk');await p.waitForTimeout(300);
 await p.click('#toAdd');await p.waitForTimeout(300);await p.fill('#isT','Groceries');await p.fill('#isA','42.50');await p.click('#isOk');await p.waitForTimeout(300);
 ok('money left 77.5',(await p.textContent('.mcard')).includes('77.5'));await snap('6_money');
 await p.click('[data-back]:visible');await p.waitForTimeout(250);
 // habits
 // Habits opens its own screen (Life & family: build + leave)
 await p.click('#tlg [data-tool="habits"]');await p.waitForTimeout(300);await p.click('#hbAdd');await p.waitForTimeout(300);await p.fill('#hsT','Walk after Asr');await p.click('#hsOk');await p.waitForTimeout(300);
 await p.click('#hbB [data-hd]');await p.waitForTimeout(300);ok('habit ticked',await p.$eval('#hbB .hb',e=>e.classList.contains('on')));await snap('7_habits');
 await p.click('[data-back]:visible');await p.waitForTimeout(250);await p.click('[data-back]:visible');await p.waitForTimeout(250);
 // persistence: reload
 await p.goto('http://fq.test/next/v6/'+L+'#home');await p.waitForTimeout(600);const pt=await p.textContent('#pins');ok('pins persist after reload',pt.includes('Habits')||pt.includes('العادات'));await snap('8_home_after');
 // tasbih badge + reset undo
 await p.click('[data-tab="dhikr"]');await p.waitForTimeout(300);await p.click('#tsbBtn');await p.waitForTimeout(400);for(let i=0;i<5;i++){await p.click('#tsbTap');await p.waitForTimeout(40)}
 ok('dhikr tab badge',(await p.textContent('#tab .tbd'))==='5'||(await p.textContent('#tab .tbd'))==='٥');
 await p.click('#tsb0');await p.waitForTimeout(250);await p.click('#utoast button');await p.waitForTimeout(250);ok('reset undo',['5','٥'].includes((await p.textContent('#tsbTap')).trim()));await snap('9_tasbih');
 console.log('errors:',errs.join(' | ')||'none');await b.close()})()
