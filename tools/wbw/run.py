"""Word timings, per ayah, for the word-by-word highlight (Saad al-Ghamdi for Fastaqim, Ibrahim Al-Akhdar for Itqan).

Uses quran-word-align (MIT code, MIT model quran-asr-tiny) on the same per-ayah recordings the app plays
(EveryAyah Ghamadi_40kbps). Each recording holds exactly one ayah, so each is aligned on its own with no
neighbouring words. Writes data/wbw/<reciter>/<surah>.json: {"<ayah>": [[word, start_ms, end_ms], ...]}.

  python tools/wbw/run.py 1 114 [ghamdi|akhdar]   # surahs 1..114 (inclusive); Ghamdi for Fastaqim, Ibrahim Al-Akhdar for Itqan
"""
import json
import sys
import time
import urllib.request
from pathlib import Path

import quran_word_align.align as A

# reciter key -> EveryAyah per-ayah folder (the same files the sites play)
RECITERS = {"ghamdi": "Ghamadi_40kbps", "akhdar": "Ibrahim_Akhdar_32kbps"}
SRC = "https://everyayah.com/data/{f}/{s:03}{a:03}.mp3"
CACHE = Path("/tmp/wbw-audio")
OUT = Path("data/wbw/ghamdi")
FOLDER = RECITERS["ghamdi"]


def fetch(s: int, a: int) -> Path:
    p = CACHE / f"{s:03}{a:03}.mp3"
    if p.exists() and p.stat().st_size > 0:
        return p
    p.parent.mkdir(parents=True, exist_ok=True)
    for t in range(5):
        try:
            req = urllib.request.Request(SRC.format(f=FOLDER, s=s, a=a), headers={"User-Agent": "fastaqim-wbw"})
            with urllib.request.urlopen(req, timeout=120) as r:
                p.write_bytes(r.read())
            return p
        except Exception as e:  # network hiccup: wait and retry
            print("retry", s, a, e, flush=True)
            time.sleep(2 + 3 * t)
    raise RuntimeError(f"could not download {s}:{a}")


def main() -> None:
    global OUT, FOLDER
    first, last = int(sys.argv[1]), int(sys.argv[2])
    rec = sys.argv[3] if len(sys.argv) > 3 else "ghamdi"
    FOLDER, OUT = RECITERS[rec], Path("data/wbw") / rec
    A.CONTEXT = 0  # one ayah per recording: no neighbouring words in the audio
    words, model = A.hafs_words(), A.Model()
    OUT.mkdir(parents=True, exist_ok=True)
    for s in range(first, last + 1):
        ayat = sorted(a for (su, a) in words if su == s)
        res, t0 = {}, time.time()
        for a in ayat:
            p = fetch(s, a)
            n = len(A.decode(p)) / A.SAMPLE_RATE
            try:
                r = A.align_recording(s, p, [(a, 0.0, n, int(n * 1000))], words, model, margin=0.0)
                res[str(a)] = r.get(a, [])
            except Exception as e:
                print("skip", s, a, e, flush=True)
            p.unlink(missing_ok=True)
        (OUT / f"{s:03}.json").write_text(json.dumps(res, separators=(",", ":")), encoding="utf-8")
        print(f"surah {s}: {len(res)}/{len(ayat)} ayat in {time.time() - t0:.0f}s", flush=True)


if __name__ == "__main__":
    main()
