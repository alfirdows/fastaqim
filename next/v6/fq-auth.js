/* Fastaqim sign-in, shared by the v6 preview and the compare view.
   Same Supabase project and the same saved session as the full app, so signing in once on this site covers all pages.
   Google uses Google's own button (shows alfirdows.github.io); email + password is the backup. */
(function(){
const SUPA={url:'https://xnxqibdjjrgjqpszvdbe.supabase.co',key:'sb_publishable_FEdG6lWjiGjEhwXEpUw77Q_YxFohEId'};
const GCID='877677669475-c5q3mmae9mekj60oj6igittia1gohjeu.apps.googleusercontent.com';
const REMST={getItem:k=>{try{return localStorage.getItem(k)??sessionStorage.getItem(k)}catch(e){return null}},
  setItem:(k,v)=>{try{const rem=localStorage.getItem('fastaqim.rem')!=='0';(rem?localStorage:sessionStorage).setItem(k,v);(rem?sessionStorage:localStorage).removeItem(k)}catch(e){}},
  removeItem:k=>{try{localStorage.removeItem(k);sessionStorage.removeItem(k)}catch(e){}}};
const load=src=>new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=no;document.head.appendChild(s)});
let SB=null,USER=null;const subs=[];
async function sb(){if(SB)return SB;if(!window.supabase)await load('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
  SB=window.supabase.createClient(SUPA.url,SUPA.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storage:REMST}});
  try{const {data}=await SB.auth.getSession();USER=data&&data.session?data.session.user:null}catch(e){USER=null}
  SB.auth.onAuthStateChange((ev,ses)=>{const u=ses?ses.user:null;const changed=(u&&u.id)!==(USER&&USER.id);USER=u;if(changed)subs.forEach(f=>{try{f(USER)}catch(e){}})});
  return SB}
async function nonce(){const a=new Uint8Array(16);crypto.getRandomValues(a);const raw=[...a].map(b=>b.toString(16).padStart(2,'0')).join('');
  const h=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(raw));return{raw,hashed:[...new Uint8Array(h)].map(b=>b.toString(16).padStart(2,'0')).join('')}}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/* t: {key:text} labels in the page's language */
async function mount(box,t,done){t=Object.assign({google:'Continue with Google',or:'or with email',email:'Email',pw:'Password',in:'Sign in',up:'Create account',forgot:'Forgot password?',
  wrong:'Email or password is wrong.',check:'Check your email to finish.',typeEmail:'Type your email first.',busy:'One moment…',noG:'Google sign-in could not load. Use email, or check your internet.'},t||{});
  box.innerHTML=`<div class="fqa"><div class="fqa-g"></div><p class="fqa-or"><span>${esc(t.or)}</span></p>
  <label class="fqa-l">${esc(t.email)}<input type="email" autocomplete="email" inputmode="email" class="fqa-e"></label>
  <label class="fqa-l">${esc(t.pw)}<input type="password" autocomplete="current-password" class="fqa-p"></label>
  <div class="fqa-b"><button type="button" class="fqa-in">${esc(t.in)}</button><button type="button" class="fqa-up">${esc(t.up)}</button></div>
  <button type="button" class="fqa-f">${esc(t.forgot)}</button><p class="fqa-m" aria-live="polite"></p></div>`;
  const q=s=>box.querySelector(s),say=m=>{q('.fqa-m').textContent=m||''};
  const c=await sb();const fin=()=>{if(done)done(USER)};
  const creds=()=>{const email=q('.fqa-e').value.trim(),password=q('.fqa-p').value;if(!email||!password){say(t.typeEmail);return null}return{email,password}};
  q('.fqa-in').onclick=async()=>{const cr=creds();if(!cr)return;say(t.busy);const {data,error}=await c.auth.signInWithPassword(cr);if(error){say(/Invalid/i.test(error.message)?t.wrong:error.message);return}USER=data.user;say('');fin()};
  q('.fqa-up').onclick=async()=>{const cr=creds();if(!cr)return;say(t.busy);const {data,error}=await c.auth.signUp({...cr,options:{emailRedirectTo:location.origin+'/fastaqim/'}});if(error){say(error.message);return}if(data.session){USER=data.user;fin()}else say(t.check)};
  q('.fqa-f').onclick=async()=>{const email=q('.fqa-e').value.trim();if(!email){say(t.typeEmail);return}const {error}=await c.auth.resetPasswordForEmail(email,{redirectTo:location.origin+'/fastaqim/'});say(error?error.message:t.check)};
  try{if(!(window.google&&google.accounts&&google.accounts.id))await load('https://accounts.google.com/gsi/client');const n=await nonce();
    google.accounts.id.initialize({client_id:GCID,nonce:n.hashed,ux_mode:'popup',itp_support:true,context:'signin',callback:async r=>{say(t.busy);const {data,error}=await c.auth.signInWithIdToken({provider:'google',token:r.credential,nonce:n.raw});if(error){say(error.message);return}USER=data.user;say('');fin()}});
    const g=q('.fqa-g');google.accounts.id.renderButton(g,{type:'standard',theme:'outline',size:'large',text:'continue_with',shape:'pill',logo_alignment:'center',width:Math.min(360,Math.max(220,(g.offsetWidth||300))),locale:document.documentElement.lang||'en'})}
  catch(e){q('.fqa-g').innerHTML=`<p class="fqa-m">${esc(t.noG)}</p>`}}
async function signOut(){const c=await sb();await c.auth.signOut();USER=null;subs.forEach(f=>{try{f(null)}catch(e){}})}
window.FQA={sb,mount,signOut,user:()=>USER,on:f=>subs.push(f)};
})();
