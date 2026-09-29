# PRO AI VIDEO V2 — installation

This replaces the broken handoff between n8n and the GitHub renderer with one consistent contract.

## GitHub
Replace the repository files with this package:
- package.json
- tsconfig.json
- remotion.config.ts
- src/index.tsx
- src/Short.tsx
- src/types.ts
- src/cartoon/primitives.tsx
- src/cartoon/CartoonStory.tsx
- scripts/make_voice.py
- scripts/transcribe.py
- scripts/build_props.mjs
- .github/workflows/render-video.yml

Commit to `main`.

## n8n
Import `n8n_PRO_AI_VIDEO_V2.json`.
It keeps your existing Groq and GitHub credentials but replaces the old visual prompt and scene normalizer.

## First test
Run the n8n workflow manually. Then open GitHub → Actions → Render Video.
A successful run must show these steps in order:
1. Scene plan validation passed
2. Generate AI voice
3. Normalize voice audio
4. Create word-level captions
5. Build Remotion props
6. Render Remotion video
7. Verify final video

The final file is written to `videos/latest.mp4` and also uploaded as an Actions artifact.
