import json
import sys
from pathlib import Path
from faster_whisper import WhisperModel

AUDIO = Path(sys.argv[1])
OUT = Path(sys.argv[2])
LANG = sys.argv[3] if len(sys.argv) > 3 else "en"

model = WhisperModel("small", device="cpu", compute_type="int8")
segments, _ = model.transcribe(str(AUDIO), language=LANG, word_timestamps=True, vad_filter=True)

words = []
for segment in segments:
    if not segment.words:
        continue
    for word in segment.words:
        text = (word.word or "").strip()
        if not text:
            continue
        words.append({
            "word": text,
            "start": float(word.start),
            "end": float(word.end),
        })

if not words:
    raise SystemExit("No word timestamps returned by Whisper")

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(words, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"Wrote {len(words)} word timestamps to {OUT}")
