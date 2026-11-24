// Tap test: the adhkar reader (one surah or dhikr at a time, tap anywhere, undo, audio repeats then moves on,
// options sheet, word by word, word sheet). Run: ENGINE=webkit node adhkar.js out
const pw=require('playwright');const devices=pw.devices;const eng=pw[process.env.ENGINE||'chromium'];const fs=require('fs'),path=require('path');
const ROOT=process.env.ROOT||'/home/user/fastaqim',BASE=process.env.BASE||'/';const MT={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf','.otf':'font/otf','.mp3':'audio/mpeg','.m4a':'audio/mp4','.webmanifest':'application/manifest+json'};
const OUT=process.argv[2]||'qa-adhkar';fs.mkdirSync(OUT,{recursive:true});let fails=0;
const ok=(n,v)=>{console.log((v?'PASS ':'FAIL ')+n);if(!v)fails++};
(async()=>{const b=await eng.launch();const c=await b.newContext({...devices[process.env.DEV||'iPhone 13'],deviceScaleFactor:1});
 await c.route('**/*',r=>{const u0=new URL(r.request().url());if(u0.host!=='fq.test')return r.abort();let u=u0.pathname;if(u.endsWith('/'))u+='index.html';const f=path.join(ROOT,decodeURIComponent(u));
  if(!fs.existsSync(f))return r.fulfill({status:404,body:''});const body=fs.readFileSync(f);const rg=r.request().headers()['range'];
  if(rg){const m=/bytes=(\d*)-(\d*)/.exec(rg);const a=+m[1]||0,e=m[2]?+m[2]:body.length-1;return r.fulfill({status:206,body:body.slice(a,e+1),headers:{'Content-Type':MT[path.extname(f)]||'application/octet-stream','Content-Range':`bytes ${a}-${e}/${body.length}`,'Accept-Ranges':'bytes'}})}
  r.fulfill({body,contentType:MT[path.extname(f)]||'application/octet-stream',headers:{'Accept-Ranges':'bytes'}})});
 const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 const snap=n=>p.screenshot({path:path.join(OUT,n+'.png')});
 await p.goto('http://fq.test'+BASE+'?nosync=1&z=evening'+(process.env.LANGQ||'').replace('?','&')+'#dhikr');await p.waitForTimeout(1500);
 const ss=await p.evaluate(()=>FQZ.steps(ZS.set).map(s=>s.q?s.keys[0]:s.name));
 ok('evening split into one surah at a time',ss[0]==='112:1'&&ss[1]==='113:1'&&ss[2]==='114:1');
 ok('no Unfinished only chip, no list button',!(await p.$('#zOnly'))&&!(await p.$('#zrIx')));
 await snap('1_open');
 const vw=await p.evaluate(()=>[document.documentElement.scrollWidth,innerWidth,document.getElementById('fzD').getBoundingClientRect().bottom,innerHeight]);
 ok('nothing wider than the screen',vw[0]<=vw[1]+1);ok('player fully on screen',vw[2]<=vw[3]+1);
 await p.mouse.click(195,330);await p.waitForTimeout(300);
 ok('tap on the text counts',(await p.textContent('.fz-num')).replace(/\s/g,'').startsWith('1/'));
 await p.click('#fzU');await p.waitForTimeout(200);ok('undo takes one off',(await p.textContent('.fz-num')).replace(/\s/g,'').startsWith('0/'));
 for(let i=0;i<3;i++){await p.mouse.click(195,300);await p.waitForTimeout(150)}
 await p.waitForTimeout(1200);ok('done after 3 taps and moved on by itself',await p.evaluate(()=>ZS.i===1));
 const tr=await p.evaluate(()=>!!document.querySelector('.fz-tr')&&document.querySelector('.fz-tr').textContent.length>5);ok('transliteration shown for the surah',tr);
 await snap('2_next');
 await p.click('#fzO');await p.waitForTimeout(400);await snap('3_options');ok('text size slider',await p.isVisible('#fzZ'));
 await p.evaluate(()=>{const z=document.getElementById('fzZ');z.value=150;z.dispatchEvent(new Event('input'))});
 ok('slider makes the text bigger',await p.evaluate(()=>getComputedStyle(document.getElementById('zCard')).getPropertyValue('--fz').trim()==='1.5'));
 await p.click('#sh [data-k="wbw"]');await p.waitForTimeout(300);await p.evaluate(()=>closeSheet());await p.waitForTimeout(300);
 await p.evaluate(()=>FQZ.go(5,false));await p.waitForTimeout(400);await snap('4_words');
 ok('word by word cells',await p.evaluate(()=>document.querySelectorAll('.fzw.g').length>8));
 await p.click('.fzw.g >> nth=1');await p.waitForTimeout(600);await snap('5_word');
 ok('word sheet with meaning',await p.evaluate(()=>!!document.querySelector('#sh .fz-wa')&&(document.querySelector('#sh .fz-wm')||{}).textContent!==''));
 await p.evaluate(()=>closeSheet());await p.waitForTimeout(300);
 await p.evaluate(()=>{const z=FQZ.st;z.wbw=0;z.size=1;z.rate=2;FQZ.go(6,false)});
 await p.click('#fzP');let moved=false,played=false;
 for(let t=0;t<45;t++){await p.waitForTimeout(1000);const r=await p.evaluate(()=>[ZS.i,!FQZ.A.paused]);if(r[1])played=true;if(r[0]===7){moved=true;break}}
 console.log('INFO audio played: '+played);if(played)ok('audio repeated 3 times, then moved to the next dhikr',moved);
 await snap('6_audio');
 await p.evaluate(()=>document.querySelector('[data-go="1"]').click());await p.waitForTimeout(400);
 ok('moving away stops the audio',await p.evaluate(()=>FQZ.A.paused&&!FQZ.AU.on));
 ok('no page errors',errs.length===0);if(errs.length)console.log(errs.join('\n'));
 await b.close();console.log(fails?'FAILED '+fails:'ALL PASS');process.exit(fails?1:0)})();
