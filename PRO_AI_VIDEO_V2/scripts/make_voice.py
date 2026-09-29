import asyncio
import os
from pathlib import Path
import edge_tts

TEXT = os.environ.get("SCRIPT_TEXT", "").strip()
LANG = os.environ.get("LANGUAGE", "en").lower()
OUT = Path("public/voiceover.mp3")
OUT.parent.mkdir(parents=True, exist_ok=True)

VOICES = {
    "en": "en-US-JennyNeural",
    "sv": "sv-SE-SofieNeural",
}

if not TEXT:
    raise SystemExit("SCRIPT_TEXT is empty")

voice = VOICES.get(LANG, VOICES["en"])

async def main():
    communicate = edge_tts.Communicate(TEXT, voice=voice, rate="+3%", pitch="0Hz")
    await communicate.save(str(OUT))

asyncio.run(main())
print(f"Voice generated with {voice}: {OUT}")
