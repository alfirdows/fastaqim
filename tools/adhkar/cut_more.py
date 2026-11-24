"""Re-cut every adhkar clip exactly at the dhikr's own first and last word.
The Hisn recording has narration around each dhikr ("ويقول" before, "ثلاث مرات" after). Whisper word times are often
0.3-0.8 s off at those edges, which left bits of narration in some clips. Here each region is force-aligned
(torchaudio MMS_FA, wav2vec2 CTC, CC-BY-NC model weights used only as a tool, nothing shipped) against its own words,
and the cut goes in the middle of the pause between narration and dhikr.
Writes hisn/clips/<name>.m4a and data/adhkar/cutwords.json {name: [[start,end,word],...]} (times inside the clip)."""
import json,subprocess,re,os,numpy as np,torch,torchaudio
import uroman as ur
U=ur.Uroman()
d=json.load(open('tools/hisn/transcript.json'))
def norm(s):return re.sub(r'[ً-ْٰـ،,.]','',s).replace('أ','ا').replace('إ','ا').replace('آ','ا')
def words(f):return [w for r in d[f] for w in r['w']]
# (name, file, about-from, first word, about-to, last word)
JOBS=[
 ('m-asbahna','morning-evening',29.0,'أصبحنا',62.95,'القبر'),
 ('m-bika-asbahna','morning-evening',74.5,'اللهم',83.3,'النشور'),
 ('e-bika-amsayna','morning-evening',84.6,'اللهم',92.5,'المصير'),
 ('sayyid-istighfar','morning-evening',92.4,'اللهم',115.3,'أنت'),
 ('bismillah-la-yadurr','morning-evening',240.4,'بسم',249.7,'العليم'),
 ('subhan-adada','morning-evening',354.5,'سبحان',364.8,'كلماته'),
 ('subhan-wabihamdih','morning-evening',320.8,'سبحان',325.4,'وبحمده'),
 ('astaghfir-atub','morning-evening',377.0,'أستغفر',382.0,'إليه'),
 ('audhu-kalimat','morning-evening',383.9,'أعوذ',390.3,'خلق'),
 ('istiadha','morning-evening',5.0,'أعوذ',9.9,'الرجيم'),
 ('bismika-rabbi','sleep',125.9,'باسمك',140.7,'الصالحين'),
 ('bismika-amutu','sleep',166.8,'باسمك',170.5,'وأحيا'),
 ('subhanallah','sleep',171.5,'سبحان',173.3,'الله'),
 ('alhamdulillah','sleep',175.1,'والحمد',177.3,'لله'),
 ('allahu-akbar','sleep',179.4,'والله',181.4,'أكبر'),
]
B=torchaudio.pipelines.MMS_FA
model=B.get_model(with_star=False).eval();tok=B.get_tokenizer();aligner=B.get_aligner();DIC=B.get_dict()
def rom(w):
  r=U.romanize_string(w).lower();r=''.join(c for c in r if c in DIC and c!='-')
  return r or 'a'
AUD={}
def audio(f):
  if f not in AUD:
    a=subprocess.run(['ffmpeg','-v','error','-i',f'hisn/{f}.m4a','-ac','1','-ar','16000','-f','f32le','-'],capture_output=True).stdout
    AUD[f]=torch.from_numpy(np.frombuffer(a,dtype=np.float32).copy())
  return AUD[f]
out={}
for name,f,a,fw,b,lw in JOBS:
  W=words(f);i=next(k for k,w in enumerate(W) if w[0]>=a-0.4 and norm(w[2])==norm(fw))
  j=max(k for k,w in enumerate(W) if w[1]<=b+0.6 and norm(w[2])==norm(lw))
  i0=max(0,i-1);j1=min(len(W)-1,j+1)             # one narration word on each side
  t0=max(0,W[i0][0]-0.6);t1=W[j1][1]+0.6
  x=audio(f)[int(t0*16000):int(t1*16000)].unsqueeze(0)
  ws=[w[2] for w in W[i0:j1+1]]
  with torch.inference_mode():
    em,_=model(x);em=torch.log_softmax(em,dim=-1)
  spans=aligner(em[0],tok([rom(w) for w in ws]))
  fr=x.shape[1]/em.shape[1]/16000
  T=[(t0+s[0].start*fr,t0+s[-1].end*fr) for s in spans]
  ci,cj=i-i0,j-i0                                  # content word positions inside ws
  pre_end=T[ci-1][1] if ci>0 else T[ci][0]-0.4
  post_st=T[cj+1][0] if cj+1<len(T) else T[cj][1]+0.5
  s0=T[ci][0]-min(0.10,max(0,(T[ci][0]-pre_end)/2))
  e0=T[cj][1]+min(0.30,max(0,(post_st-T[cj][1])/2))
  LEAD=0.12
  subprocess.run(['ffmpeg','-v','error','-y','-ss',f'{s0:.3f}','-to',f'{e0:.3f}','-i',f'hisn/{f}.m4a','-af',f'afade=t=in:d=0.02,areverse,afade=t=in:d=0.06,areverse,adelay={int(LEAD*1000)}:all=1','-ac','1','-c:a','aac','-b:a','64k','-movflags','+faststart',f'hisn/clips/{name}.m4a'],check=True)
  out[name]=[[round(T[k][0]-s0+LEAD,3),round(T[k][1]-s0+LEAD,3),ws[k]] for k in range(ci,cj+1)]
  print(f"{name:20s} cut {s0:8.3f}-{e0:8.3f}  narration before ends {pre_end:8.3f} ({ws[ci-1] if ci>0 else '-'}) | after starts {post_st:8.3f} ({ws[cj+1] if cj+1<len(ws) else '-'})",flush=True)
  print('    ',' '.join(f'{ws[k]}@{T[k][0]:.2f}-{T[k][1]:.2f}' for k in range(len(ws))),flush=True)
os.makedirs('data/adhkar',exist_ok=True)
json.dump(out,open('data/adhkar/cutwords.json','w'),ensure_ascii=False,separators=(',',':'))
