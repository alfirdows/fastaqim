# Transcribe the Hisn al-Muslim section recordings (hisn/*.m4a) with word timestamps,
# so each dhikr can be cut into its own clip. Prints segments to the log and writes JSON.
import json,sys,os
from faster_whisper import WhisperModel
m=WhisperModel(os.environ.get('MODEL','large-v3'),device='cpu',compute_type='int8')
out={}
for f in ['waking','after-salah','istikhara','morning-evening','sleep']:
    segs,_=m.transcribe(f'hisn/{f}.m4a',language='ar',word_timestamps=True,vad_filter=False,beam_size=5,condition_on_previous_text=False)
    rows=[]
    print(f'===== {f}',flush=True)
    for s in segs:
        rows.append({'s':round(s.start,2),'e':round(s.end,2),'t':s.text.strip(),'w':[[round(w.start,2),round(w.end,2),w.word.strip()] for w in (s.words or [])]})
        print(f'{s.start:7.2f} {s.end:7.2f} | {s.text.strip()}',flush=True)
    out[f]=rows
os.makedirs('tools/hisn/out',exist_ok=True)
json.dump(out,open('tools/hisn/out/transcript.json','w'),ensure_ascii=False,indent=0)
print('WORDS_JSON_BEGIN');print(json.dumps(out,ensure_ascii=False));print('WORDS_JSON_END')
# rerun
