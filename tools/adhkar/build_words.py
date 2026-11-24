"""Bundle everything the adhkar reader needs into data/adhkar/words.json (one small file, cached offline):
 q: Qur'an words (Quran.com: Arabic, transliteration, English)   h: hadith words (tools/adhkar/hwords.txt, Fastaqim)
 c: clip word times (force-aligned, see cut_more.py)              g: Saad al-Ghamdi word times per ayah (data/wbw/ghamdi)
 dur: length in seconds of every audio file the reader plays."""
import json,os,subprocess,glob
R=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))+'/'
out={'q':{},'h':{},'c':{},'g':{},'dur':{}}
if os.path.exists(R+'data/adhkar/qwords.json'):out['q']=json.load(open(R+'data/adhkar/qwords.json'))
for l in open(R+'tools/adhkar/hwords.txt',encoding='utf8'):
    if l.startswith('#') or not l.strip():continue
    a,t,m=l.rstrip('\n').split('|');out['h'][a]=[t,m]
if os.path.exists(R+'data/adhkar/cutwords.json'):out['c']=json.load(open(R+'data/adhkar/cutwords.json'))
KEYS=['1:%d'%i for i in range(1,8)]+['2:255','2:285','2:286','3:173','21:87']+['112:%d'%i for i in range(1,5)]+['113:%d'%i for i in range(1,6)]+['114:%d'%i for i in range(1,7)]
for k in KEYS:
    s,a=k.split(':');d=json.load(open(R+'data/wbw/ghamdi/%03d.json'%int(s)))
    if a in d:out['g'][k]=d[a]
def dur(f):
    try:return round(float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',R+f],capture_output=True,text=True).stdout.strip()),3)
    except Exception:return 0
for f in sorted(glob.glob(R+'audio/g/*.mp3')+glob.glob(R+'hisn/clips/*.m4a')):
    rel=f[len(R):];out['dur'][rel]=dur(rel)
json.dump(out,open(R+'data/adhkar/words.json','w'),ensure_ascii=False,separators=(',',':'))
print('words.json',len(out['q']),'ayat',len(out['h']),'hadith words',len(out['c']),'clips',len(out['dur']),'files')
