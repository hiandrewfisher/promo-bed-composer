# Promo Bed Composer

Browser-based music bed composer with per-song instruments and effects.

Keep index.html, lib/ (scores), and sf/ (recorded instruments) together. GitHub Pages serves them from the same origin. Samples and scores load on demand. User voice recordings remain in the browser.

Third-party sample and score credits appear in the application. Their original licenses apply.


## Complete package

Use GitHub Download ZIP to get the app, all 227 score/sample files, asset checksums, and offline cache configuration together. Serve the extracted directory through any static HTTP server. The app uses native browser APIs and has no CDN scripts, package installation, or host-specific download bridge. GitHub Pages caches visited assets for offline reuse after the first online visit.

Instrument editors show the processed waveform and offer isolated playback with repeat. Effects refresh the audition before Apply changes updates the full song. Default music ducking is 7 dB, from -4 dB to -11 dB. Source choices are New composition and Public-domain score.


## Restricted previews

If an embedding preview blocks GitHub Pages connections through Content Security Policy, open the hosted app directly, or select the extracted repository folder using Load extracted app folder. Selected score and sample JSON files are read locally through the browser File API. The app preserves the embedding security policy and stops a blocked generation batch after its first dependency failure.
