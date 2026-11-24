"""Transcribe every adhkar clip (hisn/clips/*.m4a) with word times inside the clip.
Prints first/last words (so narration like "ويقول" or "ثلاث مرات" left at either end shows up)
and writes data/adhkar/clipwords.json: {"clip-name": [[start_s, end_s, "word"], ...]} for the word highlight."""
import glob,os,json
from faster_whisper import WhisperModel
m=WhisperModel(os.environ.get('MODEL','large-v3'),device='cpu',compute_type='int8')
out={}
for f in sorted(glob.glob('hisn/clips/*.m4a')):
    segs,_=m.transcribe(f,language='ar',word_timestamps=True,beam_size=5,condition_on_previous_text=False,vad_filter=False)
    w=[[round(x.start,2),round(x.end,2),x.word.strip()] for s in segs for x in (s.words or [])]
    n=os.path.basename(f)[:-4];out[n]=w
    print(f"CLIP {n} | FIRST: {' '.join(x[2] for x in w[:4])} | LAST: {' '.join(x[2] for x in w[-4:])} | {len(w)} words",flush=True)
    print('   ',' '.join(f"{x[2]}@{x[0]}-{x[1]}" for x in w),flush=True)
json.dump(out,open('data/adhkar/clipwords.json','w'),ensure_ascii=False,separators=(',',':'))
