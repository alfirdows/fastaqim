# Run from anywhere: python3 tools/golive.py  (repo root is found from this file's place)
# Makes the main page (root index.html) from next/v6, keeping the old main page as index-before-v6.html
import os,shutil,re
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))+'/';V=R+'next/v6/'
if not os.path.exists(R+'index-before-v6.html'):shutil.copy(R+'index.html',R+'index-before-v6.html')
s=open(V+'index.html',encoding='utf8').read()
def rep(a,b,n=1):
    global s
    c=s.count(a)
    assert c>=n,(a,c);s=s.replace(a,b)
rep("serviceWorker.register('../../sw.js',{scope:'../../'})","serviceWorker.register('sw.js',{updateViaCache:'none'})")
rep("'../../game-next.html?from=v6'","'game-next.html?from=v6'")
rep("'../../audio/g/","'audio/g/")
s=s.replace("'../../'","''").replace('../../','').replace('../design/v/','ph/')
assert '../../' not in s,[m.start() for m in re.finditer(r'\.\./\.\./',s)][:3]
assert '../design' not in s
# Home Screen icon + app name, like the old main page
rep('<meta name="theme-color" content="#fbf9f4">','<meta name="theme-color" content="#fbf9f4">\n<link rel="manifest" href="manifest.webmanifest">\n<link rel="apple-touch-icon" href="icon-180.png">\n<meta name="apple-mobile-web-app-title" content="Fastaqim">')
open(R+'index.html','w',encoding='utf8').write(s)
for f in ['fq-auth.js','life-data.js','life.css','life.js','dhikr-plus.css','sources.html','fq-own.css','fq-own.js','fq-plus.css','fq-plus.js','fq-voice.css','fq-voice.js','fq-night.css','fq-night.js','fq-months.css','fq-months.js','fq-adhkar.css','fq-adhkar.js','fq-why.css','fq-why.js','fq-recite.css','fq-recite.js','fq-cal.css','fq-cal.js','fq-money.css','fq-money.js','fq-nudge.css','fq-nudge.js','fq-cup.css','fq-cup.js']:
    if os.path.exists(V+f):shutil.copy(V+f,R+f)
d=open(V+'dhikr-plus.js',encoding='utf8').read().replace('../../hisn/clips/','hisn/clips/');open(R+'dhikr-plus.js','w',encoding='utf8').write(d)
if os.path.exists(R+'vendor'):shutil.rmtree(R+'vendor')
if os.path.exists(V+'vendor'):shutil.copytree(V+'vendor',R+'vendor')
if os.path.exists(R+'q'):shutil.rmtree(R+'q')
shutil.copytree(V+'q',R+'q')
for p in ['ph-regular','ph-fill','fonts']:
    if os.path.exists(R+'ph/'+p):shutil.rmtree(R+'ph/'+p)
    shutil.copytree(R+'next/design/v/'+p,R+'ph/'+p)
print('ok',len(s))
