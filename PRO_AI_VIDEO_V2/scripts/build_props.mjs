import fs from "node:fs";

const scenes = JSON.parse(fs.readFileSync("scenes.json", "utf8"));
const words = JSON.parse(fs.readFileSync("words.json", "utf8"));
const fps = 30;

if (!Array.isArray(scenes) || scenes.length < 5 || scenes.length > 7) {
  throw new Error(`Need 5-7 scenes, got ${scenes?.length ?? 0}`);
}
if (!Array.isArray(words) || words.length < 10) throw new Error("Need word timestamps");

const countWords = (s) => String(s || "").trim().split(/\s+/).filter(Boolean).length;
const sceneWordCounts = scenes.map((s) => countWords(s.narration));
const totalNarrationWords = sceneWordCounts.reduce((a, b) => a + b, 0);
if (totalNarrationWords < 90 || totalNarrationWords > 120) {
  throw new Error(`Narration must contain 90-120 words, got ${totalNarrationWords}`);
}

const audioDuration = Math.max(1, Number(words[words.length - 1].end) + 0.18);
const normalized = [];
let wordCursor = 0;
let frameCursor = 0;

for (let i = 0; i < scenes.length; i++) {
  const count = sceneWordCounts[i];
  const startWord = words[wordCursor];
  const endWord = words[wordCursor + count - 1];
  if (!startWord || !endWord) throw new Error(`Could not map scene ${i + 1} to transcript words`);

  const startSec = i === 0 ? 0 : Math.max(0, Number(startWord.start) - 0.03);
  const endSec = i === scenes.length - 1 ? audioDuration : Math.max(startSec + 0.25, Number(endWord.end) + 0.04);
  let from = Math.round(startSec * fps);
  let duration = Math.max(Math.round(0.25 * fps), Math.round((endSec - startSec) * fps));
  if (i === 0) from = 0;
  if (i > 0 && from < frameCursor) from = frameCursor;

  normalized.push({ ...scenes[i], from, duration });
  frameCursor = from + duration;
  wordCursor += count;
}

const totalFrames = Math.max(frameCursor, Math.ceil(audioDuration * fps));
const props = {
  title: String(process.env.VIDEO_TITLE || "AI Short"),
  theme: JSON.parse(process.env.THEME_JSON || '{"background":"#0c1220","accent":"#52d8ff","text":"#ffffff","accent2":"#ff7aa8"}'),
  scenes: normalized,
  words: words.map((w) => ({
    word: String(w.word || "").trim(),
    start: Math.max(0, Math.round(Number(w.start) * fps)),
    end: Math.max(0, Math.round(Number(w.end) * fps)),
  })),
  totalFrames,
  hasMusic: false,
};

fs.writeFileSync("props.json", JSON.stringify(props, null, 2));
console.log(`Audio duration: ${audioDuration.toFixed(2)}s`);
console.log(`Frames: ${totalFrames}`);
console.log(`Scenes: ${normalized.length}`);
