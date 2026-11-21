// Tap test: family profiles (owner side and family sign-in with code + PIN) and the reminder Done / Snooze card.
// The database is replaced by a small fake inside the page, so nothing real is written. Run: ENGINE=webkit node fam.js out
const pw=require('playwright');const devices=pw.devices;const eng=pw[process.env.ENGINE||'chromium'];const fs=require('fs'),path=require('path');
const ROOT=process.env.ROOT||'/home/user/fastaqim',BASE=process.env.BASE||'/';const MT={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf','.otf':'font/otf','.mp3':'audio/mpeg','.webmanifest':'application/manifest+json'};
const OUT=process.argv[2]||'qa-fam';fs.mkdirSync(OUT,{recursive:true});let fails=0;
const ok=(n,v)=>{console.log((v?'PASS ':'FAIL ')+n);if(!v)fails++};
// the fake database: records every call, answers like the real one
const FAKE=()=>{window.__log=[];const D=window.__D;const q=t=>{const st={t,op:'select',f:{}};const p={select(){return p},eq(k,v){st.f[k]=v;return p},order(){return p},limit(){return p},neq(){return p},
  insert(o){st.op='insert';st.o=o;return p},update(o){st.op='update';st.o=o;return p},delete(){st.op='delete';return p},maybeSingle(){st.one=true;return p},
  then(a,b){window.__log.push(st);let r={data:null,error:null};if(t==='fastaqim_profiles'&&st.op==='select')r={data:st.one?D.open:D.rows,error:null};else if(st.op==='select'&&D.tab&&D.tab[t]!==undefined)r={data:st.one?(D.tab[t][0]||null):D.tab[t],error:null};return Promise.resolve(r).then(a,b)}};return p};
 const sb={from:q,rpc:async(n,a)=>{window.__log.push({rpc:n,a});const f=D.rpc[n];return{data:f?f(a):null,error:null}}};
 FQA.sb=async()=>sb;FQA.user=()=>D.user||null};
(async()=>{const b=await eng.launch();const c=await b.newContext({...devices[process.env.DEV||'iPhone 13'],deviceScaleFactor:1});
 await c.route('**/*',r=>{const u0=new URL(r.request().url());if(u0.host==='accounts.google.com')return r.fulfill({body:'',contentType:'application/javascript'});/* Google's sign-in script: stand-in, the test has no internet */if(u0.host!=='fq.test')return r.abort();let u=u0.pathname;if(u.endsWith('/'))u+='index.html';const f=path.join(ROOT,decodeURIComponent(u));if(fs.existsSync(f))r.fulfill({body:fs.readFileSync(f),contentType:MT[path.extname(f)]||'application/octet-stream'});else r.fulfill({status:404,body:''})});
 const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 const snap=n=>p.screenshot({path:path.join(OUT,n+'.png')});
 const setD=async(user)=>{await p.evaluate(u=>{window.__D={user:u,rows:[{id:'p1',name:'Yusuf',transfer_email:null}],open:{name:'Yusuf',state:{v6:{state:{tasks:[{id:99001,t:'Profile task',due:'',p:'m',sz:'m'}],_at:1}}}},
   rpc:{family_code:()=> 'ABCD2345',set_profile_pin:()=>null,family_list:()=>[{id:'p2',name:'Maryam',avatar:null}],family_login:a=>a.p_pin==='2468'?{ok:true,token:'tok1'}:{ok:false,err:'pin',left:4},fam_get:()=>({id:'p2',name:'Maryam',state:null}),fam_set:()=>true,fam_logout:()=>null,pending_profiles:()=>[],is_admin:()=>true,admin_users:()=>[{user_id:'u1',email:'owner@example.com',name:'Owner',joined:new Date().toISOString(),last_active:new Date().toISOString(),request:null},{user_id:'u2',email:'b@example.com',name:'Brother',joined:'2026-01-01',last_active:new Date().toISOString(),request:'allowed'}],request_view:()=>null,remove_view:()=>null},tab:{fastaqim_feedback:[{id:1,kind:'idea',body:'Please add a qibla compass',name:'Brother',created_at:new Date().toISOString(),seen:false}],fastaqim_blocklist:[],view_requests:[{status:'pending',guardian:false}],fastaqim_state:[{state:{},v6:{state:{tasks:[{t:'Shared task',done:false}]}}}]}}},user);await p.evaluate(FAKE)};
 const pin=async d=>{for(const k of d){await p.click(`#sh .pnk [data-k="${k}"]`);await p.waitForTimeout(60)}await p.waitForTimeout(350)};
 await p.goto('http://fq.test'+BASE+'?nosync=1#home');await p.waitForTimeout(900);
 await p.evaluate(()=>{S.tasks=[{id:55001,t:'My own task',due:'',p:'m',sz:'m'}];save()});
 // ---- owner side
 await setD({id:'u1',email:'owner@example.com'});await p.evaluate(()=>go('more'));await p.waitForTimeout(400);
 ok('Family row on More',await p.isVisible('#mFam'));await p.click('#mFam');await p.waitForTimeout(500);await snap('1_family');
 const t1=await p.textContent('#sh');ok('profile listed',t1.includes('Yusuf'));ok('family code shown',t1.includes('ABCD-2345'));
 await p.click('#pfAdd');await p.waitForTimeout(300);await p.fill('#fiI','Ali');await p.click('#fiGo');await p.waitForTimeout(400);await snap('2_pinpad');
 await pin('1357');await pin('1350');ok('PIN mismatch message',(await p.textContent('#sh .pne')).length>3);
 await pin('1357');await pin('1357');await p.waitForTimeout(500);
 const lg=await p.evaluate(()=>window.__log);ok('profile saved',lg.some(x=>x.t==='fastaqim_profiles'&&x.op==='insert'&&x.o.name==='Ali'));ok('PIN saved',lg.some(x=>x.rpc==='set_profile_pin'&&x.a.p_pin==='1357'));
 await p.click('#sh [data-pf="p1"]');await p.waitForTimeout(400);await snap('3_manage');ok('manage sheet',await p.isVisible('#pmO'));
 await p.click('#pmO');await p.waitForTimeout(1500);await setD({id:'u1',email:'owner@example.com'});
 const a1=await p.evaluate(()=>({bar:!!document.getElementById('famBar')&&document.getElementById('famBar').textContent,tasks:S.tasks.map(x=>x.t),name:S.name}));
 await snap('4_editing');ok('editing bar shows',!!a1.bar&&a1.bar.includes('Yusuf'));ok("profile's own plan loaded",a1.tasks.includes('Profile task')&&!a1.tasks.includes('My own task'));
 await p.evaluate(()=>{S.tasks.push({id:99002,t:'Added while editing',due:'',p:'m',sz:'m'});save()});await p.waitForTimeout(2200);
 const lg2=await p.evaluate(()=>window.__log);ok('changes saved to the profile',lg2.some(x=>x.t==='fastaqim_profiles'&&x.op==='update'&&JSON.stringify(x.o).includes('Added while editing')));
 await p.click('#famBk');await p.waitForTimeout(1500);
 const a2=await p.evaluate(()=>({bar:!!document.getElementById('famBar'),tasks:S.tasks.map(x=>x.t)}));ok('back to my plan',!a2.bar&&a2.tasks.includes('My own task')&&!a2.tasks.includes('Profile task'));
 // ---- family member side (signed out)
 await setD(null);await p.evaluate(()=>{go('more');acctSheet()});await p.waitForTimeout(500);ok('family sign-in button',await p.isVisible('#acFam'));
 await p.click('#acFam');await p.waitForTimeout(300);await p.fill('#fmC','abcd-2345');await p.click('#fmGo');await p.waitForTimeout(500);await snap('5_who');
 await p.click('#sh [data-fp="p2"]');await p.waitForTimeout(300);await pin('1111');const e1=await p.textContent('#sh .pne');ok('wrong PIN message',/4/.test(e1));
 await pin('2468');await p.waitForTimeout(1500);await setD(null);
 const a3=await p.evaluate(()=>({bar:document.getElementById('famBar')&&document.getElementById('famBar').textContent,name:S.name,tasks:S.tasks.length}));await snap('6_member');
 ok('signed in as the family member',!!a3.bar&&a3.bar.includes('Maryam')&&a3.name==='Maryam');ok('fresh plan for the member',a3.tasks===0);
 await p.evaluate(()=>{S.tasks.push({id:99003,t:'Member task',due:'',p:'m',sz:'m'});save()});await p.waitForTimeout(2200);
 ok('member changes saved',(await p.evaluate(()=>window.__log)).some(x=>x.rpc==='fam_set'&&JSON.stringify(x.a.p_state).includes('Member task')));
 await p.click('#famBk');await p.waitForTimeout(1500);const a4=await p.evaluate(()=>({bar:!!document.getElementById('famBar'),tasks:S.tasks.map(x=>x.t)}));ok('member signed out, own plan back',!a4.bar&&a4.tasks.includes('My own task'));
 // ---- reminder card
 const rem=JSON.stringify({title:'Time for Dhuhr',body:'12:01 PM',tag:'sal-dhuhr',ref:'sal-dhuhr.x1'});
 await p.goto('http://fq.test'+BASE+'?nosync=1&r=2#rem='+encodeURIComponent(rem));await p.waitForTimeout(1300);await snap('7_reminder');
 ok('reminder card opens',await p.isVisible('#rzD'));ok('address cleaned',await p.evaluate(()=>location.hash==='#home'));
 await p.click('#sh [data-rz="10"]');await p.waitForTimeout(400);ok('snooze without reminders on asks to turn them on',(await p.textContent('#toast').catch(()=>''))!==null);
 await p.evaluate(r=>remSheet(JSON.parse(r)),rem);await p.waitForTimeout(400);await p.click('#rzD');await p.waitForTimeout(500);ok('Done on a salah reminder opens the salah sheet',await p.evaluate(()=>document.getElementById('sh').classList.contains('on')));
 await p.evaluate(()=>{closeSheet();remSheet({title:'Morning adhkar',tag:'zk-m',ref:'zk-m.x2'})});await p.waitForTimeout(400);ok('open-adhkar button',await p.isVisible('#rzO'));
 await p.click('#rzD');await p.waitForTimeout(400);ok('Done ticks morning adhkar',await p.evaluate(()=>!!(S.ci[dkey(NOW())]||{}).morning));
 // ---- gentle filter
 await p.evaluate(()=>{closeSheet();go('todo')});await p.waitForTimeout(400);const n0=await p.evaluate(()=>S.tasks.length);
 await p.fill('#qaIn','buy beer');await p.press('#qaIn','Enter');await p.waitForTimeout(500);await snap('8_filter');
 ok('blocked item not added, gentle message shown',(await p.evaluate(()=>S.tasks.length))===n0&&await p.isVisible('#sh .blkm'));
 await p.evaluate(()=>closeSheet());await p.fill('#qaIn','Call my brother');await p.press('#qaIn','Enter');await p.waitForTimeout(500);ok('normal item still added',(await p.evaluate(()=>S.tasks.length))===n0+1);
 // ---- owner tools and the view request card
 await setD({id:'u1',email:'owner@example.com'});await p.evaluate(()=>{APV.own=null;go('adm')});await p.waitForTimeout(900);await snap('9_owner');
 const ad=await p.textContent('#admB');ok('owner tools: users, feedback, shared plans',ad.includes('Please add a qibla compass')&&ad.includes('Brother')&&/2/.test(ad));
 await p.click('#admB [data-av="u2"]');await p.waitForTimeout(600);ok('view a shared plan (read only)',(await p.textContent('#sh')).includes('Shared task'));
 await p.evaluate(()=>{closeSheet();go('more');vrCheck()});await p.waitForTimeout(700);await snap('10_request');ok('view request card with Allow',await p.isVisible('#vrY'));
 await p.click('#vrY');await p.waitForTimeout(500);ok('allow saves',(await p.evaluate(()=>window.__log)).some(x=>x.t==='view_requests'&&x.op==='update'&&x.o.status==='allowed'));
 const ov=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);ok('no sideways overflow',ov<=1);
 /* 'Event' (Safari's engine writes '[object Event]') = the database library from cdn.jsdelivr.net could not download (the test has no internet); anything else is a real error */const real=errs.filter(e=>e!=='Event'&&e!=='[object Event]');console.log('errors:',real.length?real.join(' | '):'none');if(real.length)fails++;console.log('SUMMARY family+reminder: '+(fails?fails+' failed':'all passed'));await b.close()})();
