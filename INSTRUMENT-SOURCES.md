# Expanded instrument catalog

v163 adds 118 General MIDI sample-based presets (FluidR3 GM, rendered by Benjamin Gleitzman's MIDI.js Soundfonts project) and 14 separate VCSL acoustic recording banks. The latter include alternate articulations; these are entries, not necessarily unique physical instruments. Existing local recordings remain preferred. The optional external samples load by note on demand from the two public hosts; no voice data is sent. No new binary sample files are bundled. Availability can vary with network access. Local same-kind substitutes are disclosed in render metadata and excluded from instrument preference learning.

## Sources
- FluidR3 GM: Frank Wen, copyright (c) 2000–2002, 2008. MIT license. https://github.com/gleitz/midi-js-soundfonts/tree/gh-pages/FluidR3_GM ; original license reference: https://sources.debian.org/src/musescore-general-soundfont/0.2.1-1/documentation/MuseScore_General_HQ_License.md/ . MIDI.js Soundfonts pre-rendered samples: Benjamin Gleitzman, https://gleitz.github.io/midi-js-soundfonts/ .
- Versilian Community Sample Library: Versilian Studios LLC and contributors, CC0 1.0, https://github.com/sgossner/VCSL . Pitch/path index from https://github.com/felixroos/dough-samples/blob/main/vcsl.json . https://creativecommons.org/publicdomain/zero/1.0/

MIT license notice for FluidR3:

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Study
The automatic profiler measures original decoded samples before normalization; manual Study instruments auditions up to eight banks with three representative pitches each, sequentially. Profiles are stored locally as numeric features only. The current producer uses estimated suitability, register-specific attack, sustain, spectral overlap and conservative rating history. It does not model acoustic instruments physically in full, and rendered GM presets are not new field recordings.
