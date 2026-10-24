# Promo Bed Composer

Browser music-bed composer with editable instruments, channel effects, waveforms and repeat audition. Voice recordings remain in the browser.

## Musical discovery

The packaged corpus contains 4,418 score reductions. An offline JavaScript scan evaluated 259,364 measure-aligned passages and retained 51,645 candidates. These are passages within the existing scores, rather than additional compositions.

Candidate windows span 1, 2, 4 or 8 measures. Ranking measures motif repetition and contour (25%), groove and rhythm (20%), harmonic support (15%), loop closure (20%), balanced variation (10%) and melodic movement (10%). These are transparent musical heuristics, rather than a trained hit-prediction model. Genre settings affect source and passage selection as well as orchestration.

The arranger keeps the selected hook's written pitches, rhythm and supporting stored chords. Register changes use a uniform octave shift. A sequence search weighs passage quality and transitions, plans an answer or contrasting passage and returns to the hook. Accompaniment, bass, drums and occasional supporting layers change energy through the sections. A generated dominant-to-tonic cadence closes longer excerpts. Short clips use a compact statement and tonic ending. Drum patterns follow the source measure length, and the harmonic core avoids parallel fifths and octaves through constrained voice leading.

The engine replaces the previous random melody scrambling and unrelated reharmonization path. Source information and the planned section sequence appear in each bed's details. The arrangement uses at most five pitched roles to keep the hook clear.

## Score fidelity

- 0% New arrangement, the default: develops ranked passages in the selected genre mix while preserving their melodic identity and supporting harmony.
- Intermediate settings bring the reference tempo and source sequence further into the arrangement.
- 100% Stored score: preserves the complete stored melody pitches, onsets, note lengths and chord timing in a reference piano reduction, before optional performance humanization.

The collection contains normalized melody and chord reductions, including automatically harmonized melody-only tunes. Original keys, tempo markings and full orchestration are absent from those source files. Stored-score playback uses a 120 BPM reference reading in the normalized key. The music-length setting determines the excerpt duration.

Used source IDs, normalized titles and melody fingerprints are remembered locally. Recent near-duplicate source patterns are rejected. Similarity between newly arranged music and its public-domain source is allowed and intentional.

## Complete package

GitHub Download ZIP includes index.html, lib/ scores and discovery index, sf/ recordings, vendor/ Tonal source and MIT license, checksums, cache configuration and development scripts. Serve the extracted folder with a static HTTP server. Tonal and the discovery/arrangement logic are included directly in the HTML. Runtime playback uses native browser APIs and packaged assets. Previously visited assets are cached for offline reuse.

To rebuild the discovery index from the packaged scores, run `node scripts/build-discovery.cjs` from the repository root. Run `node scripts/sync-engine.cjs` after changing the discovery, hook-arranger or faithful-score source modules to update their inline copies. Keep changes to the inline core theory functions in index.html.

## Restricted previews

If a preview blocks hosted connections through Content Security Policy, open the hosted app directly or choose Load extracted app folder. The File API reads selected local score and sample files while preserving the security policy.

## Editing

Open an instrument to view its processed waveform, play it in isolation and toggle Repeat. Effect changes update the audition before Apply changes updates the complete bed and exports. Sustain, release tails, reverb decay, pre-delay, stereo delay, width, chorus, tremolo and humanization are adjustable alongside EQ, delay, saturation, pan and amplitude. Humanization uses repeatable performer timing, metrical velocity accents and phrase expression; piano pitch remains stable by default. The selected bed length determines the output boundary. Default voice ducking spans 7 dB, from -4 dB to -11 dB.

## Validation

From the repository root with Node installed:

- `node tests/verify-discovery.cjs`: all 19 genres, major/minor, 6/25/60-second excerpts, source-hook pitch/rhythm preservation, motif returns, blended-genre parity, register limits, deterministic humanization and parallel-free harmonic voices.
- `node tests/check-corpus-arrangements.cjs`: 260 compositions sampled across the corpus and all genres.
- `node tests/verify-score-engine.cjs`: stored-score endpoint, slider differences, deterministic composition, 128 unique sources and persistent source history.

Browser tests require Playwright and Chrome; set PLAYWRIGHT_PATH if the package is installed outside the standard module path. They verify generated waveforms, repeat playback, effect amplitude, longer tails, stereo energy, mobile layout and the restricted-preview folder workflow. Third-party sample and score credits appear in the app. Their original licenses apply. Tonal's MIT license is in vendor/TONAL-LICENSE.txt.
