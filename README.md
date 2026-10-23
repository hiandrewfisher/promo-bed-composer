# Promo Bed Composer

Browser music-bed composer with editable instruments, channel effects, waveforms and repeat audition. Voice recordings remain in the browser.

## Score fidelity

Every new bed starts with a distinct piece from the 4,418-piece public-domain collection.

- 100% Stored score: preserves the encoded melody pitches, note onsets, note lengths, and chord-change timing in a reference piano reduction before optional performance humanization.
- 0% New arrangement: transforms that source melody, rhythmic phrasing, harmony, bass and percussion using the genre mix and a constrained harmonic plan.
- Intermediate values control the degree of transformation for every bed, rather than the probability of selecting a score.

The collection contains normalized melody and chord reductions. Original keys, original tempo markings and full orchestration were discarded in those source files. Faithful playback therefore uses a 120 BPM reference reading in the stored normalized key; it does not claim to reproduce the complete historical performance. The music-length setting controls excerpt duration.

Used source IDs, normalized titles and melody fingerprints are remembered locally. Recent near-duplicate melodic patterns are rejected. The app stops rather than silently reusing an exhausted source pool. Perceptual similarity across thousands of pieces cannot be ruled out by a numerical check.

## Musical structure

Tonal 6.5.1 supplies pitch-class, scale and chord definitions. A custom chord-first planner selects source-informed tonic, predominant and dominant functions, reserves a V7-to-tonic closing cadence and resolves phrase boundaries. A dynamic-programming voicer avoids crossing and parallel fifths/octaves in the harmonic core and resolves dominant leading tones and sevenths. The melodic planner favors chord tones on strong beats, stepwise passing notes and leap recovery. Auxiliary layers follow the active chord. Intentional orchestral octave doublings remain possible; this is not a claim of complete species-counterpoint validation across all layers.

Nominal score structure is planned before performance humanization. Chord notes share timing shifts, beat accents shape velocity, phrase arcs shape expression, sustained instruments receive subtle pitch drift and delayed vibrato, and piano pitch remains stable by default. Humanization is seeded and repeatable and can be disabled per instrument.

## Complete package

GitHub Download ZIP includes index.html, lib/ scores, sf/ recordings, vendor/ theory-library source and MIT license, asset checksums and cache configuration. Serve the extracted folder with a static HTTP server. The small Tonal bundle is included directly in the HTML; no CDN connection, Python runtime or package installation is needed. Previously visited assets are cached for offline reuse.

## Restricted previews

If a preview blocks hosted connections through Content Security Policy, open the hosted app directly or choose Load extracted app folder. The File API reads selected local score and sample files without relaxing that security policy.

## Editing

Open an instrument to view its processed waveform, play it in isolation and toggle Repeat. Effect changes update the audition before Apply changes updates the complete bed and exports. Sustain, release tails, reverb decay (up to 12 seconds), pre-delay, stereo delay, width, chorus, tremolo and humanization are adjustable alongside the existing EQ, delay, saturation, pan and amplitude controls. The selected bed length still determines the final output boundary. Default ducking is 7 dB, from -4 dB to -11 dB.

Third-party sample and score credits appear in the app. Their original licenses apply. Tonal attribution and MIT license are in vendor/TONAL-LICENSE.txt.
