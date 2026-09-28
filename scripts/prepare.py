import json, os, shutil, urllib.parse
import requests
from faster_whisper import WhisperModel

FPS = 30
audio_src = os.environ["IN_AUDIO"]
scenes = json.loads(os.environ["IN_SCENES"])
theme = json.loads(os.environ["IN_THEME"])
title = os.environ["IN_TITLE"]
PEXELS_KEY = os.environ.get("PEXELS_API_KEY", "").strip()

os.makedirs("public", exist_ok=True)
shutil.copy(audio_src, "public/voiceover.wav")

# ---------------- media fetching (free) ----------------
# AI picks per scene: "stock" -> Pexels real photo/footage, "ai" -> Pollinations generated art.
# Pexels needs a free key (repo secret PEXELS_API_KEY). If absent or a lookup fails,
# we fall back to Pollinations so the render never breaks and stays fully free.

def get_json(url, headers=None):
    r = requests.get(url, headers=headers or {}, timeout=30)
    r.raise_for_status()
    return r.json()

def download(url, path):
    try:
        r = requests.get(url, timeout=90, stream=True)
        r.raise_for_status()
        with open(path, "wb") as f:
            for chunk in r.iter_content(8192):
                f.write(chunk)
        return os.path.getsize(path) > 1500
    except Exception as e:
        print("download failed:", url[:80], e)
        return False

def pexels_photo(query):
    if not PEXELS_KEY:
        return None
    try:
        q = urllib.parse.urlencode({"query": query, "orientation": "portrait", "per_page": 1, "size": "large"})
        data = get_json("https://api.pexels.com/v1/search?" + q, {"Authorization": PEXELS_KEY})
        photos = data.get("photos", [])
        if not photos:
            return None
        src = photos[0]["src"]
        return src.get("portrait") or src.get("large2x") or src.get("original")
    except Exception as e:
        print("pexels photo err:", e)
        return None

def pexels_video(query):
    if not PEXELS_KEY:
        return None
    try:
        q = urllib.parse.urlencode({"query": query, "orientation": "portrait", "per_page": 1, "size": "medium"})
        data = get_json("https://api.pexels.com/videos/search?" + q, {"Authorization": PEXELS_KEY})
        vids = data.get("videos", [])
        if not vids:
            return None
        files = [f for f in vids[0].get("video_files", []) if f.get("file_type") == "video/mp4" and f.get("link")]
        if not files:
            return None
        files.sort(key=lambda f: abs(1920 - (f.get("height") or 0)))
        return files[0]["link"]
    except Exception as e:
        print("pexels video err:", e)
        return None

def pollinations_url(prompt):
    seed = abs(hash(prompt)) % 100000
    params = urllib.parse.urlencode({"width": 1080, "height": 1920, "nologo": "true", "seed": seed, "model": "flux"})
    return "https://image.pollinations.ai/prompt/" + urllib.parse.quote(prompt[:400]) + "?" + params

for i, s in enumerate(scenes):
    vis = s.get("visual") or {}
    source = (vis.get("source") or "ai").lower()
    media_pref = (vis.get("media") or "image").lower()
    query = (vis.get("query") or s.get("text") or title or "abstract").strip()
    ai_prompt = (vis.get("ai_prompt") or query).strip()
    media_file = None
    media_type = None

    if source == "stock":
        if media_pref == "video":
            link = pexels_video(query)
            if link and download(link, f"public/media_{i}.mp4"):
                media_file, media_type = f"media_{i}.mp4", "video"
        if not media_file:
            link = pexels_photo(query)
            if link and download(link, f"public/media_{i}.jpg"):
                media_file, media_type = f"media_{i}.jpg", "image"

    if not media_file:  # ai source, or stock fell through
        if download(pollinations_url(ai_prompt), f"public/media_{i}.jpg"):
            media_file, media_type = f"media_{i}.jpg", "image"

    s["media_file"] = media_file
    s["media_type"] = media_type
    print(f"scene {i}: source={source} pref={media_pref} -> {media_file} ({media_type})")

# ---------------- whisper: scene time-alignment only (no captions) ----------------
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
    "words": [],
    "totalFrames": round(end_time * FPS),
    "hasMusic": os.path.exists("public/music.mp3"),
}
json.dump(props, open("props.json", "w"), indent=2)
print("frames:", props["totalFrames"], "scenes:", len(out_scenes))
