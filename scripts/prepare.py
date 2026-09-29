import json, os, shutil
from faster_whisper import WhisperModel

FPS = 30
audio_src = os.environ["IN_AUDIO"]
scenes = json.loads(os.environ["IN_SCENES"])
theme = json.loads(os.environ["IN_THEME"])
title = os.environ["IN_TITLE"]

os.makedirs("public", exist_ok=True)
shutil.copy(audio_src, "public/voiceover.wav")

model = WhisperModel("base.en", compute_type="int8")
segments, info = model.transcribe("public/voiceover.wav", word_timestamps=True, language="en")
words = []
for seg in segments:
    for w in seg.words:
        words.append({"word": w.word.strip(), "start": w.start, "end": w.end})
audio_len = info.duration

counts = [max(1, len((s.get("narration") or s.get("text") or "").split())) for s in scenes]
total = sum(counts)
starts, cum = [], 0
for c in counts:
    idx = min(len(words) - 1, round(cum / total * len(words))) if words else 0
    starts.append(0.0 if cum == 0 or not words else words[idx]["start"])
    cum += c
end_time = audio_len + 0.6

out_scenes = []
for i, s in enumerate(scenes):
    t0 = starts[i]
    t1 = starts[i + 1] if i + 1 < len(scenes) else end_time
    s = dict(s)
    s["from"] = round(t0 * FPS)
    s["duration"] = max(15, round((t1 - t0) * FPS))
    out_scenes.append(s)

props = {
    "title": title,
    "theme": theme,
    "scenes": out_scenes,
    "words": [{"word": w["word"], "start": round(w["start"] * FPS), "end": round(w["end"] * FPS)} for w in words],
    "totalFrames": round(end_time * FPS),
    "hasMusic": os.path.exists("public/music.mp3"),
}
json.dump(props, open("props.json", "w"), indent=2)
for s in out_scenes:
    print("SCENE:", s.get("template"), "| action:", s.get("action"), "| text:", (s.get("text") or "")[:40])
print("frames:", props["totalFrames"], "scenes:", len(out_scenes), "words:", len(words))
