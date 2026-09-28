import json, os, shutil, urllib.parse, re
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

# ---------------- whisper: align each scene to when its narration is actually spoken ----------------
# Every scene now switches its visual exactly when its narration line begins in the audio,
# instead of an estimated word-count split. This is what keeps visuals + text + voice in sync.
model = WhisperModel("base.en", compute_type="int8")
segments, info = model.transcribe("public/voiceover.wav", word_timestamps=True, language="en")
words = []
for seg in segments:
    for w in seg.words:
        words.append({"word": w.word.strip(), "start": float(w.start), "end": float(w.end)})
audio_len = info.duration

def norm(t):
    return re.sub(r"[^a-z0-9]", "", (t or "").lower())

# Flatten the spoken transcript into a normalized token stream we can search.
norm_words = [norm(w["word"]) for w in words]

def find_start_time(narration, search_from_idx):
    """Return (start_time, next_search_idx) by locating this scene's narration
    text in the transcript, starting at or after search_from_idx. Falls back to
    a proportional estimate if no reliable match is found."""
    toks = [norm(t) for t in (narration or "").split() if norm(t)]
    if not words:
        return 0.0, search_from_idx
    if not toks:
        idx = min(search_from_idx, len(words) - 1)
        return words[idx]["start"], search_from_idx
    anchor = toks[: min(4, len(toks))]
    best_idx = None
    for j in range(search_from_idx, len(norm_words)):
        if norm_words[j] == anchor[0]:
            ok = True
            for k in range(1, len(anchor)):
                if j + k >= len(norm_words) or norm_words[j + k] != anchor[k]:
                    ok = False
                    break
            if ok:
                best_idx = j
                break
    if best_idx is None:
        for j in range(search_from_idx, len(norm_words)):
            if norm_words[j] == anchor[0]:
                best_idx = j
                break
    if best_idx is None:
        return words[min(search_from_idx, len(words) - 1)]["start"], search_from_idx
    next_idx = best_idx + len(toks)
    return words[best_idx]["start"], next_idx

starts = []
cursor = 0
for i, s in enumerate(scenes):
    if i == 0:
        starts.append(0.0)
        _, cursor = find_start_time(s.get("narration") or s.get("text"), 0)
        continue
    t0, cursor = find_start_time(s.get("narration") or s.get("text"), cursor)
    if starts and t0 < starts[-1] + 0.3:
        t0 = starts[-1] + 0.3
    starts.append(t0)

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
for i, s in enumerate(out_scenes):
    print(f"  scene {i}: from={s['from']} dur={s['duration']} :: {(s.get('narration') or s.get('text'))[:50]}")
