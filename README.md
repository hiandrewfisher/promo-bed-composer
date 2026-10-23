# Promo Bed Composer

Browser music-bed composer with editable instruments, channel effects, waveforms and repeat audition. Voice recordings remain in the browser.

## Score fidelity

Every new bed starts with a distinct piece from the 4,418-piece public-domain collection.

- 100% Stored score: preserves the encoded melody pitches, note onsets, note lengths, and chord-change timing in a reference piano reduction.
- 0% New arrangement: transforms that source melody, rhythmic phrasing, harmony, bass and percussion using the genre mix.
- Intermediate values control the degree of transformation for every bed, rather than the probability of selecting a score.

The collection contains normalized melody and chord reductions. Original keys, original tempo markings and full orchestration were discarded in those source files. Faithful playback therefore uses a 120 BPM reference reading in the stored normalized key; it does not claim to reproduce the complete historical performance. The music-length setting controls excerpt duration.

Used source IDs, normalized titles and melody fingerprints are remembered locally. Recent near-duplicate melodic patterns are rejected. The app stops rather than silently reusing an exhausted source pool. Perceptual similarity across thousands of pieces cannot be ruled out by a numerical check.

## Complete package

GitHub Download ZIP includes index.html, lib/ scores, sf/ recordings, asset checksums and cache configuration. Serve the extracted folder with a static HTTP server. All runtime functionality uses native browser APIs; there are no CDN scripts or npm runtime dependencies. Previously visited assets are cached for offline reuse.

## Restricted previews

If a preview blocks hosted connections through Content Security Policy, open the hosted app directly or choose Load extracted app folder. The File API reads selected local score and sample files without relaxing that security policy.

## Editing

Open an instrument to view its processed waveform, play it in isolation and toggle Repeat. Effect changes update the audition before Apply changes updates the complete bed and exports. Default ducking is 7 dB, from -4 dB to -11 dB.

Third-party sample and score credits appear in the app. Their original licenses apply.
