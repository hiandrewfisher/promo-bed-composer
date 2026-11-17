# Build

`index.html` at the repo root is generated. To rebuild it:

```bash
cd src
python3 build.py
for i in $(seq 2 27) $(seq 29 46); do python3 patch$i.py; done
```

`build.py` concatenates the engine sources into `index.html`; each `patch*.py`
then applies one change to that generated file, asserting its anchor text
occurs exactly once so a silent miss fails the build. `hum*.py` are one-shot
edits already applied to `engine.js` / `composer.js` and kept for history —
do not re-run them.

Sources, in the order the build reads them:

| file | what it holds |
|---|---|
| `engine.js` | the synthesis and mix engine: instruments, note playback, channel strips, mastering, the offline renderer |
| `composer.js` | tempo, key, chord choice, section structure, groove selection |
| `arranger.js` | role assignment and part writing |
| `pieces.js` | the public-domain score library loader |
| `score.js` | score parsing and transposition |
| `session.js` | The Session tune index |
| `tonal.min.js` | Tonal.js (MIT), for chord and key theory |

## Build gate

`smoke.py` is the gate. It needs a local server and a voice WAV:

```bash
python3 -m http.server 8765 &
python3 smoke.py
```

It loads the page, feeds it a read, changes the bed length, generates a bed,
checks the row controls and rating chips, and fails on any console error.
Nothing should be published that it does not pass.

## Sample library

`sf/` holds the instrument banks as base64 MP3 inside JSON, one file per
instrument, grouped by source library: `hq`, `rx`, `sy`, `kit`.
`lib/` holds the public-domain scores the composer arranges from.

`LOCAL` in `engine.js` maps each font code to its folder. A code with no entry
there cannot be loaded at all — four such folders (`fb`, `fl`, `mk`, `dr`,
240 MB) were carried for several versions before being removed.
