# Font subsets

These files are self-hosted WOFF2 subsets of Google Fonts. The text faces are
full printable Latin-1 plus General Punctuation and arrows, so new records with
accented names or curly quotes do not silently fall back. The italic face is
still a one-word subset because only `Unavailable` is italic.

| File | Family / style | Weight | Size | Subset |
| --- | --- | --- | ---: | --- |
| `fraunces-normal-var.woff2` | Fraunces normal | 400 to 500 | 25,360 B | printable Latin-1, General Punctuation, arrows; optical size pinned at 110 |
| `fraunces-italic-unavailable.woff2` | Fraunces italic | 400 | 3,528 B | only `Unavailable` (the sole italic text on the site) |
| `public-sans-var.woff2` | Public Sans normal | 400 to 600 | 19,536 B | printable Latin-1, General Punctuation, arrows |
| `ibm-plex-mono-400.woff2` | IBM Plex Mono normal | 400 | 12,092 B | printable Latin-1, General Punctuation, arrows |
| `ibm-plex-mono-500.woff2` | IBM Plex Mono normal | 500 | 12,292 B | printable Latin-1, General Punctuation, arrows |

Total payload: **72,808 B**.

## Preload policy

Only faces measured in the initial viewport are preloaded:

- Home: Fraunces normal, Fraunces italic, IBM Plex Mono 400, IBM Plex Mono 500.
- Film record: Fraunces normal, Public Sans, IBM Plex Mono 400, IBM Plex Mono 500.
- Hard-to-find index: Fraunces normal, Public Sans, IBM Plex Mono 400, IBM Plex Mono 500.

Public Sans is below the fold on the home page, so it is not preloaded there; it loads through `@font-face` with `font-display: swap`. Fraunces italic is only used by the home hero, so it is not requested on the record or index pages.

The files were produced with `fonttools`/`pyftsubset` and `varLib.instancer`.
That tool is not part of the site build and is not a runtime dependency. The
build only copies these prepared files. If site copy adds characters outside
these subsets, regenerate the WOFF2 files; the italic face is intentionally
limited to the current single word.

OFL licences for the three families are included here.
