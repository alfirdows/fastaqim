"""Word-by-word data for the Qur'an ayat used in the adhkar reader (Arabic word, transliteration, English meaning).
Source: Quran.com API v4 (the same data Quran.com shows). Writes data/adhkar/qwords.json:
{"2:255": {"w": [["ٱللَّهُ","Allahu","Allah"], ...]}, ...}"""
import json,urllib.request,time
KEYS=['1:%d'%i for i in range(1,8)]+['2:255','2:285','2:286','3:173','21:87']+['112:%d'%i for i in range(1,5)]+['113:%d'%i for i in range(1,6)]+['114:%d'%i for i in range(1,7)]
out={}
for k in KEYS:
    u=f'https://api.quran.com/api/v4/verses/by_key/{k}?words=true&word_fields=text_uthmani&language=en'
    for t in range(5):
        try:
            d=json.load(urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=30));break
        except Exception as e:
            print('retry',k,e);time.sleep(3)
    w=[[x['text_uthmani'],(x.get('transliteration') or {}).get('text') or '',(x.get('translation') or {}).get('text') or ''] for x in d['verse']['words'] if x['char_type_name']=='word']
    out[k]={'w':w};print(k,len(w),' '.join(x[1] for x in w)[:90])
json.dump(out,open('data/adhkar/qwords.json','w'),ensure_ascii=False,separators=(',',':'))
