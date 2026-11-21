import json,subprocess,re,os,numpy as np
VAR=os.environ.get('VARIANTS')  # set to write 3-second head variants for checking
SHIFT=json.load(open('tools/hisn/shift.json')) if os.path.exists('tools/hisn/shift.json') else {}
ENV={}
def env(f):
  if f not in ENV:
    a=np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i',f'hisn/{f}.m4a','-ac','1','-ar','8000','-f','s16le','-'],capture_output=True).stdout,dtype=np.int16).astype(float)
    ENV[f]=np.array([np.sqrt(np.mean(a[i:i+80]**2)) for i in range(0,len(a)-80,80)])
  return ENV[f]
def quiet(f,lo,hi):
  e=env(f);i0=max(0,int(lo*100));i1=min(len(e)-1,int(hi*100))
  k=np.convolve(e,np.ones(5)/5,mode='same')
  return (i0+int(np.argmin(k[i0:i1+1])))/100
d=json.load(open('tools/hisn/transcript.json'))
def norm(s):return re.sub(r'[ً-ْٰـ]','',s).replace('أ','ا').replace('إ','ا').replace('آ','ا')
def words(f):
  W=[]
  for r in d[f]:W+=r['w']
  return W
# (name, file, t_from, first_word, t_to, last_word or None)
JOBS=[
 ('m-asbahna','morning-evening',29.0,'أصبحنا',62.95,None),
 ('m-bika-asbahna','morning-evening',74.5,'اللهم',83.2,None),
 ('e-bika-amsayna','morning-evening',84.6,'اللهم',92.5,None),
 ('sayyid-istighfar','morning-evening',92.4,'اللهم',115.2,None),
 ('bismillah-la-yadurr','morning-evening',240.4,'بسم',249.6,'العليم'),
 ('subhan-adada','morning-evening',354.5,'سبحان',364.7,'كلماته'),
 ('subhan-wabihamdih','morning-evening',320.8,'سبحان',325.4,'وبحمده'),
 ('astaghfir-atub','morning-evening',377.0,'أستغفر',384.0,'إليه'),
 ('audhu-kalimat','morning-evening',383.9,'أعوذ',390.2,'خلق'),
 ('baqarah-285-286','sleep',46.5,'آمن',126.0,None),
 ('bismika-rabbi','sleep',125.9,'باسمك',140.6,None),
 ('bismika-amutu','sleep',166.8,'باسمك',170.5,'وأحيا'),
 ('subhanallah','sleep',171.5,'سبحان',173.2,'الله'),
 ('alhamdulillah','sleep',175.1,'والحمد',177.2,'لله'),
 ('allahu-akbar','sleep',179.4,'والله',181.3,'أكبر'),
]
for name,f,a,fw,b,lw in JOBS:
  W=[w for w in words(f) if w[0]>=a-0.3 and w[1]<=b+0.6]
  i=next(k for k,w in enumerate(W) if norm(w[2]).strip('،,.')==norm(fw))
  st=W[i][0]
  if lw:
    j=max(k for k,w in enumerate(W) if norm(w[2]).strip('،,.')==norm(lw) and w[0]<b+0.3)
  else: j=max(k for k,w in enumerate(W) if w[1]<=b+0.3)
  en=W[j][1]
  nxt=[w[0] for w in words(f) if w[0]>en+0.05]
  nx=(nxt[0] if nxt else en+0.6)
  s0=quiet(f,max(0,st-0.45),st+0.05)
  e0=quiet(f,en-0.1,min(en+0.6,max(nx+0.15,en+0.1)))+0.03
  s0+=SHIFT.get(name,0)
  if VAR:
    os.makedirs('tools/hisn/variants',exist_ok=True)
    for off in (0,.08,.16,.24,.32,.40):
      subprocess.run(['ffmpeg','-v','error','-y','-ss',f'{s0+off:.2f}','-t','3','-i',f'hisn/{f}.m4a','-ac','1','-c:a','aac','-b:a','64k',f'tools/hisn/variants/{name}__{int(off*100):02d}.m4a'],check=True)
    continue
  print(f"{name:22s} {s0:7.2f}-{e0:7.2f} ({e0-s0:5.1f}s) | {' '.join(w[2] for w in W[i:j+1])[:80]}")
  subprocess.run(['ffmpeg','-v','error','-y','-ss',f'{s0:.2f}','-to',f'{e0:.2f}','-i',f'hisn/{f}.m4a','-af','afade=t=in:d=0.03,areverse,afade=t=in:d=0.08,areverse,adelay=250:all=1','-ac','1','-c:a','aac','-b:a','64k','-movflags','+faststart',f'hisn/clips/{name}.m4a'],check=True)
