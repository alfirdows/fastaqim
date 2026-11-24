# Third-party licences and credits

Fastaqim's own code, text and design are © alfirdows, all rights reserved (see `LICENSE`).
The parts below were made by others. Each is used under its own free licence, and this file keeps the proof.

---

## Tilawa: "Recite from memory" (Qur'an recitation mistake checker)

| | |
|---|---|
| What it does in Fastaqim | Listens on the reader's own device and points out missed, changed or extra words and skipped parts |
| Where | `next/v6/vendor/tilawa/tilawa.mjs` (and `vendor/tilawa/` on the main page after go-live), used by `fq-recite.js` |
| Version | `@tilawa/core` 1.0.0-rc.1 (npm), source commit `3b4ece92055b4bed5b6d8ba293caa308e1bf5404` of github.com/yazinsai/tilawa |
| Code licence | **MIT**, © 2026 yazinsai. Full text: `next/v6/vendor/tilawa/LICENSE-tilawa.txt` (copied unchanged below) |
| Model licence | **CC BY 4.0** (https://creativecommons.org/licenses/by/4.0/). Credit required: "Tilawa (tilawa.dev)" and its sources (below) |
| Is it stored on Fastaqim's site? | Only the engine code (about 1 MB). The model (25 or 68 MB), the Qur'an reference and the runtime `.wasm` files are downloaded by each reader's browser from `https://tilawa.dev/v1/`, the address Tilawa provides for this, and kept in that browser. Nothing is copied to Fastaqim's storage. |
| Privacy | Runs fully on the device. Fastaqim never sends the reader's voice anywhere and does not use Tilawa's optional "send a report" feature. |
| Checked | 24 Nov 2026: `LICENSE`, `NOTICE.md` and `docs/model-card.md` in the Tilawa repository |
| Credit shown in the app | Qur'an reader › Recite from memory › "Listening engine: Tilawa (tilawa.dev) · Credits" |

What MIT means, in plain words: anyone may use, copy, change and share the software, free, as long as the copyright line and licence text stay with it. "Provided as is" means the author gives no guarantee and is not responsible if it makes a mistake. That is why Fastaqim tells readers that the marks are prompts, not a verdict.

What CC BY 4.0 means, in plain words: free to use and share, even in other projects, as long as the makers are credited and a link to the licence is given.

### Sources credited by the Tilawa model (from its NOTICE.md and model card)

- tlog, by Tarteel (CC BY): training and evaluation audio
- Quranic Universal Ayahs and the QUD alignment benchmark, by QUD Technologies (CC BY): training and evaluation audio
- muaalem (`obadx/muaalem-model-v3_2`, MIT): the teacher model and phoneme set
- quran-transcript (`obadx/quran-transcript` 0.6.4, MIT): phonemization of the reference
- k2-fsa icefall (Apache-2.0): model architecture, training recipe and export
- Tanzil (https://tanzil.net): the Uthmani Qur'an text the reference is made from
- The model card also notes that some training sources carry no licence tag and were used "at the project's own risk" (Tilawa's training, not Fastaqim's use). Tilawa released the finished model under CC BY 4.0.
- Tilawa's older 0.x model (NPL-1.2, Quran-Lab) is **not** used: version 1.x excludes it.

### Tilawa licence (MIT), unchanged

```
MIT License

Copyright (c) 2026 yazinsai

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## ONNX Runtime Web (runs the Tilawa model in the browser)

- `onnxruntime-web` 1.30.0, © Microsoft Corporation, **MIT**. Bundled inside `tilawa.mjs`. Full text: `next/v6/vendor/tilawa/LICENSE-onnxruntime.txt`.

## html2canvas-pro (save a picture of a card)

- `vendor/h2c.min.js`, html2canvas-pro 2.5.0, **MIT**.
