# Check every cut clip in hisn/clips: transcribe it and print its first and last words,
# so we can see that no narration ("ويقول", "ثلاث مرات") is left at either end.
import glob,os
from faster_whisper import WhisperModel
m=WhisperModel(os.environ.get('MODEL','large-v3'),device='cpu',compute_type='int8')
for f in sorted(glob.glob('hisn/clips/*.m4a')):
    segs,_=m.transcribe(f,language='ar',word_timestamps=True,beam_size=5,condition_on_previous_text=False)
    w=[x.word.strip() for s in segs for x in (s.words or [])]
    print(f"CLIP {os.path.basename(f)} | FIRST: {' '.join(w[:4])} | LAST: {' '.join(w[-4:])} | WORDS {len(w)}",flush=True)
