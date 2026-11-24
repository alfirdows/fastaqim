"""Build data/hisn/lib.json for the reader from data/hisn/source.json (chapters, counts) + data/hisn/sunnah.json (sunnah.com/hisn text and the book's reference notes).
Only adhkar whose reference shows al-Bukhari, Muslim, the Qur'an, or a sahih/hasan grading are kept; anything graded weak or with no clear grading is left out.
Qur'an-only adhkar get their ayah keys (shown in the mushaf text with Saad al-Ghamdi's recitation). Writes data/hisn/qkeys.json too."""
import json,re
src=json.load(open('data/hisn/source.json'));sun=json.load(open('data/hisn/sunnah.json'))
GOOD=re.compile(r"Bukh[aā]r[iī]|\bMuslim\b\s*[\d(,]|\bMuslim\s+\d|Muslim,|Al-Qur'?an|Qur'an\s*\d|authentic|[Ss]a[hḥ][iī][hḥ]|[Hh]asan|[Jj]ayyid|good chain|sound chain",re.I)
BAD=re.compile(r"weak|da['`’]?[iī]f|da['`’]?eef|fabricat|munkar",re.I)
QREF=re.compile(r"(?:Qur'?an|Surah?)[^0-9]{0,30}(\d{1,3})\s*:\s*(\d{1,3})(?:\s*[-–]\s*(\d{1,3}))?",re.I)
QULS=['112:1','112:2','112:3','112:4','|','113:1','113:2','113:3','113:4','113:5','|','114:1','114:2','114:3','114:4','114:5','114:6']
# adhkar that are only Qur'an recitation: shown in the Madinah-mushaf text with Saad al-Ghamdi's recitation
QMAP={75:['2:255'],71:['2:255'],76:QULS,99:QULS,70:QULS,101:['2:285','2:286'],4:['3:%d'%i for i in range(190,201)]}
cats=[];keep=drop=0;qkeys=set();dropped=[]
def car(t):
    t=t.replace('\u0640','')                      # tatweel (stretch line) is only typography
    t=re.sub(r'(^|\s)[\u064B-\u0652\u0670]+',r'\1',t)   # a stray vowel mark with no letter (typo in the source) would show as a dotted circle
    t=re.sub(r'\s+([،,.؛:])',r'\1',t)             # no space before punctuation
    t=re.sub(r'\s*[(（][^()]*(?:مر[ّ]?[اةت]|مرة|ثلاث|سبع|عشر|مائة|مئة|حين|إذا|يصبح|يمسي)[^()]*[)）]\s*\.?\s*$','',t.strip())  # the book's "(say it 3 times)" note: the counter shows it
    return re.sub(r'[ \t]+',' ',t).strip()
def cen(t):
    return re.sub(r'(?<=[A-Za-z,.;:!?\'"])\s?\d{1,2}(?=[\s,.;:]|$)','',t)   # footnote numbers
def short(t,n=7):
    w=re.sub(r'\s+',' ',t).strip().split(' ');return ' '.join(w[:n])+(' …' if len(w)>n else '')
for c in src:
    items=[]
    for it in c['items']:
        n=it['n'];s=sun.get(str(n)) or {}
        refs=' '.join(s.get('refs') or [])
        en=' '.join(s.get('en') or [])or (it.get('en') or '')
        ar='\n'.join(s.get('ar') or []) or it['ar']
        tr=' '.join(s.get('tr') or []) or (it.get('tr') or '')
        ok=bool(GOOD.search(refs)) and not BAD.search(refs)
        if not ok:
            drop+=1;dropped.append([n,refs[:160]]);continue
        keep+=1
        en=cen(en);ar=car(ar)
        o={'n':n,'ar':ar.strip(),'en':en.strip(),'tr':tr.strip(),'c':it.get('count') or 1,'ref':re.sub(r'\s+',' ',refs).strip()[:420],'ti':[short(en),short(re.sub(r'[()﴿﴾]','',ar),5)]}
        if n in QMAP:o['qk']=QMAP[n];qkeys.update(k for k in QMAP[n] if k!='|')
        items.append(o)
    if items:cats.append({'id':c['id'],'en':c['en'][:1].upper()+c['en'][1:],'ar':c['ar'],'items':items})
cats.sort(key=lambda c:min(i['n'] for i in c['items']))
json.dump({'cats':cats},open('data/hisn/lib.json','w'),ensure_ascii=False,separators=(',',':'))
json.dump(sorted(qkeys,key=lambda k:tuple(map(int,k.split(':')))),open('data/hisn/qkeys.json','w'))
json.dump(dropped,open('data/hisn/left-out.json','w'),ensure_ascii=False,indent=0)
print('chapters',len(cats),'kept',keep,'left out',drop,'quran keys',len(qkeys))
