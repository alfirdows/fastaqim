"""Full Hisn al-Muslim library for the adhkar reader.
Sources (free):
 - Islamic-Pro-azkar-API (MIT): Hisn al-Muslim text (ar, en), counts, categories, and per-dhikr male audio N.mp3 (N = Hisn number 1..267)
 - sunnah.com/hisn:N : each dhikr's reference and grading, so only sahih/hasan ones are shown
Writes data/hisn/raw.json and hisn/a/N.m4a (mono AAC, small)."""
import json,os,re,time,subprocess,urllib.request,html
B='https://raw.githubusercontent.com/YousefAsalya/Islamic-Pro-azkar-API/main/'
UA={'User-Agent':'Mozilla/5.0 (compatible; adhkar-data)'}
def get(u,bin=False,tries=5):
    for t in range(tries):
        try:
            r=urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=60).read()
            return r if bin else r.decode('utf-8','replace')
        except Exception as e:
            print('retry',u,e);time.sleep(3+t*3)
    return None
os.makedirs('data/hisn',exist_ok=True);os.makedirs('hisn/a',exist_ok=True)
ar=json.loads(get(B+'data/ar.json'));en=json.loads(get(B+'data/en.json'))
def clean(h):
    h=re.sub(r'<br\s*/?>','\n',h);h=re.sub(r'<[^>]+>',' ',h);h=html.unescape(h);return re.sub(r'[ \t]+',' ',h).strip()
cats=[]
for ca,ce in zip(ar,en):
    items=[]
    for a,e in zip(ca['array'],ce['array']):
        n=int(a['filename']) if str(a.get('filename','')).isdigit() else None
        items.append({'n':n,'ar':a['text'],'en':e['text'],'tr':e.get('transliteration'),'count':a.get('count') or 1})
    cats.append({'id':ca['id'],'ar':ca['category'],'en':ce['category'],'items':items})
json.dump(cats,open('data/hisn/source.json','w'),ensure_ascii=False,indent=0)
sun={}
nums=sorted({i['n'] for c in cats for i in c['items'] if i['n']})
print('items',len(nums))
for n in nums:
    h=get(f'https://sunnah.com/hisn:{n}')
    if not h: sun[n]={'ok':0};continue
    if n in (1,75,79):open(f'data/hisn/sample{n}.html','w').write(h)
    blk=h
    en_=re.search(r'class="english_hadith_full"(.*?)</div>\s*</div>',blk,re.S)
    ar_=re.search(r'class="arabic_hadith_full[^"]*"(.*?)</div>',blk,re.S)
    ref=re.search(r'class="hadith_reference"(.*?)</table>',blk,re.S)
    gr=re.search(r'class="gradetable"(.*?)</table>',blk,re.S)
    sun[n]={'ok':1,'en':clean(en_.group(1)) if en_ else '','ar':clean(ar_.group(1)) if ar_ else '','ref':clean(ref.group(1)) if ref else '','grade':clean(gr.group(1)) if gr else '','raw':''}
    if n%25==0:print(n,sun[n]['ref'][:120],'|',sun[n]['grade'][:80])
    time.sleep(.4)
json.dump(sun,open('data/hisn/sunnah.json','w'),ensure_ascii=False,indent=0)
for n in nums:
    out=f'hisn/a/{n}.m4a'
    if os.path.exists(out) and os.path.getsize(out)>1000: continue
    if os.path.exists(out): os.remove(out)
    b=get(B+f'audio/{n}.mp3',bin=True)
    if not b: print('no audio',n);continue
    open('/tmp/a.mp3','wb').write(b)
    subprocess.run(['ffmpeg','-v','error','-y','-i','/tmp/a.mp3','-vn','-map','0:a:0','-ac','1','-ar','32000','-c:a','aac','-b:a','40k','-movflags','+faststart',out],check=False)
print('done')
